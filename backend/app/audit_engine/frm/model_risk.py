"""
Model Risk Management

Quantifies risk that CuraVeris's own models are unreliable for a given bill.
Maps to regulatory MRM frameworks (SR 11-7, Basel model risk principles) adapted for healthcare.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Tuple

# Training distribution bounds
TRAINING_FEATURE_BOUNDS: Dict[str, Tuple[float, float]] = {
    'total_billed_log': (8.0, 16.0),
    'line_item_count': (3, 150),
    'drug_ratio': (0.0, 0.80),
    'procedure_ratio': (0.0, 0.90),
    'gst_ratio': (0.0, 0.30),
    'max_single_item': (0.001, 0.85),
    'statutory_violation_count': (0, 20),
}

TRAINING_BASELINE_MEAN_SCORE = 0.45
MODEL_DRIFT_THRESHOLD = 0.15


@dataclass
class ModelRiskInputs:
    uncertainty_lower: float
    uncertainty_upper: float
    extraction_confidences: List[float]
    feature_vector: Dict[str, Any]
    ml_risk_score: float


@dataclass
class ModelRiskResult:
    prediction_confidence: float
    data_quality_score: float
    ood_ratio: float
    ood_features: List[str]
    model_risk_level: str
    requires_human_review: bool
    human_review_reasons: List[str]
    confidence_interpretation: str


def compute_model_risk(inputs: ModelRiskInputs) -> ModelRiskResult:
    # 1. Prediction confidence = 1 - uncertainty interval width
    interval_width = float(inputs.uncertainty_upper) - float(inputs.uncertainty_lower)
    prediction_confidence = max(0.0, min(1.0, 1.0 - interval_width))
    
    # 2. Data quality score = proportion of items with acceptable extraction confidence (>= 0.70)
    if inputs.extraction_confidences:
        high_confidence = [c for c in inputs.extraction_confidences if float(c) >= 0.70]
        data_quality_score = len(high_confidence) / len(inputs.extraction_confidences)
    else:
        data_quality_score = 0.0
    data_quality_score = max(0.0, min(1.0, data_quality_score))
    
    # 3. Out-of-distribution detection against training bounds
    ood_features = []
    for feature_name, (lo, hi) in TRAINING_FEATURE_BOUNDS.items():
        val = inputs.feature_vector.get(feature_name)
        if val is not None:
            val_float = float(val)
            if not (lo <= val_float <= hi):
                ood_features.append(feature_name)
    
    ood_ratio = len(ood_features) / len(TRAINING_FEATURE_BOUNDS) if TRAINING_FEATURE_BOUNDS else 0.0
    
    # 4. Model risk level classification
    if prediction_confidence >= 0.75 and data_quality_score >= 0.80 and ood_ratio <= 0.15:
        model_risk_level = 'LOW'
    elif prediction_confidence >= 0.55 and data_quality_score >= 0.60 and ood_ratio <= 0.30:
        model_risk_level = 'MEDIUM'
    else:
        model_risk_level = 'HIGH'
    
    # 5. Human review triggers
    review_reasons = []
    if prediction_confidence < 0.60:
        review_reasons.append(f"Low prediction confidence ({prediction_confidence:.0%}). Model uncertainty is high.")
    if data_quality_score < 0.60:
        review_reasons.append(f"Poor OCR quality ({data_quality_score:.0%} items extracted clearly). Findings may be inaccurate.")
    if ood_ratio > 0.30:
        review_reasons.append(f"Bill characteristics differ significantly from training data ({ood_ratio:.0%} features out-of-distribution: {', '.join(ood_features)}).")
    
    requires_human_review = (model_risk_level == 'HIGH') or (len(review_reasons) > 0)
    
    # 6. Confidence interpretation
    if prediction_confidence >= 0.80:
        confidence_interp = "High confidence. Model results are reliable for this bill type."
    elif prediction_confidence >= 0.60:
        confidence_interp = "Moderate confidence. Results are directionally reliable but treat specific amounts as estimates."
    else:
        confidence_interp = "Low confidence. Treat AI results as indicative only. Statutory findings are unaffected."
    
    return ModelRiskResult(
        prediction_confidence=round(prediction_confidence, 4),
        data_quality_score=round(data_quality_score, 4),
        ood_ratio=round(ood_ratio, 4),
        ood_features=ood_features,
        model_risk_level=model_risk_level,
        requires_human_review=requires_human_review,
        human_review_reasons=review_reasons,
        confidence_interpretation=confidence_interp,
    )
