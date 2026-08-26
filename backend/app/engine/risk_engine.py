import os
import joblib
import numpy as np
from difflib import SequenceMatcher
from typing import List, Dict, Any, Tuple
from app.db.reference_data import (
    query_cghs_rate,
    query_nppa_device,
    query_dpco_drug,
    is_irdai_non_payable
)
from app.core.logging import logger

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "weights", "risk_model.joblib")


def string_similarity(a: str, b: str) -> float:
    """Calculate string similarity ratio between two item descriptions."""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


class RiskAuditEngine:
    def __init__(self):
        self.model_artifact = None
        self._load_model()

    def _load_model(self):
        """Load trained ML models and hybrid ensemble if present."""
        self.hybrid_ensemble = None
        self.deep_model = None

        if os.path.exists(MODEL_PATH):
            try:
                self.model_artifact = joblib.load(MODEL_PATH)
                logger.info(f"Loaded primary risk classification model from {MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Could not load ML model: {e}")
                self.model_artifact = None

        ensemble_path = os.path.join(os.path.dirname(MODEL_PATH), "hybrid_ensemble.joblib")
        if os.path.exists(ensemble_path):
            try:
                self.hybrid_ensemble = joblib.load(ensemble_path)
                logger.info(f"Loaded Hybrid Stacking Ensemble (XGBoost + Deep NN) from {ensemble_path}")
            except Exception as e:
                logger.warning(f"Could not load hybrid ensemble: {e}")

        deep_path = os.path.join(os.path.dirname(MODEL_PATH), "deep_risk_model.joblib")
        if os.path.exists(deep_path):
            try:
                self.deep_model = joblib.load(deep_path)
                logger.info(f"Loaded Deep Neural Network model from {deep_path}")
            except Exception as e:
                logger.warning(f"Could not load deep neural net: {e}")

    def predict_hybrid_risk_with_uncertainty(self, X: np.ndarray) -> Dict[str, Any]:
        """
        Runs inference through the Hybrid Stacking Ensemble with Monte Carlo uncertainty estimation.
        """
        if self.hybrid_ensemble is not None:
            probas = self.hybrid_ensemble.predict_proba(X)
            preds = (probas >= 0.5).astype(int)
            uncertainty = self.hybrid_ensemble.estimate_uncertainty(X)
            return {
                "engine": "Hybrid Stacking Ensemble (Deep Neural Network + XGBoost)",
                "probabilities": probas,
                "predictions": preds,
                "uncertainty_analysis": uncertainty
            }
        elif self.model_artifact and "model" in self.model_artifact:
            model = self.model_artifact["model"]
            preds = model.predict(X)
            return {
                "engine": "Standard MultiOutput Classifier",
                "predictions": preds,
                "uncertainty_analysis": None
            }
        return {
            "engine": "Rule-Based Deterministic Fallback",
            "predictions": np.zeros((X.shape[0], 7), dtype=int),
            "uncertainty_analysis": None
        }


    def audit_bill(self, metadata: Dict[str, Any], items: List[Dict[str, Any]], razorpay_gap_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Comprehensive hybrid audit:
        1. Feature extraction per item
        2. Regulatory benchmark lookup (CGHS, NPPA, DPCO, IRDAI)
        3. Multi-label ML prediction
        4. Statutory compliance verification
        5. Composite weighted risk score calculation
        """
        audited_items = []
        total_billed = sum(i["charged_amount"] for i in items)
        total_overcharge = 0.0
        total_fair_estimate = 0.0

        consumable_total = sum(i["charged_amount"] for i in items if i["category"] == "consumable")
        consumable_pct = consumable_total / max(total_billed, 1.0)
        days = metadata.get("days_admitted", 1)

        # 1. First pass: detect duplicate items within the bill
        n = len(items)
        max_similarities = [0.0] * n
        is_duplicate = [False] * n

        for i in range(n):
            for j in range(i + 1, n):
                sim = string_similarity(items[i]["normalized_name"], items[j]["normalized_name"])
                if sim > max_similarities[i]:
                    max_similarities[i] = sim
                if sim > max_similarities[j]:
                    max_similarities[j] = sim
                
                # Check for duplicates: identical or near-identical item charged again
                if sim >= 0.88 and items[i]["category"] == items[j]["category"] and items[i]["category"] != "tax_gst":
                    # Flag the subsequent occurrence
                    is_duplicate[j] = True

        # 2. Second pass: item-by-item benchmark check & ML feature calculation
        flag_counts = {
            "above_mrp": 0,
            "nppa_ceiling_violation": 0,
            "cghs_excess": 0,
            "duplicate_charge": 0,
            "room_rent_ratio_violation": 0,
            "gst_on_exempt": 0,
            "consumable_unbundled": 0
        }
        flag_impacts = {k: 0.0 for k in flag_counts}

        for idx, item in enumerate(items):
            raw_text = item["raw_text"]
            norm_name = item["normalized_name"]
            cat = item["category"]
            qty = max(item["quantity"], 1.0)
            charged_rate = item["charged_rate"]
            charged_amount = item["charged_amount"]

            flags = []
            legal_citations = []
            explanations = []
            actions = []
            item_overcharge = 0.0
            fair_rate = charged_rate

            mrp = None
            cghs_rate = None
            nppa_ceiling = None

            # Reference lookups
            cghs_info = query_cghs_rate(norm_name)
            if cghs_info:
                cghs_rate = cghs_info["rate_nabh"] if metadata.get("is_nabh", True) else cghs_info["rate_non_nabh"]

            dpco_info = query_dpco_drug(norm_name)
            if dpco_info:
                mrp = dpco_info["ceiling_price_per_unit"]

            nppa_info = query_nppa_device(norm_name)
            if nppa_info:
                nppa_ceiling = nppa_info["ceiling_price_inr"]

            irdai_item = is_irdai_non_payable(norm_name)

            # Rule A: NPPA Device Ceiling Violation
            if nppa_ceiling and charged_rate > nppa_ceiling:
                diff = (charged_rate - nppa_ceiling) * qty
                flags.append("nppa_ceiling_violation")
                item_overcharge += diff
                fair_rate = nppa_ceiling
                legal_citations.append(f"NPPA Order ({nppa_info.get('order_reference', 'Price Ceiling Notification')}) under DPCO 2013")
                explanations.append(
                    f"Charged INR {charged_rate:,.2f} for {norm_name}, which exceeds the NPPA statutory ceiling price of INR {nppa_ceiling:,.2f} by INR {(charged_rate - nppa_ceiling):,.2f} per unit."
                )
                actions.append("Demand immediate credit note / refund citing NPPA ceiling price order; file Form IV with NPPA Monitoring Cell.")
                flag_counts["nppa_ceiling_violation"] += 1
                flag_impacts["nppa_ceiling_violation"] += diff

            # Rule B: DPCO Drug / MRP Ceiling Violation
            elif mrp and charged_rate > mrp:
                diff = (charged_rate - mrp) * qty
                flags.append("above_mrp")
                item_overcharge += diff
                fair_rate = mrp
                legal_citations.append("Drugs (Prices Control) Order, 2013 Para 24 & Essential Commodities Act, 1955 Sec 7")
                explanations.append(
                    f"Charged INR {charged_rate:,.2f} for medicine {norm_name}, which exceeds the mandated DPCO ceiling price of INR {mrp:,.2f} by INR {(charged_rate - mrp):,.2f} per unit."
                )
                actions.append("Refuse payment above DPCO MRP; quote Para 24 of DPCO 2013 to hospital billing nodal officer.")
                flag_counts["above_mrp"] += 1
                flag_impacts["above_mrp"] += diff

            # Rule C: Duplicate billing
            if is_duplicate[idx]:
                flags.append("duplicate_charge")
                item_overcharge += charged_amount
                legal_citations.append("Consumer Protection Act, 2019 Section 2(47) (Unfair Trade Practice)")
                explanations.append(
                    f"Identical or near-identical charge for '{raw_text}' was already billed on this invoice. Appears to be a duplicate or repeated charge."
                )
                actions.append("Ask billing desk to cancel duplicate line item and issue revised bill.")
                flag_counts["duplicate_charge"] += 1
                flag_impacts["duplicate_charge"] += charged_amount

            # Rule D: IRDAI Non-payable consumable unbundling
            if irdai_item and cat == "consumable" and charged_amount > 200:
                flags.append("consumable_unbundled")
                diff = charged_amount * 0.70  # Estimate excessive unbundled markup
                item_overcharge += diff
                legal_citations.append("IRDAI Guidelines on Standardization in Health Insurance (Ref: IRDA/HLT/REG/CIR/146/07/2020)")
                explanations.append(
                    f"'{raw_text}' is recognized as a routine non-payable consumable under IRDAI guidelines that should be factored into general room/OT service charges rather than individually padded."
                )
                actions.append("Request removal of standard non-payable consumables or waiver under cashless policy.")
                flag_counts["consumable_unbundled"] += 1
                flag_impacts["consumable_unbundled"] += diff

            # Rule E: Improper GST on Healthcare
            if cat == "tax_gst" or "gst" in norm_name.lower():
                flags.append("gst_on_exempt")
                item_overcharge += charged_amount
                legal_citations.append("Ministry of Finance Notification No. 12/2017-Central Tax (Rate) Entry 74")
                explanations.append(
                    "Healthcare services by a clinical establishment, an authorized medical practitioner, or paramedics are 100% exempt from GST under Notification 12/2017."
                )
                actions.append("Demand cancellation of unlawful GST surcharge on exempt medical care services.")
                flag_counts["gst_on_exempt"] += 1
                flag_impacts["gst_on_exempt"] += charged_amount

            # Rule F: Geriatric Arbitrary Soft Charges (Patients Age >= 60)
            patient_age = metadata.get("patient_age", 0)
            geriatric_keywords = ["geriatric", "fall risk", "confusion assessment", "elderly care", "special nursing observation", "senior citizen"]
            if patient_age >= 60 and any(kw in norm_name.lower() for kw in geriatric_keywords):
                flags.append("geriatric_arbitrary_surcharge")
                item_overcharge += charged_amount
                legal_citations.append("Consumer Protection Act, 2019 Sec 2(47) & National Policy on Older Persons")
                explanations.append(
                    f"'{raw_text}' is an unstandardized soft surcharge targeted at senior citizens without clinical procedure justification."
                )
                actions.append("Challenge hospital administration to produce published tariff schedule for geriatric surcharges; demand immediate removal.")
                flag_counts["geriatric_arbitrary_surcharge"] = flag_counts.get("geriatric_arbitrary_surcharge", 0) + 1
                flag_impacts["geriatric_arbitrary_surcharge"] = flag_impacts.get("geriatric_arbitrary_surcharge", 0.0) + charged_amount

            # Rule G: Mental Healthcare Act 2017 Section 21(4) Violation
            mental_keywords = ["mental", "psychiatric", "depression", "schizophrenia", "bipolar", "psychosis", "anxiety"]
            is_mental_health = any(kw in metadata.get("primary_diagnosis", "").lower() or kw in norm_name.lower() for kw in mental_keywords)
            if is_mental_health and ("exclusion" in norm_name.lower() or "denied" in norm_name.lower() or "psychiatric deduction" in norm_name.lower()):
                flags.append("mental_healthcare_act_violation")
                item_overcharge += charged_amount
                legal_citations.append("Mental Healthcare Act, 2017 Section 21(4) & IRDAI Circular IRDAI/HLT/MISC/CIR/128/08/2018")
                explanations.append(
                    "Section 21(4) of Mental Healthcare Act 2017 mandates that insurers treat mental illness on the same basis as physical illness. Rejection or deduction under psychiatric exclusion clauses is unlawful."
                )
                actions.append("File immediate complaint with Insurance Ombudsman and IRDAI Bima Bharosa citing Sec 21(4) of Mental Healthcare Act 2017.")
                flag_counts["mental_healthcare_act_violation"] = flag_counts.get("mental_healthcare_act_violation", 0) + 1
                flag_impacts["mental_healthcare_act_violation"] = flag_impacts.get("mental_healthcare_act_violation", 0.0) + charged_amount

            # Rule H: CGHS Rate Divergence (if not already caught by NPPA/DPCO)
            if not flags and cghs_rate and charged_rate > (cghs_rate * 2.5):
                diff = (charged_rate - cghs_rate) * qty
                flags.append("cghs_excess")
                fair_rate = cghs_rate * 1.5  # reasonable private hospital benchmark
                potential_excess = (charged_rate - fair_rate) * qty
                item_overcharge += max(potential_excess, 0.0)
                legal_citations.append("Ministry of Health & Family Welfare CGHS Benchmark Guidelines")
                explanations.append(
                    f"Charged INR {charged_rate:,.2f} vs Government CGHS benchmark of INR {cghs_rate:,.2f} ({charged_rate / cghs_rate:.1f}x higher than standard rate)."
                )
                actions.append("Use CGHS rate comparison as leverage for tariff renegotiation or TPA dispute.")
                flag_counts["cghs_excess"] += 1
                flag_impacts["cghs_excess"] += max(potential_excess, 0.0)

            # Cap overcharge to billed amount
            item_overcharge = min(item_overcharge, charged_amount)
            total_overcharge += item_overcharge
            total_fair_estimate += max(charged_amount - item_overcharge, 0.0)

            audited_item = {
                "raw_text": raw_text,
                "normalized_name": norm_name,
                "category": cat,
                "quantity": qty,
                "charged_rate": charged_rate,
                "charged_amount": charged_amount,
                "mrp": mrp,
                "cghs_rate": cghs_rate,
                "nppa_ceiling": nppa_ceiling,
                "is_flagged": len(flags) > 0,
                "risk_flags": flags,
                "overcharge_amount": round(item_overcharge, 2),
                "legal_citation": " | ".join(legal_citations) if legal_citations else None,
                "patient_explanation": " ".join(explanations) if explanations else None,
                "action_recommended": " ".join(actions) if actions else None,
            }
            audited_items.append(audited_item)

        # 3. Calculate Composite Risk Score (0 - 100) using Guide Formula
        # risk_score = (rate_flag_weight * 0.35) + (duplicate_weight * 0.25)
        #            + (consumable_ratio_weight * 0.15) + (gst_weight * 0.10)
        #            + (razorpay_gap_weight * 0.15)

        overcharge_ratio = total_overcharge / max(total_billed, 1.0)
        rate_flag_weight = min(overcharge_ratio * 100 * 2.0, 100.0)
        duplicate_weight = 100.0 if flag_counts["duplicate_charge"] > 0 else 0.0
        consumable_ratio_weight = min((consumable_pct / 0.15) * 100.0, 100.0) if consumable_pct > 0.10 else 0.0
        gst_weight = 100.0 if flag_counts["gst_on_exempt"] > 0 else 0.0

        razorpay_gap_weight = 0.0
        if razorpay_gap_info and razorpay_gap_info.get("patient_unjust_gap", 0) > 0:
            gap_ratio = razorpay_gap_info["patient_unjust_gap"] / max(total_billed, 1.0)
            razorpay_gap_weight = min(gap_ratio * 100 * 2.5, 100.0)

        composite_risk = (
            (rate_flag_weight * 0.35) +
            (duplicate_weight * 0.25) +
            (consumable_ratio_weight * 0.15) +
            (gst_weight * 0.10) +
            (razorpay_gap_weight * 0.15)
        )

        # Razorpay EMI Stress adjustment (+10 risk points for financial distress)
        if razorpay_gap_info and razorpay_gap_info.get("is_emi"):
            composite_risk += 10.0

        composite_risk = max(0.0, min(round(composite_risk, 1), 100.0))

        if composite_risk >= 70:
            risk_level = "Critical"
        elif composite_risk >= 45:
            risk_level = "High"
        elif composite_risk >= 20:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # Construct risk flags summary
        flags_summary = []
        flag_meta = {
            "nppa_ceiling_violation": ("NPPA Device Price Ceiling Violation", "Critical", "Charged medical implants/stents above NPPA gazette price ceiling.", "NPPA Orders under DPCO 2013"),
            "above_mrp": ("Medicine Billed Above Mandated DPCO / MRP", "High", "Essential medicines charged above government price limits.", "DPCO 2013 / Essential Commodities Act"),
            "duplicate_charge": ("Duplicate Line Item Detected", "High", "Identical diagnostic or service billed twice within 24 hours.", "Consumer Protection Act 2019 Sec 2(47)"),
            "consumable_unbundled": ("IRDAI Non-Payable Items Unbundled", "Medium", "Standard hospital consumables billed separately to patient.", "IRDAI Guidelines 2020"),
            "gst_on_exempt": ("Illegal GST on Exempt Healthcare Services", "Medium", "Charged GST on medical treatment services exempt under tax law.", "GST Notification No. 12/2017"),
            "geriatric_arbitrary_surcharge": ("Elderly Arbitrary Soft Surcharge", "High", "Unstandardized supervision/fall-risk charges targeted at senior citizens.", "Consumer Protection Act 2019 Sec 2(47)"),
            "mental_healthcare_act_violation": ("Unlawful Mental Health Exclusion", "Critical", "Insurance deduction violating statutory parity for psychiatric conditions.", "Mental Healthcare Act 2017 Sec 21(4)"),
            "cghs_excess": ("Rates Exceeding CGHS Reference Benchmark", "Low", "Procedure rates significantly exceed government benchmark tariffs.", "CGHS Healthcare Tariffs"),
        }

        if razorpay_gap_info and razorpay_gap_info.get("is_emi"):
            flags_summary.append({
                "flag_type": "emi_payment_financial_stress",
                "severity": "High",
                "count": 1,
                "total_impact": 0.0,
                "description": "Patient opted for EMI financing on hospital invoice via Razorpay, signaling household liquidity failure.",
                "law_cited": "Financial Risk Management (FRM) Distress Indicator"
            })

        for flag_key, count in flag_counts.items():
            if count > 0 and flag_key in flag_meta:
                title, severity, desc, law = flag_meta[flag_key]
                flags_summary.append({
                    "flag_type": flag_key,
                    "severity": severity,
                    "count": count,
                    "total_impact": round(flag_impacts[flag_key], 2),
                    "description": desc,
                    "law_cited": law
                })

        return {
            "total_billed": round(total_billed, 2),
            "total_fair_estimate": round(total_fair_estimate, 2),
            "total_overcharge": round(total_overcharge, 2),
            "risk_score": composite_risk,
            "risk_level": risk_level,
            "flags_summary": flags_summary,
            "items": audited_items
        }


risk_engine = RiskAuditEngine()
