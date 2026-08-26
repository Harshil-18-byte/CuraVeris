from app.db.reference_data import (
    query_cghs_rate,
    query_nppa_device,
    query_dpco_drug,
    is_irdai_non_payable
)


def test_cghs_lookup():
    # Test consultation lookup
    match = query_cghs_rate("Specialist Consultation (MD/MS)")
    assert match is not None
    assert match["rate_nabh"] >= 500

    # Test procedure lookup
    match_proc = query_cghs_rate("Appendectomy Laparoscopic")
    assert match_proc is not None
    assert match_proc["rate_nabh"] >= 15000


def test_nppa_lookup():
    # Test coronary stent ceiling
    stent = query_nppa_device("Coronary Stent Drug Eluting (DES)")
    assert stent is not None
    assert stent["ceiling_price_inr"] == 38260.00

    # Test knee implant ceiling
    knee = query_nppa_device("Knee Implant System Posterior Stabilized")
    assert knee is not None
    assert knee["ceiling_price_inr"] > 50000


def test_dpco_lookup():
    # 1. Gastrointestinal: Pantoprazole
    panto = query_dpco_drug("Inj. Pantoprazole 40mg")
    assert panto is not None
    assert panto["ceiling_price_per_unit"] <= 60.0

    # 2. High-end Antibiotics: Piptaz, Meronem, Monocef
    piptaz = query_dpco_drug("Inj. Piptaz 4.5g")
    assert piptaz is not None
    assert "Piperacillin" in piptaz["drug_name"]
    assert piptaz["ceiling_price_per_unit"] == 440.0

    meronem = query_dpco_drug("Inj. Meronem 1g")
    assert meronem is not None
    assert "Meropenem" in meronem["drug_name"]

    monocef = query_dpco_drug("Inj. Monocef 1g")
    assert monocef is not None
    assert "Ceftriaxone" in monocef["drug_name"]

    # 3. Pain & NSAIDs: Dynapar AQ & Perfalgan
    dynapar = query_dpco_drug("Inj. Dynapar AQ 1ml")
    assert dynapar is not None
    assert "Diclofenac" in dynapar["drug_name"]

    perfalgan = query_dpco_drug("Perfalgan 100ml IV Infusion")
    assert perfalgan is not None
    assert "Paracetamol" in perfalgan["drug_name"]

    # 4. Critical Care & Anticoagulant: Clexane & Norad
    clexane = query_dpco_drug("Inj. Clexane 40mg / 0.4ml PFS")
    assert clexane is not None
    assert "Enoxaparin" in clexane["drug_name"]

    norad = query_dpco_drug("Inj. Norad 2ml")
    assert norad is not None
    assert "Noradrenaline" in norad["drug_name"]

    # 5. IV Fluids & Plasma Expanders: NS 500ml & Albumin
    ns = query_dpco_drug("Normal Saline 0.9% 500ml")
    assert ns is not None
    assert ns["ceiling_price_per_unit"] <= 25.0

    albumin = query_dpco_drug("Human Albumin 20% 100ml Infusion")
    assert albumin is not None
    assert albumin["ceiling_price_per_unit"] > 3000.0

    # 6. Anesthesia & Medical Gas: Propofol & Medical Oxygen
    propofol = query_dpco_drug("Inj. Propofol 1% 20ml")
    assert propofol is not None
    assert "Propofol" in propofol["drug_name"]

    oxygen = query_dpco_drug("Medical Oxygen per Cubic Meter")
    assert oxygen is not None
    assert oxygen["ceiling_price_per_unit"] < 30.0

    # 7. Oncology: Paclitaxel
    chemo = query_dpco_drug("Inj. Paclitaxel 100mg")
    assert chemo is not None
    assert "Paclitaxel" in chemo["drug_name"]


def test_irdai_non_payable():
    res = is_irdai_non_payable("Surgical Gloves Examination")
    assert res is not None

    res_kit = is_irdai_non_payable("Patient Welcome Admission Kit")
    assert res_kit is not None


def test_disease_registry_resolution():
    from app.db.disease_registry import lookup_disease_context

    # 1. Cardiology
    cad = lookup_disease_context("Acute Coronary Artery Disease with DES Stent")
    assert cad is not None
    assert cad["specialty"] == "Cardiology"
    assert "Coronary Stent" in cad["nppa_capped_implants"][0]

    # 2. Orthopedics
    tkr = lookup_disease_context("Severe Bilateral Knee Osteoarthritis TKR")
    assert tkr is not None
    assert tkr["specialty"] == "Orthopedics"
    assert tkr["typical_alos_days"] == 4

    # 3. Oncology
    cancer = lookup_disease_context("Carcinoma Breast Chemo Daycare")
    assert cancer is not None
    assert "Oncology" in cancer["specialty"]

    # 4. Nephrology
    ckd = lookup_disease_context("Chronic Kidney Disease Stage 5 Hemodialysis")
    assert ckd is not None
    assert ckd["specialty"] == "Nephrology"

    # 5. OB-GYN
    lscs = lookup_disease_context("Emergency LSCS Cesarean Delivery")
    assert lscs is not None
    assert lscs["specialty"] == "Obstetrics"

    # 6. Critical Care
    sepsis = lookup_disease_context("Severe Sepsis Septic Shock in ICU")
    assert sepsis is not None
    assert "ICU" in sepsis["specialty"]


def test_hospital_registry_resolution():
    from app.db.hospital_registry import resolve_hospital

    # Corporate Tier 1
    apollo = resolve_hospital("Apollo Hospitals Indraprastha New Delhi")
    assert apollo["name"] == "Apollo Hospitals"
    assert apollo["is_nabh"] is True
    assert apollo["tier"] == 1

    # South India Tier 1
    manipal = resolve_hospital("Manipal Hospital HAL Airport Road Bangalore")
    assert manipal["name"] == "Manipal Hospital"
    assert manipal["tier"] == 1

    # Trust / Premier Institute
    cmc = resolve_hospital("Christian Medical College CMC Vellore")
    assert cmc["name"] == "Christian Medical College (CMC)"
    assert cmc["is_nabh"] is True

    # Tier 2 Regional Center
    shalby = resolve_hospital("Shalby Multi-specialty Hospital Ahmedabad")
    assert shalby["name"] == "Shalby Hospitals"
    assert shalby["tier"] == 2

    # Unknown local nursing home fallback
    local_hosp = resolve_hospital("City Nursing Home and Trauma Centre", city_hint="Kanpur")
    assert local_hosp["tier"] == 2
    assert "City Nursing Home" in local_hosp["name"]
