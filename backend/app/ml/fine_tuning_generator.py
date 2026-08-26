"""
Approach 2 — LLM Fine-Tuning Dataset Generator for Indian Medical Bill Analysis.
Generates structured JSONL datasets ready for OpenAI (GPT-3.5-turbo/GPT-4o-mini)
or Open-Source LLMs (Mistral-7B, LLaMA-3) fine-tuning APIs.
"""
import os
import sys
import json
import random
from typing import List, Dict, Any

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.db.disease_registry import DISEASE_REGISTRY
from app.db.hospital_registry import HOSPITAL_REGISTRY
from app.db.pharma_database import PHARMA_CATALOG


SYSTEM_PROMPT = (
    "You are CuraVeris, India's expert medical bill auditor and statutory regulatory enforcement engine. "
    "Given raw scanned hospital bill text and payment context, you extract structured line items, "
    "audit against official CGHS, NPPA device price ceilings, DPCO drug ceilings, and IRDAI non-payable items, "
    "compute the weighted risk score (0-100), and explain the exact rupee overcharges in plain, compassionate language."
)


def generate_llm_training_example(example_id: int) -> Dict[str, Any]:
    """Generates a single multi-turn chat example formatted for LLM fine-tuning."""
    hosp = random.choice(HOSPITAL_REGISTRY)
    pkg_key = random.choice(list(DISEASE_REGISTRY.keys()))
    pkg = DISEASE_REGISTRY[pkg_key]
    drug = random.choice(PHARMA_CATALOG)

    patient_names = ["Ramesh Gupta", "Sunita Sharma", "Anil Kulkarni", "Meenakshi Iyer", "Rajesh Patel", "Pooja Reddy", "Vikram Singh"]
    doctors = ["Dr. K. S. Murthy, MD", "Dr. Sanjeev Aggarwal, MS", "Dr. Priya Nair, DNB", "Dr. Arvind Rao, MCh"]
    
    patient = random.choice(patient_names)
    doctor = random.choice(doctors)
    days = random.randint(2, 6)
    room_rate = random.choice([2500, 4500, 7500, 12000])
    
    # Pricing violations injection
    is_overcharged = random.random() < 0.70
    drug_qty = random.randint(2, 6)
    
    if is_overcharged:
        billed_drug_rate = drug["ceiling_inr"] * random.uniform(1.4, 2.5)
        stent_rate = 65000.0 if "cardio" in pkg["specialty"].lower() else None
    else:
        billed_drug_rate = drug["ceiling_inr"] * 0.95
        stent_rate = 36000.0 if "cardio" in pkg["specialty"].lower() else None

    # Construct realistic raw bill text
    raw_text = (
        f"INVOICE / DISCHARGE BILL\n"
        f"HOSPITAL: {hosp['name']}, {hosp['city']}\n"
        f"PATIENT: {patient} | AGE: {random.randint(32, 68)} Yrs | GENDER: M/F\n"
        f"TREATING CONSULTANT: {doctor}\n"
        f"PRIMARY DIAGNOSIS: {pkg['canonical_name']} (ICD-10: {pkg['icd_10']})\n"
        f"ADMISSION DURATION: {days} Days ({hosp['tier']} Bed Care)\n"
        f"LINE ITEMS:\n"
        f"1. Bed / Room Rent ({days} Days @ Rs.{room_rate}/day): Rs.{days * room_rate:.2f}\n"
        f"2. {pkg['canonical_name']} Procedure Package: Rs.{pkg['fair_package_cost_inr'] * 1.25:.2f}\n"
        f"3. {drug['generic_name']} (Qty: {drug_qty} @ Rs.{billed_drug_rate:.2f}): Rs.{drug_qty * billed_drug_rate:.2f}\n"
        f"4. Surgical Gloves Examination (Qty: 10 @ Rs.150/pair): Rs.1500.00\n"
    )

    total_billed = (days * room_rate) + (pkg['fair_package_cost_inr'] * 1.25) + (drug_qty * billed_drug_rate) + 1500.0
    if stent_rate:
        raw_text += f"5. Drug Eluting Coronary Stent (DES): Rs.{stent_rate:.2f}\n"
        total_billed += stent_rate

    raw_text += f"TOTAL BILLED AMOUNT: Rs.{total_billed:.2f}\n"

    # Razorpay Payment Context
    payment_method = random.choice(["upi", "card", "emi", "netbanking"])
    paid_ratio = random.choice([0.70, 0.85, 1.0])
    paid_amount = total_billed * paid_ratio
    payment_gap = total_billed - paid_amount

    raw_text += (
        f"PAYMENT RECORD:\n"
        f"Payment ID: pay_test_{random.randint(100000, 999999)}\n"
        f"Method: {payment_method.upper()}\n"
        f"Amount Paid by Patient: Rs.{paid_amount:.2f}\n"
        f"Unsettled Gap: Rs.{payment_gap:.2f}\n"
    )

    # Expected Structured Output
    risk_flags = []
    overcharges_total = 0.0

    if billed_drug_rate > drug["ceiling_inr"]:
        risk_flags.append("DPCO_PRICE_CEILING_VIOLATION")
        overcharges_total += (billed_drug_rate - drug["ceiling_inr"]) * drug_qty

    if stent_rate and stent_rate > 38260.0:
        risk_flags.append("NPPA_STENT_PRICE_CEILING_VIOLATION")
        overcharges_total += (stent_rate - 38260.0)

    # Gloves are IRDAI non-payable
    risk_flags.append("IRDAI_NON_PAYABLE_CONSUMABLE")
    overcharges_total += 1500.0

    if payment_method == "emi":
        risk_flags.append("EMI_FINANCIAL_STRESS_DETECTED")

    risk_score = min(100, int((overcharges_total / max(100.0, total_billed)) * 100 + (10 if payment_method == "emi" else 0)))

    plain_english = (
        f"Your hospital bill from {hosp['name']} totaled ₹{total_billed:,.2f}. "
        f"Our audit detected ₹{overcharges_total:,.2f} in potential statutory overcharges. "
        f"Specifically, {drug['generic_name']} was billed at ₹{billed_drug_rate:,.2f} per unit against the "
        f"statutory NPPA/DPCO ceiling of ₹{drug['ceiling_inr']:,.2f}. Furthermore, ₹1,500.00 in surgical consumables "
        f"should have been bundled under the standard procedure package. "
        f"You are legally entitled to request a refund or credit note."
    )

    assistant_response = {
        "hospital_identified": hosp["name"],
        "is_nabh": hosp["is_nabh"],
        "diagnosis": pkg["canonical_name"],
        "icd_10": pkg["icd_10"],
        "total_billed_inr": round(total_billed, 2),
        "total_overcharge_inr": round(overcharges_total, 2),
        "risk_score": risk_score,
        "risk_flags": risk_flags,
        "payment_context": {
            "amount_paid_inr": round(paid_amount, 2),
            "payment_gap_inr": round(payment_gap, 2),
            "method": payment_method,
            "financial_stress_signal": payment_method == "emi"
        },
        "plain_english_advisory": plain_english
    }

    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"BILL TEXT AND PAYMENT CONTEXT:\n{raw_text}"},
            {"role": "assistant", "content": json.dumps(assistant_response, ensure_ascii=False)}
        ]
    }


def generate_jsonl_dataset(output_path: str = "./data/curaveris_llm_finetuning.jsonl", count: int = 500) -> str:
    """Generates 500 high-quality JSONL examples for LLM fine-tuning."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for i in range(count):
            ex = generate_llm_training_example(i)
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
    print(f"Successfully generated {count} fine-tuning records at: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_jsonl_dataset()
