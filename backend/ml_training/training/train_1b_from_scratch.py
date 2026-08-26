#!/usr/bin/env python3
"""Training Pipeline for CuraVeris-1B Model from Scratch."""

import os
import sys
import math
import argparse
from pathlib import Path
from typing import Dict, Any

import torch
import torch.nn as nn
import torch.nn.functional as F

BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR))

from ml_training.models.curaveris_1b import CuraVeris1BConfig, CuraVeris1BForCausalLM


class MultiTaskLoss(nn.Module):
    """Combines Causal LM cross-entropy, Multi-Label Focal Loss, and Restitution MSE."""

    def __init__(self, gamma: float = 2.0, alpha: float = 0.25):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha

    def forward(
        self,
        lm_loss: torch.Tensor,
        anomaly_logits: torch.Tensor,
        anomaly_targets: torch.Tensor,
        pred_restitution: torch.Tensor,
        true_restitution: torch.Tensor
    ) -> Dict[str, torch.Tensor]:
        # 1. Multi-Label Focal Loss
        bce_loss = F.binary_cross_entropy_with_logits(anomaly_logits, anomaly_targets, reduction="none")
        probs = torch.sigmoid(anomaly_logits)
        p_t = probs * anomaly_targets + (1 - probs) * (1 - anomaly_targets)
        focal_weight = (1 - p_t) ** self.gamma
        focal_loss = (focal_weight * bce_loss).mean()

        # 2. Restitution Regression Loss (Huber / Smooth L1)
        huber_loss = F.smooth_l1_loss(pred_restitution.squeeze(-1), true_restitution)

        # 3. Multi-Task Combined Loss
        total_loss = lm_loss + 0.5 * focal_loss + 0.1 * huber_loss

        return {
            "total_loss": total_loss,
            "lm_loss": lm_loss,
            "focal_loss": focal_loss,
            "huber_loss": huber_loss
        }


def run_training_loop(
    num_steps: int = 10,
    batch_size: int = 2,
    seq_len: int = 128,
    lr: float = 3e-4,
    device: str = "cpu"
):
    print("================================================================")
    print("🚀 TRAINING CURAVERIS-1B FROM SCRATCH (Multi-Task Objective)")
    print("================================================================")

    config = CuraVeris1BConfig(
        vocab_size=32000,
        hidden_size=512,  # Compact dimension for local verification
        intermediate_size=1536,
        num_hidden_layers=4,
        num_attention_heads=8,
        num_key_value_heads=2
    )

    print(f"Full Production Config:   24 Layers, 2048 Dim, 16 Heads -> {CuraVeris1BConfig().total_parameters / 1e9:.2f}B Parameters")
    print(f"Active Verification Spec: {config.num_hidden_layers} Layers, {config.hidden_size} Dim -> {config.total_parameters / 1e6:.1f}M Parameters")
    print(f"Device:                   {device}")
    print("================================================================")

    model = CuraVeris1BForCausalLM(config).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.1)
    loss_fn = MultiTaskLoss()

    model.train()
    for step in range(1, num_steps + 1):
        # Synthetic batch for training verification
        input_ids = torch.randint(0, config.vocab_size, (batch_size, seq_len), device=device)
        targets = input_ids.clone()
        anomaly_targets = torch.randint(0, 2, (batch_size, config.num_anomaly_classes), dtype=torch.float32, device=device)
        true_restitution = torch.tensor([250.0, 950.0], device=device)[:batch_size]

        optimizer.zero_grad()
        outputs = model(input_ids=input_ids, labels=targets)
        loss_dict = loss_fn(
            lm_loss=outputs["loss"],
            anomaly_logits=outputs["anomaly_logits"],
            anomaly_targets=anomaly_targets,
            pred_restitution=outputs["restitution_prediction"],
            true_restitution=true_restitution
        )

        loss_dict["total_loss"].backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        if step % 2 == 0 or step == num_steps:
            print(f"  Step [{step:02d}/{num_steps:02d}] - Total Loss: {loss_dict['total_loss'].item():.4f} | LM: {loss_dict['lm_loss'].item():.4f} | Focal: {loss_dict['focal_loss'].item():.4f} | Huber: {loss_dict['huber_loss'].item():.4f}")

    print("\n[✓] CuraVeris-1B scratch training loop verified with gradient descent and multi-task loss.")


def main():
    parser = argparse.ArgumentParser(description="Train CuraVeris-1B from scratch.")
    parser.add_argument("--steps", type=int, default=5, help="Number of training steps to verify")
    parser.add_argument("--batch_size", type=int, default=2)
    parser.add_argument("--device", default="cpu", help="Device (cpu/cuda)")
    args = parser.parse_args()

    run_training_loop(num_steps=args.steps, batch_size=args.batch_size, device=args.device)


if __name__ == "__main__":
    main()
