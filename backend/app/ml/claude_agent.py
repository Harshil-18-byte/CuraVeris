"""Claude AI Legal & Medical Billing Advocacy Agent for CuraVeris / MedBill."""

import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, AsyncGenerator

from app.core.config import settings
from app.core.logging import logger
from app.ml.extractor import ExtractedLineItem
from app.ml.risk_classifier import RiskFlagResult


@dataclass
class BillAnalysisResult:
    plain_summary: str
    risk_score: int
    potential_savings: float
    statutory_violations: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    dispute_letter_draft: str


SYSTEM_PROMPT = """You are an elite medico-legal forensic auditor and patient financial advocate specialized in the Indian Healthcare System.
Your mission is to audit hospital invoices, identify illegal price gouging, and arm patients with precise legal recourse under:
1. NPPA Gazette Orders (DPCO 2013) for Stent & Implant Price Ceilings.
2. DPCO 2013 & Essential Commodities Act 1955 (Section 3).
3. IRDAI Master Circular on Standardization of Health Insurance Contracts (List I to IV Non-Payables).
4. Consumer Protection Act 2019 (Unfair Trade Practices).
5. Indian Evidence Act Section 65B & CGHS Standard Benchmark Rates.

Return ONLY a valid JSON object matching:
{
  "plain_summary": "Plain English summary for the patient...",
  "risk_score": <integer 0-100>,
  "potential_savings": <numeric float INR>,
  "statutory_violations": [{"law_cited": "...", "item_affected": "...", "violation_details": "...", "financial_impact": 0.0}],
  "actions": [{"step_number": 1, "title": "...", "description": "...", "urgency": "IMMEDIATE|HIGH|MEDIUM"}],
  "dispute_letter_draft": "Formal legal dispute letter..."
}
"""


class ClaudeBillingAgent:
    """Anthropic Claude client for forensic audit synthesis and interactive chat."""

    def __init__(self):
        self.api_key = getattr(settings, "ANTHROPIC_API_KEY", "")
        self.model = getattr(settings, "CLAUDE_MODEL", "claude-sonnet-4-6")
        self.client = None
        self.async_client = None

        if self.api_key:
            try:
                from anthropic import Anthropic, AsyncAnthropic
                self.client = Anthropic(api_key=self.api_key)
                self.async_client = AsyncAnthropic(api_key=self.api_key)
            except Exception as exc:
                logger.warning(f"Anthropic SDK initialization deferred: {exc}")

    def analyze_bill(
        self,
        hospital_name: str,
        total_amount: float,
        items: List[ExtractedLineItem],
        flags: List[RiskFlagResult],
        razorpay_context: Optional[Dict[str, Any]] = None,
        pre_auth_context: Optional[Dict[str, Any]] = None,
    ) -> BillAnalysisResult:
        if not self.client:
            return self._synthesize_fallback(hospital_name, total_amount, items, flags)

        payload_context = {
            "hospital_name": hospital_name,
            "total_billed_amount": total_amount,
            "items_count": len(items),
            "line_items_summary": [
                {"name": it.item_name, "category": it.category, "unit_price": it.unit_price, "total": it.total_amount}
                for it in items[:50]
            ],
            "detected_risk_flags": [
                {"type": f.flag_type, "severity": f.severity, "impact": f.amount_impact, "citation": f.statutory_citation, "desc": f.description}
                for f in flags
            ],
        }

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=3000,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": json.dumps(payload_context)}]
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.endswith("```"):
                raw = raw[:-3]
            parsed = json.loads(raw.strip())
            return BillAnalysisResult(
                plain_summary=parsed.get("plain_summary", "Audit complete."),
                risk_score=int(parsed.get("risk_score", 40)),
                potential_savings=float(parsed.get("potential_savings", sum(f.amount_impact for f in flags))),
                statutory_violations=parsed.get("statutory_violations", []),
                actions=parsed.get("actions", []),
                dispute_letter_draft=parsed.get("dispute_letter_draft", "")
            )
        except Exception as exc:
            logger.error(f"Claude API analysis fallback: {exc}")
            return self._synthesize_fallback(hospital_name, total_amount, items, flags)

    async def stream_chat_response(
        self,
        messages: List[Dict[str, str]],
        bill_context: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        if not self.async_client:
            yield "Claude AI streaming is running in offline mode. Please configure ANTHROPIC_API_KEY."
            return

        chat_system = f"{SYSTEM_PROMPT}\nBill Context: {json.dumps(bill_context)}"
        try:
            async with self.async_client.messages.stream(
                model=self.model,
                max_tokens=2000,
                system=chat_system,
                messages=messages
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as exc:
            yield f"[Error: {str(exc)}]"

    def _synthesize_fallback(
        self,
        hospital_name: str,
        total_amount: float,
        items: List[ExtractedLineItem],
        flags: List[RiskFlagResult]
    ) -> BillAnalysisResult:
        total_disputed = sum(f.amount_impact for f in flags)
        violations = [
            {
                "law_cited": f.statutory_citation or "Consumer Protection Act, 2019",
                "item_affected": f.item_name or "Hospital Bill Item",
                "violation_details": f.description,
                "financial_impact": f.amount_impact
            }
            for f in flags
        ]
        summary = (
            f"Forensic audit of {hospital_name} invoice (₹{total_amount:,.2f}) identified {len(flags)} billing anomalies "
            f"with potential unjustified overcharges of ₹{total_disputed:,.2f}."
        )
        actions = [
            {"step_number": 1, "title": "Submit Itemized Dispute Letter", "description": "Challenge statutory price ceiling overcharges with billing department.", "urgency": "IMMEDIATE"},
            {"step_number": 2, "title": "Hold Disputed Surcharge", "description": "Pay undisputed portion while escalating unjustified items.", "urgency": "HIGH"},
        ]
        letter = f"""To,\nThe Medical Superintendent, {hospital_name}\n\nSubject: Formal Dispute Regarding Overcharges on Invoice Totaling ₹{total_amount:,.2f}\n\nSir/Madam,\nThis is formal notice that itemized charges totaling ₹{total_disputed:,.2f} violate statutory price ceilings (NPPA/DPCO/IRDAI). Demand is hereby made for immediate adjustment.\n\nYours sincerely,\nPatient Advocate"""
        return BillAnalysisResult(
            plain_summary=summary,
            risk_score=min(95, max(15, int((total_disputed / (total_amount or 1)) * 100))),
            potential_savings=round(total_disputed, 2),
            statutory_violations=violations,
            actions=actions,
            dispute_letter_draft=letter
        )
