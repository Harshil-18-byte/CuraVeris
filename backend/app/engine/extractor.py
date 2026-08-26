import re
import unicodedata
from typing import List, Dict, Any, Tuple, Optional
from pypdf import PdfReader
from io import BytesIO
from fastapi import HTTPException
from app.core.logging import logger


def enforce_file_size(file_bytes: bytes, max_mb: int = 20) -> None:
    """
    Reject files exceeding the configured size limit before any content processing.
    Raises HTTP 413 if the file is too large.
    """
    max_bytes = max_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File size {len(file_bytes) // (1024 * 1024):.1f} MB exceeds the "
                   f"{max_mb} MB maximum allowed size.",
        )


def validate_file_magic_bytes(file_bytes: bytes, filename: str) -> bool:
    """
    Validates authentic file signatures (magic bytes) to prevent polyglot malware uploads.
    Supports PDF, PNG, JPEG, and text files.
    """
    if not file_bytes:
        return False
    lower_fn = filename.lower() if filename else ""
    if lower_fn.endswith(".pdf"):
        return file_bytes.startswith(b"%PDF")
    if lower_fn.endswith(".png"):
        return file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    if lower_fn.endswith((".jpg", ".jpeg")):
        return file_bytes.startswith(b"\xff\xd8\xff")
    if lower_fn.endswith((".txt", ".csv")):
        try:
            file_bytes[:1024].decode("utf-8")
            return True
        except Exception:
            return False
    return True


def normalize_unicode(text: str) -> str:
    """Normalize unicode characters, rupee symbols, dashes, and extra spaces."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("₹", "INR ").replace("Rs.", "INR ").replace("Rs ", "INR ")
    text = re.sub(r"[ \t]+", " ", text)
    return text


def fix_ocr_numbers(text: str) -> str:
    """
    Correct common OCR character confusions in monetary figures:
    - 'O' or 'o' mistranscribed for zero '0'
    - 'l' or 'I' mistranscribed for '1'
    """
    def replacer(match):
        val = match.group(1)
        fixed = val.replace("O", "0").replace("o", "0").replace("l", "1").replace("I", "1")
        return f"INR {fixed}"

    cleaned = re.sub(r"INR\s*([0-9OoIl,\.]+)", replacer, text)
    return cleaned


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyPDF."""
    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        full_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            full_text.append(f"--- PAGE {i+1} ---\n{page_text}")
        return "\n".join(full_text)
    except Exception as e:
        logger.error(f"Error reading PDF bytes: {e}")
        return ""


def segment_bill_sections(raw_text: str) -> Dict[str, List[str]]:
    """
    Segment bill into logical clinical billing sections:
    - header: hospital name, patient name, date
    - pharmacy: drugs, IV fluids, tablets, injections
    - procedures: surgeries, cath lab, operations, consultations
    - diagnostics: lab tests, imaging, ECG, CT, MRI
    - room_nursing: bed charges, ICU, nursing care, monitoring
    - consumables: gloves, PPE, gauze, kits
    - tax_gst: CGST, SGST, IGST
    - total: subtotal, discount, grand total
    """
    sections = {
        "header": [],
        "pharmacy": [],
        "procedures": [],
        "diagnostics": [],
        "room_nursing": [],
        "consumables": [],
        "tax_gst": [],
        "total": [],
        "other": []
    }

    current_section = "header"
    lines = raw_text.splitlines()

    for line in lines:
        l = line.strip()
        if not l:
            continue

        l_lower = l.lower()

        # Check section boundaries
        if any(h in l_lower for h in ["pharmacy", "medicines", "drugs", "pharmaceutical"]):
            current_section = "pharmacy"
        elif any(h in l_lower for h in ["procedure", "surgery", "operation", "cath lab", "ot charges", "doctor fee", "consultation"]):
            current_section = "procedures"
        elif any(h in l_lower for h in ["investigation", "laboratory", "radiology", "diagnostics", "pathology", "imaging"]):
            current_section = "diagnostics"
        elif any(h in l_lower for h in ["room rent", "bed charge", "nursing", "icu charge", "ward"]):
            current_section = "room_nursing"
        elif any(h in l_lower for h in ["consumables", "disposables", "surgical items", "materials"]):
            current_section = "consumables"
        elif any(h in l_lower for h in ["gst", "cgst", "sgst", "tax"]):
            current_section = "tax_gst"
        elif any(h in l_lower for h in ["total amount", "grand total", "net payable", "balance due"]):
            current_section = "total"

        sections[current_section].append(l)

    return sections


def normalize_item_name(raw_name: str) -> str:
    """Clean drug/procedure prefixes, packaging numbers, and noisy tokens."""
    name = raw_name.strip()
    # Remove dosage forms at start like 'Inj.', 'Tab.', 'Cap.', 'Syr.'
    name = re.sub(r"^(inj\.|inj|tab\.|tab|cap\.|cap|syr\.|syr|infusion|iv)\s+", "", name, flags=re.IGNORECASE)
    # Remove trailing quantities like 'x3', 'x 2', '(100ml)'
    name = re.sub(r"\s*x\s*\d+\b", "", name, flags=re.IGNORECASE)
    # Clean whitespace
    name = re.sub(r"\s+", " ", name).strip()
    return name


def parse_line_item(line: str, default_category: str = "other") -> Optional[Dict[str, Any]]:
    """
    Parse a single line of text into structured fields:
    description, quantity, charged_rate, total_amount, category.
    """
    line = line.strip()
    if len(line) < 4:
        return None

    # Pattern: Description ... Qty ... Rate ... Amount
    # Example: "Inj. Pantoprazole 40mg  3  180.00  540.00"
    # Example: "Coronary Stent (DES)   1  65000.00 65000.00"
    # Example: "Routine Nursing Care x 3 days @ 1500 = 4500"
    
    # Extract all floating point / integer numbers from the line
    num_matches = list(re.finditer(r"\b\d+(?:,\d{3})*(?:\.\d{1,2})?\b", line))
    if not num_matches:
        return None

    # Determine description and amounts
    # If there are at least 2 numbers (e.g. qty, amount or rate, amount)
    numbers = []
    for m in num_matches:
        raw_num = m.group(0).replace(",", "")
        try:
            val = float(raw_num)
            numbers.append((val, m.start(), m.end()))
        except ValueError:
            pass

    if not numbers:
        return None

    # Description is typically everything before the first number
    first_num_start = numbers[0][1]
    raw_desc = line[:first_num_start].strip(" -:\t|")
    if not raw_desc:
        # Number might be in description (e.g. 'Pantoprazole 40mg')
        # If there are 3 numbers, the first might be strength (40), second qty, third rate
        if len(numbers) >= 3 and any(unit in line.lower() for unit in ["mg", "ml", "gm", "g"]):
            raw_desc = line[:numbers[1][1]].strip(" -:\t|")
            numbers = numbers[1:]
        else:
            raw_desc = "Hospital Service"

    # Default logic for qty, rate, amount
    if len(numbers) >= 2:
        # Last number is usually total amount, second to last is rate or qty
        amount = numbers[-1][0]
        second_num = numbers[-2][0]
        if len(numbers) >= 3:
            qty = numbers[-3][0]
            rate = second_num
        else:
            # Decide if second_num is qty or rate
            if second_num <= 20 and second_num.is_integer() and amount >= second_num:
                qty = second_num
                rate = amount / max(qty, 1)
            else:
                rate = second_num
                qty = 1.0
    else:
        amount = numbers[0][0]
        rate = amount
        qty = 1.0

    # Auto-detect category from description
    desc_lower = raw_desc.lower()
    cat = default_category
    if any(w in desc_lower for w in ["inj", "tab", "cap", "pantoprazole", "paracetamol", "meropenem", "ceftriaxone", "infusion", "saline", "mg", "ml"]):
        cat = "pharmacy"
    elif any(w in desc_lower for w in ["stent", "implant", "pacemaker", "balloon", "prosthesis", "mesh"]):
        cat = "procedure"  # implant/device under procedure
    elif any(w in desc_lower for w in ["surgery", "angioplasty", "bypass", "appendectomy", "repair", "consultation", "doctor visit", "visit"]):
        cat = "procedure"
    elif any(w in desc_lower for w in ["blood", "cbc", "kft", "lft", "ecg", "x-ray", "ct scan", "mri", "echo", "test", "culture"]):
        cat = "diagnostic"
    elif any(w in desc_lower for w in ["bed", "room", "icu", "nursing", "ward", "day"]):
        cat = "room_nursing"
    elif any(w in desc_lower for w in ["glove", "ppe", "kit", "sanitizer", "gauze", "cotton", "diaper", "mask"]):
        cat = "consumable"
    elif any(w in desc_lower for w in ["gst", "cgst", "sgst", "tax"]):
        cat = "tax_gst"

    norm_name = normalize_item_name(raw_desc)

    return {
        "raw_text": raw_desc,
        "normalized_name": norm_name,
        "category": cat,
        "quantity": float(qty),
        "charged_rate": float(rate),
        "charged_amount": float(amount)
    }


def parse_bill_text(raw_text: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Complete pipeline to preprocess and extract structured metadata and items from raw bill text.
    Universally resolves any Indian hospital and any clinical diagnosis.
    """
    from app.db.disease_registry import lookup_disease_context
    from app.db.hospital_registry import resolve_hospital

    clean_text = normalize_unicode(raw_text)
    clean_text = fix_ocr_numbers(clean_text)
    
    sections = segment_bill_sections(clean_text)
    header_text = "\n".join(sections["header"])
    
    # 1. Universally resolve any Indian hospital, tier, and NABH accreditation
    hosp_info = resolve_hospital(header_text or clean_text[:300])
    
    # 2. Universally resolve any disease / clinical package across ICD-10 & PM-JAY
    disease_info = lookup_disease_context(clean_text)

    # 3. Patient Name heuristic from header
    patient_name = "Patient"
    for line in sections["header"][:8]:
        line_clean = line.lower()
        if "patient" in line_clean or "mr." in line_clean or "mrs." in line_clean or "ms." in line_clean or "name:" in line_clean:
            # Extract name portion
            parts = re.split(r"[:\-|]", line)
            if len(parts) > 1 and len(parts[1].strip()) > 2:
                patient_name = parts[1].strip().title()
                break

    # Extract items across sections
    items = []
    for section_name, lines in sections.items():
        if section_name in ["header", "total"]:
            continue
        for line in lines:
            parsed = parse_line_item(line, default_category=section_name)
            if parsed and parsed["charged_amount"] > 0:
                items.append(parsed)

    metadata = {
        "hospital_name": hosp_info["name"],
        "city": hosp_info["city"],
        "state": hosp_info.get("state", "India"),
        "tier": hosp_info["tier"],
        "is_nabh": hosp_info["is_nabh"],
        "cghs_multiplier": hosp_info.get("cghs_multiplier", 1.15 if hosp_info["is_nabh"] else 1.0),
        "patient_name": patient_name,
        "diagnosis": disease_info["canonical_name"] if disease_info else "General Inpatient Care",
        "icd_10": disease_info.get("icd_10", "Z03.8") if disease_info else "Z03.8",
        "specialty": disease_info.get("specialty", "General Medicine") if disease_info else "General Medicine",
        "typical_alos_days": disease_info.get("typical_alos_days", 3) if disease_info else 3,
        "fair_package_cost_inr": disease_info.get("fair_package_cost_inr", 35000.0) if disease_info else 35000.0,
        "raw_text": clean_text
    }

    return metadata, items
