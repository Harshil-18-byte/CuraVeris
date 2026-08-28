# End-to-end synthetic demo

Use `data/demo_financial_verification.json`. It represents fictional, internally consistent figures only.

1. Upload the synthetic hospital bill and related insurance/TPA documents through the existing bill ingestion API.
2. Run the existing deterministic audit and advisory ML risk analysis.
3. Build a `FinancialTruthInput` from the demo totals. The verified responsibility is ₹73,400.00; the requested ₹86,900.00 leaves ₹13,500.00 unexplained by the available evidence.
4. Present the `EvidenceEngine` chain before any payment action.
5. In a configured Razorpay test environment, create and complete a payment only after the verified-obligation/order binding migration is deployed.
6. Process the signed webhook and use the existing reconciliation flow to compare actual and expected payment.
7. Preserve the ledger/audit record.

The current repository has no checked-in frontend application, so this demo is API/service-oriented.

