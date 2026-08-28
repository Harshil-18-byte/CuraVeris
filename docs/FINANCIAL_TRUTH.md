# Financial truth and evidence contracts

`FinancialTruthEngine` is a pure calculation service in `backend/app/engine/financial_truth.py`. It creates a verified patient responsibility only from known inputs:

```text
verified_patient_responsibility =
  max(0, invoice_total - insurance_contribution - tpa_adjustment)
```

The service also calculates net paid, outstanding balance, overpayment, and (when a hospital requested amount is supplied) unexplained variance. Inputs and outputs use two-place `Decimal` values and an explicit currency, defaulting to INR.

`tpa_adjustment` in this contract means a documented credit/contribution reducing patient liability. It is intentionally not interchangeable with the legacy reconciliation field `tpa_deductions`, which has different compatibility semantics.

`EvidenceEngine` associates each critical value with its source document, page, optional bounding box, confidence, and normalized value. It produces an evidence chain from source → extraction → normalization → rule/model → calculation → result. Missing source documents and invalid confidence values are rejected by its validation boundary.

These are service contracts only in the current increment. Persistence, public endpoints, UI timeline rendering, and payment-order binding will be added only with a migration that preserves existing API behavior.

