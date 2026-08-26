"""Typed Bill and Dataset Schemas with Provenance and Family Grouping."""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime


@dataclass
class AnomalyLabels:
    nppa_ceiling_violation: int = 0
    above_mrp: int = 0
    consumable_unbundled: int = 0
    duplicate_charge: int = 0
    gst_on_exempt: int = 0
    rate_anomaly: int = 0
    package_unbundled: int = 0

    def to_dict(self) -> Dict[str, int]:
        return asdict(self)


@dataclass
class BillItem:
    item_id: str
    raw_text: str
    category: str
    quantity: float
    unit_price: float
    total_amount: float
    labels: AnomalyLabels = field(default_factory=AnomalyLabels)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["labels"] = self.labels.to_dict()
        return d


@dataclass
class BillRecord:
    bill_id: str
    family_id: str
    hospital_name: str
    city: str
    state: str
    tier: int
    is_nabh: bool
    admission_date: str
    discharge_date: str
    days_admitted: int
    diagnosis: str
    icd10_code: str
    total_billed: float
    line_items: List[BillItem]
    source_type: str  # "real", "synthetic", "counterfactual", "hard_negative"
    scenario_id: Optional[str] = None
    generation_seed: Optional[int] = None
    validation_status: str = "VALIDATED"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "bill_id": self.bill_id,
            "family_id": self.family_id,
            "hospital_name": self.hospital_name,
            "city": self.city,
            "state": self.state,
            "tier": self.tier,
            "is_nabh": self.is_nabh,
            "admission_date": self.admission_date,
            "discharge_date": self.discharge_date,
            "days_admitted": self.days_admitted,
            "diagnosis": self.diagnosis,
            "icd10_code": self.icd10_code,
            "total_billed": self.total_billed,
            "source_type": self.source_type,
            "scenario_id": self.scenario_id,
            "generation_seed": self.generation_seed,
            "validation_status": self.validation_status,
            "line_items": [i.to_dict() for i in self.line_items]
        }


@dataclass
class DatasetExample:
    example_id: str
    family_id: str
    source_type: str
    record: BillRecord

    def to_dict(self) -> Dict[str, Any]:
        return {
            "example_id": self.example_id,
            "family_id": self.family_id,
            "source_type": self.source_type,
            "bill": self.record.to_dict()
        }


@dataclass
class SplitFamily:
    family_id: str
    split: str  # "train", "val", "test"
    base_scenario_id: Optional[str]
    example_count: int
