import json
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator
from app.core.credentials import credentials
from app.core.config import settings
from app.core.logging import logger


MASTER_SYSTEM_PROMPT = """
You are MedBill AI (CuraVeris), India's premier expert in Indian hospital billing audits, medical coding, healthcare law, and patient rights.

You will receive:
1. A structured hospital bill audit (JSON)
2. Benchmark rates (CGHS tariffs, NPPA device price ceilings, DPCO drug caps, IRDAI non-payable list)
3. Payment context (billed amount, TPA insurance sanctioned, patient out-of-pocket payment)

Your tasks:
A. VERIFY: Check every line item for statutory and regulatory violations.
   - Medicines billed above MRP / DPCO ceiling -> DPCO 2013 violation
   - Devices / implants billed above NPPA ceiling -> NPPA Gazette Order violation
   - GST applied to healthcare / inpatient services -> GST Exemption Notification No. 12/2017 violation
   - IRDAI standard non-payable consumables unbundled and charged -> IRDAI Health Insurance Circular violation
   - Duplicate charges within 24 hours -> Consumer Protection Act 2019 Unfair Trade Practice violation

B. EXPLAIN: Write clear, empathetic, jargon-free explanations that an average Indian patient or family member can understand immediately. Always state explicit Rupee amounts (INR / ₹) overcharged.

C. ACT: Cite the exact legal act and direct the patient to the proper regulatory or judicial authority:
   - Hospital Billing Grievance Desk / Medical Superintendent
   - National Pharmaceutical Pricing Authority (NPPA) Monitoring Cell
   - IRDAI Bima Bharosa Grievance Portal
   - District Consumer Disputes Redressal Commission (DCDRC)

Return concise, actionable, authoritative advice.
"""


class AIExplainer:
    def __init__(self):
        pass

    @property
    def has_anthropic(self) -> bool:
        return bool(credentials.llm.anthropic_api_key)

    @property
    def has_gemini(self) -> bool:
        return bool(credentials.llm.gemini_api_key)

    @property
    def has_openai(self) -> bool:
        return bool(credentials.llm.openai_api_key)

    def generate_plain_summary(self, audit_result: Dict[str, Any], metadata: Dict[str, Any]) -> str:
        """
        Generate comprehensive, patient-friendly narrative summary.
        """
        total_billed = audit_result["total_billed"]
        overcharge = audit_result["total_overcharge"]
        risk_score = audit_result["risk_score"]
        flags = audit_result["flags_summary"]
        hospital = metadata.get("hospital_name", "the hospital")

        if overcharge <= 0 and risk_score < 20:
            return (
                f"Your bill of INR {total_billed:,.2f} from {hospital} appears to comply with "
                f"standard government benchmarks (CGHS and DPCO). No major price violations or duplicate charges "
                f"were detected. Risk Score is {risk_score}/100 (Low Risk)."
            )

        flag_mentions = []
        for f in flags:
            flag_mentions.append(f"{f['flag_type'].replace('_', ' ').title()} (impact: INR {f['total_impact']:,.2f})")

        flag_str = ", ".join(flag_mentions) if flag_mentions else "rate divergences"

        summary = (
            f"Audit completed for {hospital}. Out of a total billed amount of INR {total_billed:,.2f}, "
            f"we identified an estimated INR {overcharge:,.2f} in potential overcharges and non-compliant billings, "
            f"resulting in a composite Risk Score of {risk_score}/100 ({audit_result['risk_level']} Risk). "
            f"Key violations detected include: {flag_str}. Under Indian law (DPCO 2013, NPPA Orders, and Consumer "
            f"Protection Act 2019), you have the legal right to challenge these charges and request a refund or credit note."
        )
        return summary

    async def stream_chat_response(
        self,
        bill_context: Dict[str, Any],
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat tokens to frontend. Uses OpenAI / Gemini / Anthropic cloud LLM if configured,
        or deterministic statutory medical legal assistant fallback.
        """
        # Try OpenAI streaming first if API key configured
        openai_key = credentials.llm.openai_api_key or settings.OPENAI_API_KEY
        if openai_key and openai_key.startswith("sk-"):
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=openai_key)
                context_str = json.dumps(bill_context, indent=2, default=str)
                messages = [
                    {"role": "system", "content": f"{MASTER_SYSTEM_PROMPT}\n\nInvoice Audit Context:\n{context_str}"}
                ]
                if chat_history:
                    for h in chat_history[-6:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": user_message})

                stream = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    stream=True,
                    temperature=0.2,
                    max_tokens=800
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content
                return
            except Exception as e:
                logger.debug(f"OpenAI live stream failed ({e}), falling back to deterministic assistant")

        # Deterministic Medico-Legal Rule Engine Fallback
        user_msg_lower = user_message.lower()
        hospital = bill_context.get("hospital_name", "the hospital")
        total_billed = bill_context.get("total_billed", 0)
        overcharge = bill_context.get("total_overcharge", 0)
        risk_score = bill_context.get("risk_score", 0)
        flags = bill_context.get("risk_flags_summary", [])
        items = bill_context.get("items", [])

        if "gst" in user_msg_lower:
            response = (
                f"Regarding the GST charges on your bill from {hospital}:\n\n"
                f"Under Ministry of Finance **Notification No. 12/2017-Central Tax (Rate), Entry 74**, "
                f"all healthcare services provided by a clinical establishment, authorized medical practitioner, "
                f"or paramedics are **100% exempt from GST**.\n\n"
                f"If the hospital charged 5%, 12%, or 18% GST on room rent, ICU, nursing, or medical consultations, "
                f"this is a statutory violation. You should demand that the hospital billing desk immediately cancel "
                f"the tax entry and issue a revised invoice without GST."
            )
        elif "stent" in user_msg_lower or "nppa" in user_msg_lower or "implant" in user_msg_lower:
            response = (
                f"Regarding medical devices and implants:\n\n"
                f"Under the **National Pharmaceutical Pricing Authority (NPPA)** Gazette Notification, "
                f"the maximum price for a **Drug-Eluting Coronary Stent (DES)** is capped at **₹38,260** "
                f"(inclusive of GST), and a Bare Metal Stent (BMS) at ₹10,500. Similarly, knee implants are capped "
                f"under NPPA orders between ₹62,770 and ₹69,940.\n\n"
                f"Hospitals are legally prohibited from charging a patient even one rupee above the NPPA ceiling. "
                f"Violations carry penal consequences under Section 7 of the Essential Commodities Act, 1955. "
                f"You can file a formal complaint directly via NPPA's Pharma Jan Samadhan portal."
            )
        elif "duplicate" in user_msg_lower:
            dup_items = [i for i in items if "duplicate_charge" in i.get("risk_flags", [])]
            if dup_items:
                names = ", ".join(f"'{i['raw_text']}' (₹{i['charged_amount']:,.2f})" for i in dup_items[:3])
                response = (
                    f"Yes, our audit detected duplicate charges on your bill: {names}.\n\n"
                    f"Under **Section 2(47) of the Consumer Protection Act, 2019**, billing a patient twice for "
                    f"the same diagnostic test, nursing fee, or procedure constitutes an **Unfair Trade Practice**.\n\n"
                    f"You should submit a written notice to the Hospital Grievance Officer requesting an immediate "
                    f"credit note for these duplicate charges."
                )
            else:
                response = "No duplicate line items were flagged on this specific invoice."
        elif "dispute" in user_msg_lower or "letter" in user_msg_lower or "action" in user_msg_lower:
            response = (
                f"Here are the recommended legal dispute steps for your bill (INR {overcharge:,.2f} overcharged):\n\n"
                f"1. **Hospital Grievance Cell**: Submit our pre-filled dispute letter to the Medical Superintendent. "
                f"Most corporate hospitals issue a credit note within 48-72 hours to prevent regulatory escalation.\n"
                f"2. **NPPA Monitoring Cell**: If stent or medicine price caps were breached, lodge a complaint via "
                f"Pharma Jan Samadhan (Form IV).\n"
                f"3. **IRDAI Bima Bharosa**: If your insurer or TPA deducted legitimate room rent or surgery packages, "
                f"escalate via bimaonline.irdai.gov.in.\n"
                f"4. **Consumer Court**: For unresolved overcharges exceeding ₹20,000, file an e-daakhil petition under "
                f"the Consumer Protection Act 2019."
            )
        else:
            response = (
                f"Hello, I am MedBill AI. I have analyzed your bill from {hospital} for INR {total_billed:,.2f}.\n\n"
                f"• Detected Overcharges: **INR {overcharge:,.2f}**\n"
                f"• Risk Score: **{risk_score}/100**\n\n"
                f"You can ask me specific questions such as:\n"
                f"- 'Is the GST on this bill legal?'\n"
                f"- 'Why is the stent / implant price flagged?'\n"
                f"- 'What are the duplicate charges on day 2?'\n"
                f"- 'How do I draft a dispute letter for a refund?'"
            )

        # Stream words with small delays to simulate realistic token streaming
        words = response.split(" ")
        for word in words:
            yield word + " "
            await asyncio.sleep(0.02)


ai_explainer = AIExplainer()
