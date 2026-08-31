# Machine Learning Weights & ONNX Artifacts

This directory stores exported machine learning model weights, ONNX runtime binaries, and tokenizer vocabularies for the CuraVeris invoice parsing and extraction pipelines.

## Contents & Layout

- `layoutlmv3_finetuned/`: LayoutLMv3 weights fine-tuned on Indian hospital billing documents, pharmacy tax invoices, and insurance claim sheets.
- `onnx/`: Quantized (INT8) ONNX models for mobile edge inference (iOS CoreML and Android NNAPI).
- `checksums.sha256`: Cryptographic SHA-256 integrity ledger verifying all downloaded or exported weights before runtime loading.

## Security & Verification

Model weights loaded by the backend or mobile inference engines must match their declared SHA-256 hashes in `config/models.yaml` to prevent tampering and prompt injection.
