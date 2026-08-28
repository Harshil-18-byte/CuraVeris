# CuraVeris risk-intelligence model card

## Intended use

The risk layer flags potential billing anomalies for review. It does **not** determine the amount a patient owes, approve claims, diagnose patients, or make fraud findings.

## Preserved model stack

- XGBoost multi-label risk classifier
- Three-layer MLP risk network
- Blended/ensemble inference layer
- Monte Carlo uncertainty estimation
- Feature-attribution support

The `MLRiskEngine` facade in `backend/app/engine/ml_risk_engine.py` wraps existing inference behavior and records a stable model-name, model-version, feature-schema-version, and inference timestamp contract. It does not retrain, replace, or modify model artifacts.

## Outputs

The facade returns ensemble probability, uncertainty, a review-oriented risk level, flagged category indexes, and an advisory `requires_review` flag. A high value means anomaly risk, not proof of wrongdoing or a percentage probability of fraud.

## Evaluation and data limitations

Repository evaluation artifacts are retained under `backend/ml_training/results/` and model metrics under `backend/ml_training/models/`. Training/evaluation provenance must be reviewed before using any metric externally. The repository includes synthetic data generators and datasets; synthetic data must not be represented as real patient data and may not generalize to production billing patterns.

## Operational limits

- Inference requires approved, deployed artifacts compatible with the feature schema.
- Missing, low-confidence, or conflicting documents require review rather than automated financial certainty.
- Statistical outputs remain advisory and must be paired with deterministic rules and evidence.

