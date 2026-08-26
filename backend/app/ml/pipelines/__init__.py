"""CuraVeris ML Pipelines Package.

Exposes production-ready modular training & inference pipelines for:
1. DocumentParsingPipeline (LayoutLMv3 OCR & BBox extraction)
2. StatutoryRAGPipeline (BioBERT ChromaDB procedure, stent, drug retrieval)
3. XGBoostRiskPipeline (Multi-label fraud/anomaly classifier with optimal threshold gating)
4. DeepEnsembleRiskPipeline (Deep MLP + Hybrid Stacking with Monte Carlo Uncertainty)
5. InsuranceReconciliationPipeline (IRDAI claim deduction & settlement gap auditing)
6. LegalDisputePipeline (Consumer Protection Act 2019 legal notice & letter generation)
7. MobileInferencePipeline (Unified high-throughput, low-latency mobile gateway for iOS/Android)
"""

from app.ml.pipelines.document_pipeline import DocumentParsingPipeline
from app.ml.pipelines.statutory_rag_pipeline import StatutoryRAGPipeline
from app.ml.pipelines.xgboost_risk_pipeline import XGBoostRiskPipeline
from app.ml.pipelines.deep_ensemble_pipeline import DeepEnsembleRiskPipeline
from app.ml.pipelines.insurance_reconciliation_pipeline import InsuranceReconciliationPipeline
from app.ml.pipelines.legal_dispute_pipeline import LegalDisputePipeline
from app.ml.pipelines.mobile_inference_pipeline import MobileInferencePipeline, mobile_pipeline

__all__ = [
    "DocumentParsingPipeline",
    "StatutoryRAGPipeline",
    "XGBoostRiskPipeline",
    "DeepEnsembleRiskPipeline",
    "InsuranceReconciliationPipeline",
    "LegalDisputePipeline",
    "MobileInferencePipeline",
    "mobile_pipeline",
]
