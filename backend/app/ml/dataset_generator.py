"""
Generates synthetic annotated training dataset for hospital bill line item risk classification.
Models real-world distributions across Indian private healthcare billing.
"""
import random
from typing import List, Dict, Any, Optional

CATEGORIES = ["pharmacy", "procedure", "diagnostic", "room_nursing", "consumable", "tax_gst"]
FLAG_NAMES = [
    "above_mrp",
    "nppa_ceiling_violation",
    "cghs_excess",
    "duplicate_charge",
    "room_rent_ratio_violation",
    "gst_on_exempt",
    "consumable_unbundled"
]

def generate_synthetic_billing_data(num_samples: int = 2500, seed: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Generates realistic annotated hospital billing data with real-world clinical ambiguity:
    - Overlapping distributions between legitimate and illegitimate charges.
    - Legitimate repeated administrations (e.g. BID/TID antibiotics) with high description similarity.
    - Comorbidity-adjusted procedural markups that overlap with CGHS excess.
    - Borderline DPCO cold-chain/institutional pricing.
    - Human auditor disagreement & annotation noise (~5%).
    """
    if seed is not None:
        random.seed(seed)
    samples = []

    for i in range(num_samples):
        cat = random.choice(CATEGORIES)
        days = random.randint(1, 14)
        is_package = 1 if random.random() < 0.25 else 0
        has_icd = 1 if random.random() < 0.65 else 0
        
        flags = {flag: 0 for flag in FLAG_NAMES}
        
        # Base realistic background distributions
        rate_vs_cghs = max(0.4, random.gauss(1.15, 0.35))
        rate_vs_mrp = max(0.5, random.gauss(0.88, 0.15))
        qty_zscore = random.gauss(0.0, 1.0)
        desc_sim = random.betavariate(1.5, 4.0)  # Skewed toward lower similarity (0.1 - 0.4)
        amount_percentile = random.uniform(0.1, 0.85)
        consumable_pct = max(0.02, min(0.40, random.gauss(0.12, 0.06)))

        # 1. Pharmacy: DPCO above MRP violations with borderline institutional pricing
        if cat == "pharmacy":
            # 22% true violations, but continuous distribution with borderline cases
            if random.random() < 0.22:
                rate_vs_mrp = random.gauss(1.65, 0.50)  # Violations centered at 1.65x MRP
                flags["above_mrp"] = 1
                amount_percentile = random.uniform(0.45, 0.95)
            else:
                # Normal pricing, with occasional borderline institutional/cold-chain packaging (0.95 - 1.15)
                rate_vs_mrp = random.gauss(0.85, 0.12)
                if rate_vs_mrp > 1.05 and random.random() < 0.40:
                    # Borderline ambiguity: 40% considered minor violation by strict auditors
                    flags["above_mrp"] = 1

            # Legitimate repeated doses (BID/TID antibiotics) vs actual duplicate billing
            if random.random() < 0.18:
                desc_sim = random.uniform(0.82, 0.98)
                # Only 60% of high-similarity pharmacy items are fraudulent duplicates;
                # the other 40% are legitimate morning/evening repeated doses!
                if random.random() < 0.60:
                    flags["duplicate_charge"] = 1

        # 2. Procedure: NPPA medical device ceilings and CGHS benchmark divergence
        elif cat == "procedure":
            if random.random() < 0.18:
                # NPPA device overcharge (e.g. coronary stent or knee implant)
                rate_vs_cghs = random.gauss(3.0, 0.80)
                amount_percentile = random.uniform(0.75, 0.99)
                flags["nppa_ceiling_violation"] = 1
            elif random.random() < 0.30:
                # CGHS rate excess: private hospital markup without statutory cap
                rate_vs_cghs = random.gauss(2.4, 0.55)
                # Overlap: If comorbidity/ICD present, 30% are clinically justified exceptions
                if not (has_icd and random.random() < 0.30):
                    flags["cghs_excess"] = 1

            if random.random() < 0.08:
                desc_sim = random.uniform(0.85, 0.98)
                flags["duplicate_charge"] = 1

        # 3. Diagnostic: Lab & imaging overcharges and repeated tests
        elif cat == "diagnostic":
            if random.random() < 0.25:
                rate_vs_cghs = random.gauss(2.2, 0.60)
                flags["cghs_excess"] = 1
            # Repeat diagnostic tests (e.g. Daily CBC or Serum Electrolytes in ICU)
            if random.random() < 0.22:
                desc_sim = random.uniform(0.85, 0.99)
                qty_zscore = random.gauss(2.2, 0.8)
                # 50% are legitimate clinical ICU monitoring; 50% are redundant duplicate charges
                if random.random() < 0.50:
                    flags["duplicate_charge"] = 1

        # 4. Room & Nursing: Room rent ceiling vs sum insured ratio
        elif cat == "room_nursing":
            if random.random() < 0.28:
                rate_vs_cghs = random.gauss(2.6, 0.70)
                amount_percentile = random.uniform(0.65, 0.98)
                # Overlap: semi-private rooms near boundary (1.8x - 2.2x) might be borderline
                if rate_vs_cghs > 1.85:
                    flags["room_rent_ratio_violation"] = 1

        # 5. Consumables: IRDAI non-payable item unbundling
        elif cat == "consumable":
            consumable_pct = random.gauss(0.24, 0.08)
            qty_zscore = random.gauss(1.8, 0.9)
            # High consumable ratio in surgical package = unbundled consumables
            if consumable_pct > 0.16:
                # Polytrauma / burn cases legitimately have high consumables (~25% exception)
                if not (days > 7 and random.random() < 0.25):
                    flags["consumable_unbundled"] = 1

        # 6. Tax / GST: Tax charged on healthcare services
        elif cat == "tax_gst":
            # Some hospitals mistakenly bill GST on consultations or normal beds
            if random.random() < 0.35:
                flags["gst_on_exempt"] = 1

        # Add realistic label noise (~3-5% human auditor disagreement/classification fuzziness)
        for f in FLAG_NAMES:
            if random.random() < 0.03:
                flags[f] = 1 - flags[f]  # Flip bit to model real-world label noise

        sample = {
            "rate_vs_cghs_ratio": round(float(rate_vs_cghs), 4),
            "rate_vs_mrp_ratio": round(float(rate_vs_mrp), 4),
            "qty_zscore": round(float(qty_zscore), 4),
            "category": cat,
            "days_in_hospital": days,
            "consumable_pct": round(float(consumable_pct), 4),
            "is_package_item": is_package,
            "has_icd_code": has_icd,
            "amount_percentile": round(float(amount_percentile), 4),
            "description_similarity_max": round(float(desc_sim), 4),
            "labels": [flags[f] for f in FLAG_NAMES]
        }
        samples.append(sample)

    return samples
