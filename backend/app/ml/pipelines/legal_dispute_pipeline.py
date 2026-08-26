"""Pipeline 6: Statutory Reasoning & Legal Dispute Notice Pipeline.

Generates:
1. Patient-friendly mobile advisories explaining exact rupee overcharges
2. Formal Legal Dispute Notices cited under:
   - Consumer Protection Act, 2019 (Section 2(47) Unfair Trade Practices)
   - Essential Commodities Act, 1955 (Section 3 & DPCO 2013)
   - NPPA Gazette Price Control Orders
   - IRDAI Health Insurance Regulations
"""

from typing import List, Dict, Any, Optional
from datetime import date
from dataclasses import dataclass


@dataclass
class DisputeNoticeDocument:
    notice_title: str
    recipient_hospital: str
    patient_name: str
    bill_id: str
    total_disputed_amount_inr: float
    statutory_clauses: List[str]
    plain_language_summary: str
    formal_notice_text: str
    recommended_filing_forum: str  # e.g., District Consumer Disputes Redressal Commission (DCDRC)


class LegalDisputePipeline:
    """Production Legal Notice & Dispute Letter Pipeline for Mobile App Generation."""

    def generate_dispute_notice(
        self,
        hospital_name: str,
        patient_name: str,
        bill_id: str,
        total_billed: float,
        overcharge_items: List[Dict[str, Any]],
        hospital_city: str = "Delhi"
    ) -> DisputeNoticeDocument:
        total_disputed = 0.0
        for it in overcharge_items:
            val = it.get("overcharge_amount") if it.get("overcharge_amount") is not None else it.get("amount_impact", 0.0)
            total_disputed += float(val) if isinstance(val, (int, float, str)) else 0.0

        today_str = date.today().strftime("%d %B %Y")

        statutory_clauses = [
            "Section 2(47) of the Consumer Protection Act, 2019 (Unfair Trade Practice)",
            "Section 3 of the Essential Commodities Act, 1955 read with DPCO 2013",
            "NPPA Gazette Notifications on Ceiling Prices of Coronary Stents & Knee Implants",
            "Clinical Establishments (Registration and Regulation) Act, 2010 Standard Tariff Mandates"
        ]

        item_rows = []
        for idx, it in enumerate(overcharge_items):
            name = it.get("item_name") or it.get("matched_name", "Medical Item")
            val = it.get("overcharge_amount") if it.get("overcharge_amount") is not None else it.get("amount_impact", 0.0)
            amt = float(val) if isinstance(val, (int, float, str)) else 0.0
            reason = it.get("description", "Exceeds statutory benchmark ceiling")
            item_rows.append(f"  {idx+1}. {name}: Excess charged ₹{amt:,.2f} — {reason}")

        items_text = "\n".join(item_rows) if item_rows else "  1. General procedural & statutory tariff overcharges."

        formal_text = f"""FORMAL LEGAL NOTICE & STATUTORY REFUND DEMAND
UNDER SECTION 2(47) & SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

Date: {today_str}
To,
The Medical Superintendent / Billing Grievance Redressal Cell
{hospital_name}
{hospital_city}, India

Ref: Forensic Medical Audit of Inpatient Bill No: {bill_id}
Patient Name: {patient_name}
Total Invoice Amount: ₹{total_billed:,.2f}
Total Unlawful Overcharge Identified: ₹{total_disputed:,.2f}

Sir / Madam,

Under instructions from and on behalf of my client/the patient {patient_name}, this Statutory Notice is served regarding unauthorized, arbitrary, and statutorily prohibited charges billed in the aforementioned invoice:

SPECIFIC STATUTORY VIOLATIONS IDENTIFIED:
{items_text}

LEGAL GROUNDS:
1. Under the Drugs (Prices Control) Order, 2013 (DPCO) and gazette orders issued by the National Pharmaceutical Pricing Authority (NPPA) under Section 3 of the Essential Commodities Act, 1955, charging above the gazetted ceiling price is a cognizable statutory offense.
2. Charging rates substantially in excess of standard benchmarks without prior informed written consent constitutes an 'Unfair Trade Practice' under Section 2(47) of the Consumer Protection Act, 2019.

DEMAND FOR REFUND:
You are hereby called upon to immediately audit and refund/adjust the disputed sum of ₹{total_disputed:,.2f} within 7 (seven) days of receipt of this notice, failing which legal proceedings will be initiated before the competent District Consumer Disputes Redressal Commission (DCDRC), along with claims for interest, mental harassment, and legal costs.

Yours faithfully,
CuraVeris Statutory Redressal Engine
On behalf of {patient_name}
"""

        summary = (
            f"Forensic audit identified ₹{total_disputed:,.2f} in unlawful overcharges on your bill of ₹{total_billed:,.2f} "
            f"from {hospital_name}. A formal statutory notice under the Consumer Protection Act 2019 has been prepared "
            f"and is ready for one-tap submission to the hospital billing cell."
        )

        return DisputeNoticeDocument(
            notice_title=f"Statutory Notice: {hospital_name} (₹{total_disputed:,.2f} Overcharge)",
            recipient_hospital=hospital_name,
            patient_name=patient_name,
            bill_id=bill_id,
            total_disputed_amount_inr=round(total_disputed, 2),
            statutory_clauses=statutory_clauses,
            plain_language_summary=summary,
            formal_notice_text=formal_text,
            recommended_filing_forum=f"District Consumer Disputes Redressal Commission (DCDRC), {hospital_city}"
        )
