"""
National Hospital Registry for India.
Indexes major hospital networks, medical colleges, trust institutions,
and district facilities across Tier 1, Tier 2, and Tier 3 regions with NABH accreditation status.
"""
from typing import Dict, Any, Optional

HOSPITAL_REGISTRY = [
    # ── METRO CORPORATE CHAINS (TIER 1) ───────────────────────────────────────
    {"name": "Apollo Hospitals", "city": "Delhi NCR / Chennai / Hyderabad / Mumbai / Bangalore", "state": "Pan-India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_APOLLO_01"},
    {"name": "Max Super Speciality Hospital", "city": "Delhi / Saket / Vaishali / Dehradun / Mohali", "state": "North India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_MAX_01"},
    {"name": "Fortis Healthcare", "city": "Gurugram / Delhi / Mumbai / Bangalore / Mohali", "state": "Pan-India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_FORTIS_01"},
    {"name": "Manipal Hospital", "city": "Bengaluru / Delhi / Jaipur / Goa / Mangalore", "state": "Pan-India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_MANIPAL_01"},
    {"name": "Medanta - The Medicity", "city": "Gurugram / Lucknow / Patna / Indore", "state": "North / Central India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_MEDANTA_01"},
    {"name": "Narayana Health", "city": "Bengaluru / Kolkata / Jaipur / Ahmedabad", "state": "Pan-India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_NARAYANA_01"},
    {"name": "Aster DM Healthcare", "city": "Kochi / Bengaluru / Kozhikode / Hyderabad", "state": "South India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_ASTER_01"},
    {"name": "Yashoda Hospitals", "city": "Hyderabad / Secunderabad", "state": "Telangana", "tier": 1, "is_nabh": True, "rohini_id": "ROH_YASHODA_01"},
    {"name": "Care Hospitals", "city": "Hyderabad / Bhubaneswar / Visakhapatnam / Raipur", "state": "South / East India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_CARE_01"},
    {"name": "KIMS Hospitals (Krishna Institute of Medical Sciences)", "city": "Hyderabad / Nagpur / Secunderabad", "state": "South / Central India", "tier": 1, "is_nabh": True, "rohini_id": "ROH_KIMS_01"},

    # ── PREMIER TRUST & TEACHING INSTITUTIONS ─────────────────────────────────
    {"name": "Sir Ganga Ram Hospital", "city": "New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True, "rohini_id": "ROH_SGRH_01"},
    {"name": "P. D. Hinduja National Hospital", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True, "rohini_id": "ROH_HINDUJA_01"},
    {"name": "Lilavati Hospital and Research Centre", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True, "rohini_id": "ROH_LILAVATI_01"},
    {"name": "Kokilaben Dhirubhai Ambani Hospital", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True, "rohini_id": "ROH_KDAH_01"},
    {"name": "Christian Medical College (CMC)", "city": "Vellore", "state": "Tamil Nadu", "tier": 2, "is_nabh": True, "rohini_id": "ROH_CMC_01"},
    {"name": "Tata Memorial Hospital (TMC)", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True, "rohini_id": "ROH_TMC_01"},
    {"name": "Amrita Hospital", "city": "Faridabad / Kochi", "state": "Haryana / Kerala", "tier": 1, "is_nabh": True, "rohini_id": "ROH_AMRITA_01"},
    {"name": "Ruby Hall Clinic", "city": "Pune", "state": "Maharashtra", "tier": 2, "is_nabh": True, "rohini_id": "ROH_RUBY_01"},
    {"name": "Apollo Gleneagles Hospital", "city": "Kolkata", "state": "West Bengal", "tier": 1, "is_nabh": True, "rohini_id": "ROH_GLENEAGLES_01"},
    {"name": "SIMS Hospital", "city": "Chennai", "state": "Tamil Nadu", "tier": 1, "is_nabh": True, "rohini_id": "ROH_SIMS_01"},

    # ── TIER 2 & TIER 3 REGIONAL CENTERS ───────────────────────────────────────
    {"name": "Shalby Hospitals", "city": "Ahmedabad / Surat / Jaipur / Indore", "state": "West / Central India", "tier": 2, "is_nabh": True, "rohini_id": "ROH_SHALBY_01"},
    {"name": "Sahyadri Hospitals", "city": "Pune / Nashik / Karad", "state": "Maharashtra", "tier": 2, "is_nabh": True, "rohini_id": "ROH_SAHYADRI_01"},
    {"name": "Regency Hospital", "city": "Kanpur / Lucknow", "state": "Uttar Pradesh", "tier": 2, "is_nabh": True, "rohini_id": "ROH_REGENCY_01"},
    {"name": "Paras Hospitals", "city": "Patna / Panchkula / Ranchi / Udaipur", "state": "North / East India", "tier": 2, "is_nabh": True, "rohini_id": "ROH_PARAS_01"},
    {"name": "Apollo BSR Hospital", "city": "Bhilai / Raipur", "state": "Chhattisgarh", "tier": 3, "is_nabh": False, "rohini_id": "ROH_BSR_01"},
    {"name": "District Civil Hospital", "city": "District Headquarters", "state": "State Health Service", "tier": 3, "is_nabh": False, "rohini_id": "ROH_GOVT_01"}
]


def resolve_hospital(query: str, city_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Resolves any hospital name across India to its accreditation profile and tier.
    Defaults to Tier 1 NABH for corporate chains, or Tier 2/3 Non-NABH for local nursing homes.
    """
    if not query:
        return {
            "name": "Indian Healthcare Facility",
            "city": city_hint or "Metro City",
            "state": "India",
            "tier": 1,
            "is_nabh": True,
            "cghs_multiplier": 1.15  # NABH rate ceiling
        }

    import re
    q = re.sub(r"[^a-zA-Z0-9\s]", " ", query.lower()).strip()
    q_tokens = set(q.split())

    generic_words = {
        "hospital", "hospitals", "healthcare", "centre", "center", "clinic", "clinics",
        "super", "speciality", "specialty", "and", "of", "the", "institute", "institutes",
        "medical", "college", "colleges", "national", "research", "care", "health", "services", "sciences"
    }

    best_match = None
    best_score = 0

    non_generic_q = q_tokens - generic_words

    for h in HOSPITAL_REGISTRY:
        clean_h = re.sub(r"[^a-zA-Z0-9\s]", " ", h["name"].lower()).strip()
        brand_words = set(w for w in clean_h.split() if w not in generic_words and len(w) > 2)

        # Full substring match gets highest priority
        if clean_h in q or q in clean_h:
            score = 100
        else:
            # Overlap on distinctive brand words
            overlap = len(brand_words.intersection(non_generic_q))
            score = overlap * 25

        if score > best_score and score >= 25:
            best_score = score
            multiplier = 1.15 if h["is_nabh"] else 1.0
            best_match = {
                "name": h["name"],
                "city": city_hint or h["city"].split("/")[0].strip(),
                "state": h["state"],
                "tier": h["tier"],
                "is_nabh": h["is_nabh"],
                "rohini_id": h["rohini_id"],
                "cghs_multiplier": multiplier
            }

    if best_match:
        return best_match

    # If hospital is unknown/local private nursing home:
    # Check if user mentioned Tier 2/3 city
    tier = 2 if city_hint and any(c in city_hint.lower() for c in ["pune", "ahmedabad", "jaipur", "lucknow", "kanpur", "nagpur", "surat", "chandigarh", "bhopal", "patna", "indore", "kochi", "visakhapatnam", "coimbatore", "vadodara"]) else (3 if city_hint else 1)
    
    # Check if 'nabh' is mentioned in the text
    is_nabh = "nabh" in q or "accredit" in q

    return {
        "name": query.strip().title(),
        "city": city_hint or "State Health Jurisdiction",
        "state": "India",
        "tier": tier,
        "is_nabh": is_nabh,
        "cghs_multiplier": 1.15 if is_nabh else 1.0
    }
