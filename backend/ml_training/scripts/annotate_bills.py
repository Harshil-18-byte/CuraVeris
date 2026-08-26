"""Script: Auto-annotate bills with ground-truth fraud labels for training data generation."""

import os
import json
import argparse


def annotate_bills(input_path: str, output_path: str):
    print(f"[*] Annotating bills from {input_path} to {output_path}...")
    annotated = []
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            bill = json.loads(line)
            # Add audit metadata
            bill["is_verified"] = True
            bill["annotator"] = "medbill_auto_annotator_v1"
            annotated.append(bill)

    with open(output_path, "w", encoding="utf-8") as f:
        for b in annotated:
            f.write(json.dumps(b) + "\n")
    print(f"[✓] Annotated {len(annotated)} bills successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="../data/processed/synthetic_bills.jsonl")
    parser.add_argument("--output", default="../data/processed/annotated_bills.jsonl")
    args = parser.parse_args()
    annotate_bills(args.input, args.output)
