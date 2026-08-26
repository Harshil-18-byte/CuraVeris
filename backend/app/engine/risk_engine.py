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
        1. Bill-level feature pre-computation (fixes train/inference skew)
        2. Per-item regulatory benchmark lookup (CGHS, NPPA, DPCO, IRDAI)
        3. Deterministic multi-label statutory compliance checks
        4. ML inference on bill-level feature matrix (hybrid XGBoost + MLP ensemble)
        5. Composite weighted risk score (deterministic 90% + ML 10%)
        """
        from app.ml.dataset_generator import CATEGORIES, FLAG_NAMES

        audited_items = []
        total_billed = sum(i["charged_amount"] for i in items)
        total_fair_estimate = 0.0
        total_overcharge = 0.0

        consumable_total = sum(i["charged_amount"] for i in items if i["category"] == "consumable")
        consumable_pct = consumable_total / max(total_billed, 1.0)
        days = metadata.get("days_admitted", 1)

        n = len(items)
        amounts = [i["charged_amount"] for i in items]
        sorted_amounts = sorted(amounts)

        # -----------------------------------------------------------------------
        # Bill-level feature pre-computation — must match training feature schema
        # to eliminate the train/inference skew on description_similarity_max and
        # amount_percentile.
        # -----------------------------------------------------------------------
        # description_similarity_max[i] = highest similarity between item i and any other item
        max_similarities = [0.0] * n
        is_duplicate = [False] * n

        for i in range(n):
            for j in range(i + 1, n):
                sim = string_similarity(items[i]["normalized_name"], items[j]["normalized_name"])
                if sim > max_similarities[i]:
                    max_similarities[i] = sim
                if sim > max_similarities[j]:
                    max_similarities[j] = sim
                if sim >= 0.88 and items[i]["category"] == items[j]["category"] and items[i]["category"] != "tax_gst":
                    is_duplicate[j] = True

        # amount_percentile[i] = percentile rank of charged_amount within this bill
        amount_percentiles = []
        for amt in amounts:
            rank = sum(1 for a in sorted_amounts if a <= amt)
            amount_percentiles.append(rank / max(n, 1))

        # Reference lookups per item (needed for ML features and rule checks)
        item_refs = []
        for item in items:
            norm_name = item["normalized_name"]
            cghs_info = query_cghs_rate(norm_name)
            dpco_info = query_dpco_drug(norm_name)
            nppa_info = query_nppa_device(norm_name)
            cghs_rate = None
            if cghs_info:
                cghs_rate = cghs_info["rate_nabh"] if metadata.get("is_nabh", True) else cghs_info["rate_non_nabh"]
            mrp = dpco_info["ceiling_price_per_unit"] if dpco_info else None
            nppa_ceiling = nppa_info["ceiling_price_inr"] if nppa_info else None
            item_refs.append({"cghs_rate": cghs_rate, "mrp": mrp, "nppa_ceiling": nppa_ceiling,
                               "cghs_info": cghs_info, "dpco_info": dpco_info, "nppa_info": nppa_info})

        # -----------------------------------------------------------------------
        # Build ML feature matrix X — same schema as prepare_features() in
        # train_risk_model.py to eliminate train/inference feature skew.
        # -----------------------------------------------------------------------
        X_rows = []
        for idx, item in enumerate(items):
            refs = item_refs[idx]
            charged_rate = item["charged_rate"]
            qty = max(item["quantity"], 1.0)

            rate_vs_cghs = charged_rate / max(refs["cghs_rate"] or charged_rate, 1.0)
            rate_vs_mrp = charged_rate / max(refs["mrp"] or charged_rate, 1.0)

            # Quantity z-score within this bill
            all_qtys = [i["quantity"] for i in items]
            qty_mean = sum(all_qtys) / max(len(all_qtys), 1)
            qty_std = (sum((q - qty_mean) ** 2 for q in all_qtys) / max(len(all_qtys), 1)) ** 0.5
            qty_zscore = (qty - qty_mean) / max(qty_std, 1e-6)

            cat = item["category"]
            cat_vector = [1 if cat == c else 0 for c in CATEGORIES]

            feature_row = [
                rate_vs_cghs,
                rate_vs_mrp,
                qty_zscore,
                float(days),
                consumable_pct,
                float(metadata.get("is_package", 0)),
                float(1 if metadata.get("icd_10") else 0),
                amount_percentiles[idx],           # Bill-level context — no longer zeroed
                max_similarities[idx],             # Bill-level context — no longer zeroed
            ] + cat_vector
            X_rows.append(feature_row)

        X = np.array(X_rows, dtype=np.float32)

        # Run ML inference — result is advisory; deterministic rules are authoritative
        ml_result = self.predict_hybrid_risk_with_uncertainty(X)
        ml_probas = ml_result.get("probabilities")
        ml_preds = ml_result.get("predictions")
        ml_uncertainty = ml_result.get("uncertainty_analysis")

        # Average ML violation probability across all items and labels → aggregate ML risk signal
        if ml_probas is not None:
            ml_mean_proba = float(np.mean(ml_probas))  # 0.0–1.0 scale
        else:
            ml_mean_proba = 0.0

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

            # Use pre-computed reference data (avoids duplicate DB queries and
            # ensures the item loop and the ML feature matrix use the same values)
            refs = item_refs[idx]
            mrp = refs["mrp"]
            cghs_rate = refs["cghs_rate"]
            nppa_ceiling = refs["nppa_ceiling"]
            cghs_info = refs["cghs_info"]
            nppa_info = refs["nppa_info"]
            dpco_info = refs["dpco_info"]
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

        # 3. Calculate Composite Risk Score (0 – 100)
        #
        # Deterministic rules (authoritative):  90% weight total
        #   - Rate overcharge signal:            31.5% (= 0.35 * 0.9)
        #   - Duplicate charge:                  22.5% (= 0.25 * 0.9)
        #   - Consumable unbundling ratio:        13.5% (= 0.15 * 0.9)
        #   - GST on exempt services:             9.0%  (= 0.10 * 0.9)
        #   - Razorpay payment gap:              13.5%  (= 0.15 * 0.9)
        # ML ensemble signal (advisory):         10% weight
        #   - ml_mean_proba * 100 -> 0–100 signal
        #
        # The 90/10 split deliberately keeps deterministic rules dominant.
        # ML output is labeled 'indicative' because the model is synthetically trained.

        overcharge_ratio = total_overcharge / max(total_billed, 1.0)
        rate_flag_weight = min(overcharge_ratio * 100 * 2.0, 100.0)
        duplicate_weight = 100.0 if flag_counts["duplicate_charge"] > 0 else 0.0
        consumable_ratio_weight = min((consumable_pct / 0.15) * 100.0, 100.0) if consumable_pct > 0.10 else 0.0
        gst_weight = 100.0 if flag_counts["gst_on_exempt"] > 0 else 0.0

        razorpay_gap_weight = 0.0
        if razorpay_gap_info and razorpay_gap_info.get("patient_unjust_gap", 0) > 0:
            gap_ratio = razorpay_gap_info["patient_unjust_gap"] / max(total_billed, 1.0)
            razorpay_gap_weight = min(gap_ratio * 100 * 2.5, 100.0)

        deterministic_risk = (
            (rate_flag_weight * 0.35) +
            (duplicate_weight * 0.25) +
            (consumable_ratio_weight * 0.15) +
            (gst_weight * 0.10) +
            (razorpay_gap_weight * 0.15)
        )

        # ML signal contribution (indicative — synthetically trained model)
        ml_risk_contribution = ml_mean_proba * 100.0 * 0.10

        # Statutory rules are authoritative: deterministic violations are never diluted
        composite_risk = max(deterministic_risk, 0.90 * deterministic_risk + ml_risk_contribution)


        # EMI stress adjustment (+10 risk points — financial distress signal)
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
            "items": audited_items,
            # ML inference metadata — advisory signal, not authoritative
            "ml_inference": {
                "engine": ml_result.get("engine", "Rule-Based Deterministic Fallback"),
                "mean_violation_probability": round(ml_mean_proba, 4),
                "risk_contribution_points": round(ml_risk_contribution, 2),
                "uncertainty_analysis": ml_uncertainty,
                "note": "Indicative only. Model trained on synthetic data; deterministic statutory rules are authoritative.",
            },
        }


risk_engine = RiskAuditEngine()
