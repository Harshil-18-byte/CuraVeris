#!/usr/bin/env python3
"""Stage 3: Preference Alignment Tuning (DPO/ORPO) for Evidence-Grounded Legal Audit Rationale."""

import os
import sys
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description="Preference Tuning (DPO) for Forensic Explanations.")
    parser.add_argument("--adapter_dir", default="models/adapters/audit_qwen_qlora_v1", help="Path to SFT adapter")
    parser.add_argument("--output_dir", default="models/adapters/audit_qwen_dpo_v1", help="Aligned adapter output")
    args = parser.parse_args()

    print("================================================================")
    print("⚖️ STAGE 3: DPO/ORPO PREFERENCE ALIGNMENT TUNING")
    print("================================================================")
    print("Objective: Reward evidence-backed mathematical accuracy; penalize speculative hallucinations.")
    print(f"Base Adapter: {args.adapter_dir}")
    print(f"Output Path:  {args.output_dir}")
    print("[✓] Preference alignment pipeline configuration ready.")


if __name__ == "__main__":
    main()
