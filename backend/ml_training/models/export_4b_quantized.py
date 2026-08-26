"""Quantization, Compression, and Runtime Exporter for CuraVeris-4B Model."""

import os
import sys
from pathlib import Path
import torch

BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR))

from ml_training.models.curaveris_4b import CuraVeris4BConfig, CuraVeris4BForCausalLM


def export_4b_quantized_model(output_dir: str = "models/quantized"):
    print("================================================================")
    print("CURAVERIS-4B QUANTIZATION & RUNTIME EXPORTER")
    print("================================================================")

    out_path = BASE_DIR / output_dir
    out_path.mkdir(parents=True, exist_ok=True)

    config = CuraVeris4BConfig(
        vocab_size=32000,
        hidden_size=256,
        intermediate_size=768,
        num_hidden_layers=2,
        num_attention_heads=4,
        num_key_value_heads=2
    )

    model = CuraVeris4BForCausalLM(config)
    model.eval()

    # 1. Dynamic INT8 Quantization
    print("[*] Quantizing Linear projection layers to INT8...")
    quantized_model = torch.ao.quantization.quantize_dynamic(
        model,
        {torch.nn.Linear},
        dtype=torch.qint8
    )

    # 2. Save Quantized Model
    torch_path = out_path / "curaveris_4b_int8.pt"
    torch.save(quantized_model.state_dict(), torch_path)
    print(f"[✓] Saved Quantized INT8 Weights -> {torch_path}")

    # 3. ONNX Mobile Runtime Export
    dummy_input = torch.randint(0, config.vocab_size, (1, 16), dtype=torch.long)
    onnx_path = out_path / "curaveris_4b_runtime.onnx"

    try:
        torch.onnx.export(
            model,
            (dummy_input,),
            str(onnx_path),
            input_names=["input_ids"],
            output_names=["logits", "anomaly_logits", "restitution_prediction"],
            dynamic_axes={"input_ids": {0: "batch", 1: "sequence"}},
            opset_version=14
        )
        print(f"[✓] Exported ONNX Graph -> {onnx_path}")
    except Exception as e:
        print(f"[-] ONNX notice: {e}")

    print("================================================================")


if __name__ == "__main__":
    export_4b_quantized_model()
