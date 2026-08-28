# Incremental implementation plan

## Constraints

- Preserve existing routes, model artifacts, training code, payment integration, and ledger.
- ML identifies risk only. Deterministic calculations establish payable liability.
- All monetary calculations use `Decimal`/fixed precision and include currency.
- Do not add an LLM, a fourth model, unrelated clinical features, or a new frontend stack.

| Card | Current | Change | Reason | Risk | Acceptance |
|---|---|---|---|---|---|
| 1 | Financial logic is distributed between reconciliation and API layers | Add a compatibility-safe `FinancialTruthEngine` result contract | Establish reproducible verified liability without replacing existing reconciliation | Formula/status mismatch | Unit tests cover normal, missing, partial, overpayment, underpayment, and invariant cases |
| 2 | Evidence exists in extraction/audit/ledger outputs | Add an `EvidenceEngine` chain and provenance data contract | Make liability explanations source-backed | Incomplete legacy provenance | Evidence tests trace source → calculation → result |
| 3 | Ensemble inference is implemented across several modules | Add an `MLRiskEngine` facade around existing XGBoost + MLP + blending | Provide model/version/schema/inference metadata without retraining | Artifact availability differs by environment | Existing ensemble tests and facade contract tests pass |
| 4 | Razorpay orders accept an amount | Add an obligation-aware payment orchestration boundary while retaining legacy endpoint compatibility | Ensure payments are based on verified amount | Integration contract breakage | Razorpay mock order/webhook and reconciliation tests pass |
| 5 | Reconciliation uses legacy status terms | Map deterministic expected versus actual payment to target statuses | Make payment outcome understandable and auditable | Existing API consumers | Reconciliation matrix tests pass |
| 6 | No frontend source found | Add API-ready verification/timeline payloads and a synthetic demo seed | Enable a future UI without fabricating a frontend stack | Scope expansion | Demo flow runs through API tests |
| 7 | Documentation is fragmented | Add model card, API/database/security/deployment/testing updates and known limitations | Ensure claims match implementation | Documentation drift | Documentation review against code paths |

## Delivery order

1. Cards 1–3 form the core and are independently testable.
2. Card 4 depends on Card 1; Card 5 depends on Cards 1 and 4.
3. Card 6 depends on Cards 1, 2, 4, and 5.
4. Card 7 records the verified implementation and test evidence.

## Initial implementation target

Begin with Card 1: a pure, dependency-free financial-truth service and tests. It does not modify persistence, trained models, existing APIs, or Razorpay behavior. The existing reconciliation engine remains the compatibility path until Card 5 is proven.

