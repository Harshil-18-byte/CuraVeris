"""Dataset Quality, Validation, Deduplication, and Family-Level Splitting Engine."""

import hashlib
import json
from collections import defaultdict
from typing import List, Dict, Any, Tuple
import random

from .schema import BillRecord, SplitFamily


class DatasetQualityEngine:
    """Handles schema validation, deduplication, and family-level train/val/test splits."""

    @staticmethod
    def validate_bill(bill: BillRecord) -> Tuple[bool, List[str]]:
        errors = []
        if not bill.bill_id:
            errors.append("Missing bill_id")
        if not bill.family_id:
            errors.append("Missing family_id")
        if not bill.line_items:
            errors.append("Bill has 0 line items")

        computed_sum = round(sum(i.total_amount for i in bill.line_items), 2)
        if abs(computed_sum - bill.total_billed) > 0.05:
            errors.append(f"Arithmetic mismatch: total_billed={bill.total_billed} vs sum={computed_sum}")

        for i, item in enumerate(bill.line_items):
            if item.quantity <= 0:
                errors.append(f"Line item {i} has invalid quantity: {item.quantity}")
            if item.unit_price < 0:
                errors.append(f"Line item {i} has negative unit price: {item.unit_price}")

        is_valid = len(errors) == 0
        return is_valid, errors

    @staticmethod
    def compute_content_hash(bill: BillRecord) -> str:
        """Compute exact semantic hash over bill contents to deduplicate identical records."""
        tokens = [
            bill.hospital_name,
            bill.diagnosis,
            bill.icd10_code,
            str(bill.days_admitted),
            str(bill.total_billed),
            str(len(bill.line_items))
        ]
        for item in bill.line_items:
            tokens.append(f"{item.raw_text}|{item.unit_price}|{item.quantity}")
        raw_str = "##".join(tokens)
        return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

    @classmethod
    def deduplicate_bills(cls, bills: List[BillRecord]) -> List[BillRecord]:
        """Deduplicate bills while preserving real bills over synthetic variants."""
        seen_hashes = set()
        unique_bills = []
        for bill in bills:
            chash = cls.compute_content_hash(bill)
            if chash not in seen_hashes:
                seen_hashes.add(chash)
                unique_bills.append(bill)
        return unique_bills

    @staticmethod
    def split_by_family(
        bills: List[BillRecord],
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        random_seed: int = 42
    ) -> Dict[str, List[BillRecord]]:
        """Split at the bill-family level to keep counterfactuals in the same split."""
        family_map = defaultdict(list)
        for bill in bills:
            family_map[bill.family_id].append(bill)

        family_ids = sorted(list(family_map.keys()))
        rng = random.Random(random_seed)
        rng.shuffle(family_ids)

        total_families = len(family_ids)
        n_train = int(total_families * train_ratio)
        n_val = int(total_families * val_ratio)

        train_fams = set(family_ids[:n_train])
        val_fams = set(family_ids[n_train: n_train + n_val])
        test_fams = set(family_ids[n_train + n_val:])

        splits = {"train": [], "val": [], "test": []}
        for fam_id, fam_bills in family_map.items():
            if fam_id in train_fams:
                splits["train"].extend(fam_bills)
            elif fam_id in val_fams:
                splits["val"].extend(fam_bills)
            else:
                splits["test"].extend(fam_bills)

        return splits
