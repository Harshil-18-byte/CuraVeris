"""CuraVeris — Controlled Counterfactual Perturbation Generator (Layer 3).

Takes a verified compliant baseline bill and generates exact, single-variable counterfactual
variants with ground-truth delta annotations:
  - Price Surge: Perturb single drug or implant above gazette ceiling
  - Duplicate Line: Duplicate specific investigation or pharmacy row
  - Consumable Unbundling: Extract prohibited PPE/gloves from bundled procedure
  - Tax Corruption: Apply unlawful GST surcharge on exempt room tariff
  - OCR Noise: Introduce optical token corruption while preserving true numbers
"""

import copy
import random
from typing import Dict, Any, List, Tuple, Optional


class CounterfactualGenerator:
    """Creates single-variable controlled counterfactual bill pairs."""

    def __init__(self, random_seed: int = 42):
        random.seed(random_seed)

    def generate_counterfactuals(self, clean_bill: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate all 5 controlled counterfactual variants for a given clean bill."""
        variants = []
        
        # 1. Price Surge Variant
        v_price = self.inject_price_surge(clean_bill)
        if v_price:
            variants.append(v_price)

        # 2. Duplicate Line Variant
        v_dup = self.inject_duplicate_line(clean_bill)
        if v_dup:
            variants.append(v_dup)

        # 3. Consumable Unbundling Variant
        v_unbundle = self.inject_consumable_unbundling(clean_bill)
        if v_unbundle:
            variants.append(v_unbundle)

        # 4. Unlawful GST Surcharge
        v_gst = self.inject_unlawful_gst(clean_bill)
        if v_gst:
            variants.append(v_gst)

        # 5. OCR Character Corruption
        v_ocr = self.inject_ocr_corruption(clean_bill)
        if v_ocr:
            variants.append(v_ocr)

        return variants

    def inject_price_surge(self, bill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        b = copy.deepcopy(bill)
        b["bill_id"] = f"{b['bill_id']}_CF_PRICE"
        b["counterfactual_type"] = "price_surge"

        # Find implant or pharmacy item
        candidates = [
            (idx, item) for idx, item in enumerate(b["line_items"])
            if item["category"] in ["implant", "pharmacy"]
        ]
        if not candidates:
            return None

        idx, item = random.choice(candidates)
        orig_price = item["unit_price"]
        markup_factor = random.uniform(1.4, 2.5)
        new_price = round(orig_price * markup_factor, 2)
        new_total = round(new_price * item["quantity"], 2)

        item["unit_price"] = new_price
        item["total_amount"] = new_total
        item["labels"]["rate_anomaly"] = 1
        if item["category"] == "implant":
            item["labels"]["nppa_ceiling_violation"] = 1
        elif item["category"] == "pharmacy":
            item["labels"]["above_mrp"] = 1

        b["total_billed"] = round(sum(i["total_amount"] for i in b["line_items"]), 2)
        return b

    def inject_duplicate_line(self, bill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        b = copy.deepcopy(bill)
        b["bill_id"] = f"{b['bill_id']}_CF_DUP"
        b["counterfactual_type"] = "duplicate_line"

        candidates = [
            item for item in b["line_items"]
            if item["category"] in ["diagnostic", "pharmacy"]
        ]
        if not candidates:
            return None

        target = copy.deepcopy(random.choice(candidates))
        target["item_id"] = f"LI_DUP_{len(b['line_items'])+1:03d}"
        target["labels"]["duplicate_charge"] = 1
        b["line_items"].append(target)
        b["total_billed"] = round(sum(i["total_amount"] for i in b["line_items"]), 2)
        return b

    def inject_consumable_unbundling(self, bill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        b = copy.deepcopy(bill)
        b["bill_id"] = f"{b['bill_id']}_CF_UNBUNDLE"
        b["counterfactual_type"] = "consumable_unbundling"

        unbundled_item = {
            "item_id": f"LI_UNB_{len(b['line_items'])+1:03d}",
            "raw_text": "Surgical Gloves & Theatre Consumables Kit (Excluded from OT Package)",
            "category": "consumable",
            "quantity": 1.0,
            "unit_price": 3200.00,
            "total_amount": 3200.00,
            "labels": {
                "nppa_ceiling_violation": 0,
                "above_mrp": 0,
                "consumable_unbundled": 1,
                "duplicate_charge": 0,
                "gst_on_exempt": 0,
                "rate_anomaly": 1,
                "package_unbundled": 1
            }
        }
        b["line_items"].append(unbundled_item)
        b["total_billed"] = round(sum(i["total_amount"] for i in b["line_items"]), 2)
        return b

    def inject_unlawful_gst(self, bill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        b = copy.deepcopy(bill)
        b["bill_id"] = f"{b['bill_id']}_CF_GST"
        b["counterfactual_type"] = "unlawful_gst"

        gst_item = {
            "item_id": f"LI_GST_{len(b['line_items'])+1:03d}",
            "raw_text": "GST Surcharge @ 18% on General Bed & Hospital Healthcare Service",
            "category": "tax_gst",
            "quantity": 1.0,
            "unit_price": 4500.00,
            "total_amount": 4500.00,
            "labels": {
                "nppa_ceiling_violation": 0,
                "above_mrp": 0,
                "consumable_unbundled": 0,
                "duplicate_charge": 0,
                "gst_on_exempt": 1,
                "rate_anomaly": 1,
                "package_unbundled": 0
            }
        }
        b["line_items"].append(gst_item)
        b["total_billed"] = round(sum(i["total_amount"] for i in b["line_items"]), 2)
        return b

    def inject_ocr_corruption(self, bill: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        b = copy.deepcopy(bill)
        b["bill_id"] = f"{b['bill_id']}_CF_OCR"
        b["counterfactual_type"] = "ocr_corruption"

        for item in b["line_items"]:
            # Realistic OCR mutations
            text = item["raw_text"]
            mutated = text.replace("O", "0").replace("l", "1").replace("cl", "d")
            item["raw_text"] = mutated
            # Labels remain clean because price and entity are legally compliant

        return b
