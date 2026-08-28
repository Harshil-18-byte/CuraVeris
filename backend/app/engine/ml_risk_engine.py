"""Stable advisory-result facade over CuraVeris's existing risk ensemble.

It intentionally does not calculate or mutate financial liability.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List

import numpy as np

from app.engine.risk_engine import RiskAuditEngine


class MLRiskEngine:
    model_name = "curaveris-xgboost-mlp-blended"
    model_version = "existing-artifacts"
    feature_schema_version = "risk-engine/15-feature-v1"

    def __init__(self, engine: RiskAuditEngine | None = None):
        self._engine = engine or RiskAuditEngine()

    def assess_features(self, features: np.ndarray) -> Dict[str, Any]:
        """Return a normalized advisory finding from the existing ensemble."""
        result = self._engine.predict_hybrid_risk_with_uncertainty(features)
        probabilities = result.get("probabilities")
        predictions = result.get("predictions")
        uncertainty_data = result.get("uncertainty_analysis") or {}
        probability = float(np.mean(probabilities)) if probabilities is not None else 0.0
        uncertainty = self._extract_uncertainty(uncertainty_data)
        categories = self._flagged_categories(predictions)
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "feature_schema_version": self.feature_schema_version,
            "inference_timestamp": datetime.now(timezone.utc).isoformat(),
            "ensemble_probability": probability,
            "uncertainty": uncertainty,
            "risk_level": self._risk_level(probability, uncertainty),
            "flagged_categories": categories,
            "feature_contributions": [],
            "requires_review": probability >= 0.40 or uncertainty > 0.06,
            "engine": result.get("engine"),
        }

    @staticmethod
    def _extract_uncertainty(data: Any) -> float:
        if isinstance(data, dict):
            for key in ("mean_std", "uncertainty", "std", "average_std"):
                if key in data:
                    try:
                        return float(np.mean(data[key]))
                    except (TypeError, ValueError):
                        pass
        return 0.0

    @staticmethod
    def _flagged_categories(predictions: Any) -> List[int]:
        if predictions is None:
            return []
        values = np.asarray(predictions)
        return np.where(np.any(values.astype(bool), axis=0))[0].astype(int).tolist()

    @staticmethod
    def _risk_level(probability: float, uncertainty: float) -> str:
        if probability >= 0.55 and uncertainty <= 0.04:
            return "HIGH"
        if probability >= 0.40 or uncertainty > 0.06:
            return "REVIEW"
        return "LOW"
