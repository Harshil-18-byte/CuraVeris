"""Bill Data Extractor Module for line items, rates, and invoice metadata."""

import re
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple, Optional
from app.ml.ocr_pipeline import ExtractedBlock
from app.core.logging import logger


@dataclass
class ExtractedLineItem:
    line_number: int
    item_name: str
    normalized_name: str
    category: str
    quantity: float
    unit_price: float
    total_amount: float
    confidence_score: float
    bbox: Dict[str, float]


@dataclass
class BillMetadata:
    hospital_name: str = "Hospital Invoice"
    bill_number: Optional[str] = None
    bill_date: Optional[str] = None
    total_amount: float = 0.0


class BillDataExtractor:
    """Extracts line items, amounts, categories, and hospital metadata from OCR blocks."""

    CATEGORY_KEYWORDS = {
        "consultation": ["consultation", "doctor visit", "dr.", "physician", "specialist", "opd", "round fee"],
        "room_nursing": ["bed charges", "room rent", "icu", "nursing", "ward", "day care", "ventilator", "bed charge"],
        "diagnostic": ["x-ray", "mri", "ct scan", "ultrasound", "cbc", "blood", "urine", "pathology", "radiology", "ecg", "echo", "culture", "lft", "kft"],
        "procedure": ["surgery", "operation", "ot charges", "anesthesia", "laparoscopic", "endoscopy", "biopsy", "angioplasty", "cabg", "cataract", "delivery", "dialysis"],
        "pharmacy": ["inj", "tab", "cap", "syrup", "infusion", "mg", "ml", "paracetamol", "pantoprazole", "meropenem", "antibiotic", "pharma"],
        "consumable": ["gloves", "ppe", "kit", "syringe", "needle", "gauze", "cotton", "diaper", "mask", "cannula", "sanitizer", "fixator", "underpad"],
    }

    def extract_bill_data(self, blocks: List[ExtractedBlock]) -> Tuple[BillMetadata, List[ExtractedLineItem]]:
        metadata = self._extract_metadata(blocks)
        items = self._extract_line_items(blocks)
        if metadata.total_amount <= 0.0 and items:
            metadata.total_amount = round(sum(it.total_amount for it in items), 2)
        return metadata, items

    def _extract_metadata(self, blocks: List[ExtractedBlock]) -> BillMetadata:
        metadata = BillMetadata()
        for b in blocks[:15]:
            text = b.text.strip()
            if any(w in text.lower() for w in ["hospital", "healthcare", "clinic", "institute", "medical centre"]) and len(text) > 4:
                if metadata.hospital_name == "Hospital Invoice":
                    metadata.hospital_name = text
            inv_match = re.search(r"(?:bill|inv|invoice|receipt)\s*(?:no|number|#)?[:.\s-]*([A-Z0-9\/-]+)", text, re.IGNORECASE)
            if inv_match and not metadata.bill_number:
                cand = inv_match.group(1).strip()
                if len(cand) >= 3 and cand.lower() not in ("no", "date"):
                    metadata.bill_number = cand
            date_match = re.search(r"(\b\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}\b)", text)
            if date_match and not metadata.bill_date:
                metadata.bill_date = date_match.group(1)

        for b in reversed(blocks[-25:]):
            text = b.text.strip()
            total_match = re.search(r"(?:total|net amount|grand total|net payable)[\s:₹rs\.]*([\d,]+(?:\.\d{2})?)", text, re.IGNORECASE)
            if total_match:
                try:
                    metadata.total_amount = float(total_match.group(1).replace(",", ""))
                    break
                except ValueError:
                    pass
        return metadata

    def _extract_line_items(self, blocks: List[ExtractedBlock]) -> List[ExtractedLineItem]:
        items = []
        line_idx = 1
        for b in blocks:
            text = b.text.strip()
            if not text or len(text) < 4:
                continue
            if any(kw in text.lower() for kw in ["tax invoice", "sub total", "grand total", "gstin", "terms & conditions", "signature"]):
                continue

            num_matches = list(re.finditer(r"\b\d+(?:,\d{3})*(?:\.\d{1,2})?\b", text))
            if not num_matches:
                continue

            desc_part = text[:num_matches[0].start()].strip()
            desc_part = re.sub(r"^[\d\.\-\)\s]+", "", desc_part).strip()
            if len(desc_part) < 3:
                continue

            parsed_nums = []
            for m in num_matches:
                try:
                    parsed_nums.append(float(m.group(0).replace(",", "")))
                except ValueError:
                    pass

            if not parsed_nums:
                continue

            if len(parsed_nums) >= 3:
                qty = parsed_nums[0] if parsed_nums[0] <= 50 and parsed_nums[0] == int(parsed_nums[0]) else round(parsed_nums[-1] / (parsed_nums[-2] or 1.0), 2)
                unit_price = parsed_nums[-2]
                total_amount = parsed_nums[-1]
            elif len(parsed_nums) == 2:
                unit_price, total_amount = parsed_nums[0], parsed_nums[1]
                qty = round(total_amount / unit_price, 2) if unit_price > 0 else 1.0
            else:
                total_amount = parsed_nums[0]
                unit_price = total_amount
                qty = 1.0

            if total_amount <= 0.0 or total_amount > 20000000.0:
                continue

            items.append(ExtractedLineItem(
                line_number=line_idx,
                item_name=desc_part,
                normalized_name=desc_part.title(),
                category=self._classify_category(desc_part),
                quantity=qty,
                unit_price=unit_price,
                total_amount=total_amount,
                confidence_score=b.confidence,
                bbox=b.bbox,
            ))
            line_idx += 1
        return items

    def _classify_category(self, item_name: str) -> str:
        lower = item_name.lower()
        for cat, keywords in self.CATEGORY_KEYWORDS.items():
            if any(kw in lower for kw in keywords):
                return cat
        return "other"
