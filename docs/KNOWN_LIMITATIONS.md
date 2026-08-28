# Known limitations

- No frontend source was found in this checkout; the requested responsive patient experience and financial timeline cannot be delivered without an existing frontend location or authorization to introduce one.
- `FinancialTruthEngine` and `EvidenceEngine` are new pure service contracts. They are not yet persisted or exposed as public API endpoints.
- Existing Razorpay order creation accepts a request amount. A future compatible payment-orchestrator change must bind it to a persisted verified obligation.
- Full test execution is blocked in this workspace because the active Python environment lacks `httpx`, required by `backend/tests/conftest.py`.
- Git LFS status inspection is blocked by an access-denied LFS temporary-file error. No model artifact was changed or retrained.
- Model metrics in the repository require provenance review before external claims; included synthetic data has inherent generalization limits.

