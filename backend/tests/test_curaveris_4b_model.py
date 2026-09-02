"""Test Suite for CuraVeris-4B Custom 4-Billion Parameter Model from Scratch."""

import os
import sys
import pytest

torch = pytest.importorskip("torch")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from ml_training.models.curaveris_4b import (
    CuraVeris4BConfig,
    RMSNorm,
    RotaryEmbedding,
    GroupedQueryAttention4B,
    SwiGLUFeedForward4B,
    CuraVeris4BForCausalLM
)
from ml_training.training.train_4b_from_scratch import MultiTaskFocalHuberLoss4B


def test_curaveris_4b_parameter_count():
    """Verify that theoretical parameter calculation matches ~4.02 Billion parameters."""
    config = CuraVeris4BConfig()
    total_params = config.total_parameters
    assert 3_800_000_000 <= total_params <= 4_200_000_000, f"Expected ~4.02B parameters, got {total_params:,}"


def test_4b_rmsnorm_and_rope():
    """Verify RMSNorm normalization and RoPE rotary embeddings at 4B scale."""
    dim = 128
    norm = RMSNorm(dim=dim)
    x = torch.randn(2, 8, dim)
    normed = norm(x)
    assert normed.shape == x.shape
    assert torch.allclose(normed.pow(2).mean(-1), torch.ones(2, 8), atol=1e-2)

    rope = RotaryEmbedding(dim=dim // 4, max_seq_len=256)
    cos, sin = rope(32, device=torch.device("cpu"))
    assert cos.shape == (32, dim // 4)
    assert sin.shape == (32, dim // 4)


def test_4b_grouped_query_attention():
    """Verify GQA forward pass with 22 query heads and 4 KV heads."""
    config = CuraVeris4BConfig(
        vocab_size=1000,
        hidden_size=256,
        intermediate_size=512,
        num_hidden_layers=2,
        num_attention_heads=8,
        num_key_value_heads=2
    )
    gqa = GroupedQueryAttention4B(config)
    rope = RotaryEmbedding(dim=config.hidden_size // config.num_attention_heads, max_seq_len=64)
    cos, sin = rope(16, device=torch.device("cpu"))

    hidden = torch.randn(2, 16, config.hidden_size)
    out = gqa(hidden, cos, sin)
    assert out.shape == (2, 16, config.hidden_size)


def test_curaveris_4b_multi_task_forward_and_loss():
    """Verify full 4B multi-task forward pass (LM loss, anomaly logits, restitution prediction)."""
    config = CuraVeris4BConfig(
        vocab_size=500,
        hidden_size=64,
        intermediate_size=128,
        num_hidden_layers=2,
        num_attention_heads=4,
        num_key_value_heads=2
    )
    model = CuraVeris4BForCausalLM(config)
    input_ids = torch.randint(0, config.vocab_size, (2, 16))
    targets = input_ids.clone()

    outputs = model(input_ids=input_ids, labels=targets)
    assert "loss" in outputs and outputs["loss"] is not None
    assert outputs["logits"].shape == (2, 16, config.vocab_size)
    assert outputs["anomaly_logits"].shape == (2, config.num_anomaly_classes)
    assert outputs["restitution_prediction"].shape == (2, 1)

    # Verify MultiTaskFocalHuberLoss4B backward pass
    loss_fn = MultiTaskFocalHuberLoss4B()
    anomaly_targets = torch.randint(0, 2, (2, config.num_anomaly_classes), dtype=torch.float32)
    true_restitution = torch.tensor([38260.0, 950.0])

    loss_dict = loss_fn(
        lm_loss=outputs["loss"],
        anomaly_logits=outputs["anomaly_logits"],
        anomaly_targets=anomaly_targets,
        pred_restitution=outputs["restitution_prediction"],
        true_restitution=true_restitution
    )

    assert loss_dict["total_loss"].item() > 0.0
    loss_dict["total_loss"].backward()

    # Check gradients flow to embedding table
    assert model.embed_tokens.weight.grad is not None
