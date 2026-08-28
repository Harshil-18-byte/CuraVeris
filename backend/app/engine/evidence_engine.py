"""Structured provenance for CuraVeris financial conclusions."""
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, Iterable, List, Optional


@dataclass(frozen=True)
class EvidenceReference:
    field: str
    value: Any
    source_document: str
    page: Optional[int] = None
    bounding_box: Optional[List[float]] = None
    confidence: Optional[float] = None
    normalized_value: Optional[Any] = None


@dataclass(frozen=True)
class EvidenceChain:
    result_name: str
    calculation: str
    references: List[EvidenceReference] = field(default_factory=list)
    rule_ids: List[str] = field(default_factory=list)
    model_run_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class EvidenceEngine:
    """Builds explanation payloads without asserting unsupported conclusions."""

    @staticmethod
    def verified_responsibility(
        invoice_total: EvidenceReference,
        insurance: EvidenceReference,
        tpa_adjustment: EvidenceReference,
        *,
        model_run_id: Optional[str] = None,
    ) -> EvidenceChain:
        return EvidenceChain(
            result_name="verified_patient_responsibility",
            calculation="invoice_total - insurance_contribution - tpa_adjustment",
            references=[invoice_total, insurance, tpa_adjustment],
            rule_ids=["financial-truth/v1"],
            model_run_id=model_run_id,
        )

    @staticmethod
    def validate_critical_fields(references: Iterable[EvidenceReference]) -> None:
        for reference in references:
            if not reference.source_document:
                raise ValueError(f"{reference.field} has no source document")
            if reference.confidence is not None and not 0 <= reference.confidence <= 1:
                raise ValueError(f"{reference.field} confidence must be between 0 and 1")


evidence_engine = EvidenceEngine()
