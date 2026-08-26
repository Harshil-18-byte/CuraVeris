"""Counterfactual Mutations Generator."""

import copy
import random
from typing import List, Optional

from .schema import BillRecord, BillItem, AnomalyLabels


class CounterfactualMutator:
    """Generates controlled counterfactual variants linked to base bill family."""

    def __init__(self, random_seed: int = 42):
        self.rng = random.Random(random_seed)

    def mutate_price_surge(self, base_bill: BillRecord) -> Optional[BillRecord]:
        b = copy.deepcopy(base_bill)
        b.bill_id = f"{base_bill.bill_id}_CF_PRICE"
        b.source_type = "counterfactual"

        candidates = [i for i in b.line_items if i.category in ["implant", "pharmacy"]]
        if not candidates:
            return None

        target = self.rng.choice(candidates)
        factor = self.rng.uniform(1.5, 2.5)
        new_price = round(target.unit_price * factor, 2)
        target.unit_price = new_price
        target.total_amount = round(new_price * target.quantity, 2)
        target.labels.rate_anomaly = 1
        if target.category == "implant":
            target.labels.nppa_ceiling_violation = 1
        elif target.category == "pharmacy":
            target.labels.above_mrp = 1

        b.total_billed = round(sum(i.total_amount for i in b.line_items), 2)
        return b

    def mutate_duplicate_charge(self, base_bill: BillRecord) -> Optional[BillRecord]:
        b = copy.deepcopy(base_bill)
        b.bill_id = f"{base_bill.bill_id}_CF_DUP"
        b.source_type = "counterfactual"

        candidates = [i for i in b.line_items if i.category in ["diagnostic", "pharmacy"]]
        if not candidates:
            return None

        target = copy.deepcopy(self.rng.choice(candidates))
        target.item_id = f"LI_DUP_{len(b.line_items)+1:03d}"
        target.labels.duplicate_charge = 1
        b.line_items.append(target)
        b.total_billed = round(sum(i.total_amount for i in b.line_items), 2)
        return b

    def mutate_unbundled_consumable(self, base_bill: BillRecord) -> BillRecord:
        b = copy.deepcopy(base_bill)
        b.bill_id = f"{base_bill.bill_id}_CF_UNBUNDLE"
        b.source_type = "counterfactual"

        unbundled = BillItem(
            item_id=f"LI_UNB_{len(b.line_items)+1:03d}",
            raw_text="Sterile Surgical Gloves & OT Consumables Pack (Unbundled)",
            category="consumable",
            quantity=1.0,
            unit_price=2800.0,
            total_amount=2800.0,
            labels=AnomalyLabels(consumable_unbundled=1, rate_anomaly=1, package_unbundled=1)
        )
        b.line_items.append(unbundled)
        b.total_billed = round(sum(i.total_amount for i in b.line_items), 2)
        return b

    def mutate_unlawful_gst(self, base_bill: BillRecord) -> BillRecord:
        b = copy.deepcopy(base_bill)
        b.bill_id = f"{base_bill.bill_id}_CF_GST"
        b.source_type = "counterfactual"

        gst_item = BillItem(
            item_id=f"LI_GST_{len(b.line_items)+1:03d}",
            raw_text="GST Surcharge @ 18% on Exempt Healthcare Room Tariff",
            category="tax_gst",
            quantity=1.0,
            unit_price=4200.0,
            total_amount=4200.0,
            labels=AnomalyLabels(gst_on_exempt=1, rate_anomaly=1)
        )
        b.line_items.append(gst_item)
        b.total_billed = round(sum(i.total_amount for i in b.line_items), 2)
        return b

    def generate_all_mutations(self, base_bill: BillRecord) -> List[BillRecord]:
        mutations = []
        p = self.mutate_price_surge(base_bill)
        if p:
            mutations.append(p)
        d = self.mutate_duplicate_charge(base_bill)
        if d:
            mutations.append(d)
        mutations.append(self.mutate_unbundled_consumable(base_bill))
        mutations.append(self.mutate_unlawful_gst(base_bill))
        return mutations
