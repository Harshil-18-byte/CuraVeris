"""CuraVeris-4B: Custom 4 Billion Parameter Dense Transformer Architecture from Scratch.

Architecture Specifications (~4.02B Parameters):
- Layers: 36
- Hidden Dimension (d_model): 2816
- Attention Heads: 22 (Head dim: 128)
- KV Heads (GQA): 4 (Grouped Query Attention)
- Feed-Forward Dimension (SwiGLU): 7680
- Vocabulary Size: 64,000 (Clinical, Pharmaceutical, Gazette & Billing tokens)
- Max Position Embeddings: 8,192 (RoPE Rotary Position Embeddings)
- Normalization: RMSNorm (eps=1e-6)
- Multi-Task Heads: Causal LM, Anomaly Risk Classification (7-class), Restitution Regression
"""

import math
from dataclasses import dataclass
from typing import Optional, Tuple, Dict, Any, List

import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass
class CuraVeris4BConfig:
    vocab_size: int = 64000
    hidden_size: int = 3072
    intermediate_size: int = 8704
    num_hidden_layers: int = 36
    num_attention_heads: int = 24
    num_key_value_heads: int = 4
    max_position_embeddings: int = 8192
    rms_norm_eps: float = 1e-6
    rope_theta: float = 10000.0
    num_anomaly_classes: int = 7
    dropout_rate: float = 0.05
    initializer_range: float = 0.02

    @property
    def total_parameters(self) -> int:
        """Computes exact theoretical parameter count (~4.02B)."""
        embed_params = self.vocab_size * self.hidden_size
        head_dim = self.hidden_size // self.num_attention_heads

        # Attention: Q + K + V + O
        q_proj = self.hidden_size * (self.num_attention_heads * head_dim)
        kv_proj = 2 * (self.hidden_size * (self.num_key_value_heads * head_dim))
        o_proj = (self.num_attention_heads * head_dim) * self.hidden_size
        attn_params = q_proj + kv_proj + o_proj

        # SwiGLU MLP: Gate + Up + Down
        mlp_params = 3 * (self.hidden_size * self.intermediate_size)

        # Norms: 2 * hidden_size
        norm_params = 2 * self.hidden_size

        layer_params = attn_params + mlp_params + norm_params
        total_layers = self.num_hidden_layers * layer_params

        # Final Norm + LM Head
        final_norm = self.hidden_size
        lm_head = self.vocab_size * self.hidden_size

        return embed_params + total_layers + final_norm + lm_head


class RMSNorm(nn.Module):
    """Root Mean Square Layer Normalization."""

    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        variance = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(variance + self.eps) * self.weight


class RotaryEmbedding(nn.Module):
    """Rotary Positional Embeddings (RoPE)."""

    def __init__(self, dim: int, max_seq_len: int = 8192, base: float = 10000.0):
        super().__init__()
        self.dim = dim
        self.max_seq_len = max_seq_len
        self.base = base
        inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer("inv_freq", inv_freq, persistent=False)

    def forward(self, seq_len: int, device: torch.device) -> Tuple[torch.Tensor, torch.Tensor]:
        t = torch.arange(seq_len, device=device, dtype=torch.float32)
        freqs = torch.outer(t, self.inv_freq.to(device))
        emb = torch.cat((freqs, freqs), dim=-1)
        return emb.cos(), emb.sin()


def apply_rotary_pos_emb(x: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor) -> torch.Tensor:
    """Rotates half of the hidden dims using RoPE cos/sin."""
    half = x.shape[-1] // 2
    x1, x2 = x[..., :half], x[..., half:]
    rotate_half = torch.cat((-x2, x1), dim=-1)
    return (x * cos) + (rotate_half * sin)


class GroupedQueryAttention4B(nn.Module):
    """GQA with 22 Query Heads and 4 Key/Value Heads for 4B Scale."""

    def __init__(self, config: CuraVeris4BConfig):
        super().__init__()
        self.hidden_size = config.hidden_size
        self.num_heads = config.num_attention_heads
        self.num_kv_heads = config.num_key_value_heads
        self.head_dim = config.hidden_size // self.num_heads
        self.num_kv_groups = self.num_heads // self.num_kv_heads

        self.q_proj = nn.Linear(self.hidden_size, self.num_heads * self.head_dim, bias=False)
        self.k_proj = nn.Linear(self.hidden_size, self.num_kv_heads * self.head_dim, bias=False)
        self.v_proj = nn.Linear(self.hidden_size, self.num_kv_heads * self.head_dim, bias=False)
        self.o_proj = nn.Linear(self.num_heads * self.head_dim, self.hidden_size, bias=False)

    def forward(
        self,
        hidden_states: torch.Tensor,
        cos: torch.Tensor,
        sin: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        bsz, q_len, _ = hidden_states.shape

        q = self.q_proj(hidden_states).view(bsz, q_len, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(hidden_states).view(bsz, q_len, self.num_kv_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(hidden_states).view(bsz, q_len, self.num_kv_heads, self.head_dim).transpose(1, 2)

        # Apply RoPE
        cos = cos[:q_len].unsqueeze(0).unsqueeze(0)
        sin = sin[:q_len].unsqueeze(0).unsqueeze(0)
        q = apply_rotary_pos_emb(q, cos, sin)
        k = apply_rotary_pos_emb(k, cos, sin)

        # Repeat KV heads for GQA
        if self.num_kv_groups > 1:
            k = k.repeat_interleave(self.num_kv_groups, dim=1)
            v = v.repeat_interleave(self.num_kv_groups, dim=1)

        scale = 1.0 / math.sqrt(self.head_dim)
        attn_weights = torch.matmul(q, k.transpose(-2, -1)) * scale

        if attention_mask is not None:
            attn_weights = attn_weights + attention_mask

        attn_weights = F.softmax(attn_weights, dim=-1, dtype=torch.float32).to(q.dtype)
        output = torch.matmul(attn_weights, v)

        output = output.transpose(1, 2).contiguous().view(bsz, q_len, -1)
        return self.o_proj(output)


class SwiGLUFeedForward4B(nn.Module):
    """SwiGLU Feed-Forward Network for 4B Model."""

    def __init__(self, config: CuraVeris4BConfig):
        super().__init__()
        self.gate_proj = nn.Linear(config.hidden_size, config.intermediate_size, bias=False)
        self.up_proj = nn.Linear(config.hidden_size, config.intermediate_size, bias=False)
        self.down_proj = nn.Linear(config.intermediate_size, config.hidden_size, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.down_proj(F.silu(self.gate_proj(x)) * self.up_proj(x))


class TransformerBlock4B(nn.Module):
    """Single CuraVeris-4B Transformer Layer."""

    def __init__(self, config: CuraVeris4BConfig):
        super().__init__()
        self.input_layernorm = RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.self_attn = GroupedQueryAttention4B(config)
        self.post_attention_layernorm = RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.mlp = SwiGLUFeedForward4B(config)

    def forward(
        self,
        hidden_states: torch.Tensor,
        cos: torch.Tensor,
        sin: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        normed_attn = self.input_layernorm(hidden_states)
        attn_out = self.self_attn(normed_attn, cos, sin, attention_mask=attention_mask)
        hidden_states = hidden_states + attn_out

        normed_mlp = self.post_attention_layernorm(hidden_states)
        mlp_out = self.mlp(normed_mlp)
        hidden_states = hidden_states + mlp_out

        return hidden_states


class CuraVeris4BForCausalLM(nn.Module):
    """Full 4-Billion Parameter Causal Language Model & Audit Intelligence Transformer."""

    def __init__(self, config: Optional[CuraVeris4BConfig] = None):
        super().__init__()
        self.config = config or CuraVeris4BConfig()
        self.embed_tokens = nn.Embedding(self.config.vocab_size, self.config.hidden_size)
        self.rotary_emb = RotaryEmbedding(
            dim=self.config.hidden_size // self.config.num_attention_heads,
            max_seq_len=self.config.max_position_embeddings,
            base=self.config.rope_theta
        )
        self.layers = nn.ModuleList([TransformerBlock4B(self.config) for _ in range(self.config.num_hidden_layers)])
        self.norm = RMSNorm(self.config.hidden_size, eps=self.config.rms_norm_eps)
        self.lm_head = nn.Linear(self.config.hidden_size, self.config.vocab_size, bias=False)

        # Multi-Task Prediction Heads
        self.anomaly_classifier_head = nn.Linear(self.config.hidden_size, self.config.num_anomaly_classes)
        self.restitution_regression_head = nn.Linear(self.config.hidden_size, 1)

        self._init_weights()

    def _init_weights(self):
        for module in self.modules():
            if isinstance(module, nn.Linear):
                torch.nn.init.normal_(module.weight, mean=0.0, std=self.config.initializer_range)
                if module.bias is not None:
                    torch.nn.init.zeros_(module.bias)
            elif isinstance(module, nn.Embedding):
                torch.nn.init.normal_(module.weight, mean=0.0, std=self.config.initializer_range)

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        labels: Optional[torch.Tensor] = None
    ) -> Dict[str, Any]:
        bsz, seq_len = input_ids.shape
        hidden_states = self.embed_tokens(input_ids)

        cos, sin = self.rotary_emb(seq_len, device=input_ids.device)

        if seq_len > 1:
            causal_mask = torch.full((seq_len, seq_len), float("-inf"), device=input_ids.device)
            causal_mask = torch.triu(causal_mask, diagonal=1).unsqueeze(0).unsqueeze(0)
        else:
            causal_mask = None

        for layer in self.layers:
            hidden_states = layer(hidden_states, cos, sin, attention_mask=causal_mask)

        hidden_states = self.norm(hidden_states)

        # 1. Causal LM Logits
        lm_logits = self.lm_head(hidden_states)

        # 2. Multi-Task Pooled Representation (Last Token)
        pooled_repr = hidden_states[:, -1, :]
        anomaly_logits = self.anomaly_classifier_head(pooled_repr)
        restitution_pred = self.restitution_regression_head(pooled_repr)

        loss = None
        if labels is not None:
            shift_logits = lm_logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()
            loss = F.cross_entropy(
                shift_logits.view(-1, self.config.vocab_size),
                shift_labels.view(-1),
                ignore_index=-100
            )

        return {
            "loss": loss,
            "logits": lm_logits,
            "anomaly_logits": anomaly_logits,
            "restitution_prediction": restitution_pred,
            "hidden_states": hidden_states
        }
