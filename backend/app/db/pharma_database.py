"""
Comprehensive National Pharmaceutical & Chemical Database for India.
Covers all major therapeutic categories:
- High-end Antibiotics & Antimicrobials
- Injectable Anesthetics, Sedatives & Neuromuscular Blockers
- Analgesics, Antipyretics & NSAIDs
- Critical Care Vasopressors & Resuscitation Chemicals
- IV Fluids, Electrolytes & Volume Expanders
- Gastrointestinal, Anti-ulcer & Antiemetic Injections
- Cardiovascular Drugs & Anticoagulants (LMWH, Heparin)
- Respiratory Respules & Inhalants
- Oncology Chemotherapeutics (under NPPA Trade Margin Rationalization)
- Endocrine & Emergency Steroids

Maps both International Nonproprietary Names (Generic) and Indian Commercial Trade Brands.
"""
from typing import Dict, Any, List, Optional

PHARMA_CATALOG: List[Dict[str, Any]] = [
    # ── 1. ANTIBIOTICS & ANTIMICROBIALS (INJECTABLE & ORAL) ───────────────────
    {
        "generic_name": "Piperacillin + Tazobactam 4.5g Injection",
        "aliases": ["piptaz", "tazact", "zostum", "piperacillin tazobactam", "piperacillin", "tazobactam 4.5g"],
        "category": "antibiotic",
        "formulation": "Inj. 4.5g vial",
        "ceiling_inr": 440.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Meropenem 1g Injection",
        "aliases": ["meronem", "merocrit", "meromac", "meropenem 1g", "inj meropenem", "meropen"],
        "category": "antibiotic",
        "formulation": "Inj. 1g vial",
        "ceiling_inr": 950.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Meropenem 500mg Injection",
        "aliases": ["meronem 500", "meropenem 500mg", "merocrit 500"],
        "category": "antibiotic",
        "formulation": "Inj. 500mg vial",
        "ceiling_inr": 520.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Ceftriaxone 1g Injection",
        "aliases": ["monocef 1g", "monocef", "ceftriaxone", "oframax", "xone 1g", "inj ceftriaxone"],
        "category": "antibiotic",
        "formulation": "Inj. 1g vial",
        "ceiling_inr": 62.40,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Amoxicillin + Clavulanic Acid 1.2g Injection",
        "aliases": ["augmentin 1.2g", "augmentin", "clavum 1.2g", "amoxyclav", "moxikind cv 1.2g"],
        "category": "antibiotic",
        "formulation": "Inj. 1.2g vial",
        "ceiling_inr": 132.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Amoxicillin + Clavulanic Acid 625mg Tablet",
        "aliases": ["augmentin 625", "clavum 625", "moxikind cv 625", "tab amoxyclav"],
        "category": "antibiotic",
        "formulation": "Tab 625mg",
        "ceiling_inr": 21.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Colistin (Colistimethate Sodium) 1 Million IU Injection",
        "aliases": ["colistin 1m iu", "colistimethate", "colis monas", "walamycin", "xylistin 1miu"],
        "category": "antibiotic",
        "formulation": "Inj. 1M IU vial",
        "ceiling_inr": 850.00,
        "scheduled": True,
        "citation": "DPCO 2013 Special Order"
    },
    {
        "generic_name": "Colistin (Colistimethate Sodium) 2 Million IU Injection",
        "aliases": ["colistin 2m iu", "colistimethate 2miu", "xylistin 2miu"],
        "category": "antibiotic",
        "formulation": "Inj. 2M IU vial",
        "ceiling_inr": 1450.00,
        "scheduled": True,
        "citation": "DPCO 2013 Special Order"
    },
    {
        "generic_name": "Linezolid 600mg IV Infusion (300ml)",
        "aliases": ["linezolid iv", "lizomac iv", "linospan iv", "linezolid 600mg"],
        "category": "antibiotic",
        "formulation": "IV Infusion 300ml",
        "ceiling_inr": 280.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Vancomycin 1g Injection",
        "aliases": ["vancocin 1g", "vanlid 1g", "vancomycin 1g", "inj vancomycin"],
        "category": "antibiotic",
        "formulation": "Inj. 1g vial",
        "ceiling_inr": 420.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Cefuroxime 1.5g Injection",
        "aliases": ["ceftum 1.5g", "supacef 1.5g", "cefuroxime 1.5g", "inj cefuroxime"],
        "category": "antibiotic",
        "formulation": "Inj. 1.5g vial",
        "ceiling_inr": 185.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Amikacin 500mg / 2ml Injection",
        "aliases": ["mikacin 500mg", "amikacin 500mg", "amicin 500", "inj amikacin"],
        "category": "antibiotic",
        "formulation": "Inj. 500mg/2ml vial",
        "ceiling_inr": 68.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },
    {
        "generic_name": "Metronidazole 500mg / 100ml IV Infusion",
        "aliases": ["flagyl iv", "metrogyl iv", "metronidazole iv", "metrogyl 100ml"],
        "category": "antibiotic",
        "formulation": "IV Infusion 100ml",
        "ceiling_inr": 22.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM S.O. Notification"
    },

    # ── 2. ANALGESICS, ANTIPYRETICS & PAIN MANAGEMENT ────────────────────────
    {
        "generic_name": "Paracetamol 1000mg IV Infusion (100ml)",
        "aliases": ["paracetamol iv", "perfalgan", "pacimol iv", "fepanil iv", "pcm iv 100ml"],
        "category": "analgesic",
        "formulation": "IV 100ml bottle",
        "ceiling_inr": 42.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM Notification"
    },
    {
        "generic_name": "Paracetamol 650mg Tablet",
        "aliases": ["dolo 650", "calpol 650", "pacimol 650", "paracetamol 650"],
        "category": "analgesic",
        "formulation": "Tab 650mg",
        "ceiling_inr": 2.10,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM Notification"
    },
    {
        "generic_name": "Tramadol 50mg / 1ml Injection",
        "aliases": ["tramazac", "supridol", "tramadol 50mg", "inj tramadol", "contramal"],
        "category": "analgesic",
        "formulation": "Inj. 50mg/ml ampoule",
        "ceiling_inr": 18.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM Notification"
    },
    {
        "generic_name": "Diclofenac Sodium 75mg / 1ml Aqueous Injection",
        "aliases": ["dynapar aq", "voveran 75", "diclogel inj", "diclofenac aq", "inj dynapar"],
        "category": "analgesic",
        "formulation": "Inj. 75mg/ml ampoule",
        "ceiling_inr": 24.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM Notification"
    },
    {
        "generic_name": "Fentanyl Citrate 50mcg / 1ml Injection (2ml)",
        "aliases": ["fentanyl 2ml", "fendrop", "inj fentanyl", "fentanyl 100mcg"],
        "category": "analgesic_anesthetic",
        "formulation": "Inj. 50mcg/ml 2ml ampoule",
        "ceiling_inr": 45.00,
        "scheduled": True,
        "citation": "DPCO Narcotic Schedule Norm"
    },
    {
        "generic_name": "Morphine Sulphate 10mg / 1ml Injection",
        "aliases": ["morphine 10mg", "inj morphine", "vermor"],
        "category": "analgesic_anesthetic",
        "formulation": "Inj. 10mg/ml ampoule",
        "ceiling_inr": 38.00,
        "scheduled": True,
        "citation": "DPCO Narcotic Schedule Norm"
    },

    # ── 3. GASTROINTESTINAL & ANTI-ULCER INJECTIONS ───────────────────────────
    {
        "generic_name": "Pantoprazole 40mg Injection",
        "aliases": ["pantocid iv", "pan 40 inj", "pantoprazole 40mg", "inj pantoprazole", "pantosec inj"],
        "category": "gastrointestinal",
        "formulation": "Inj. 40mg vial",
        "ceiling_inr": 54.20,
        "scheduled": True,
        "citation": "DPCO 2013 Paragraph 24"
    },
    {
        "generic_name": "Pantoprazole 40mg Tablet",
        "aliases": ["pantocid 40", "pan 40 tab", "pantop 40", "pantodac 40"],
        "category": "gastrointestinal",
        "formulation": "Tab 40mg",
        "ceiling_inr": 9.80,
        "scheduled": True,
        "citation": "DPCO 2013 Paragraph 24"
    },
    {
        "generic_name": "Rabeprazole 20mg Injection",
        "aliases": ["rabeloc iv", "happi iv", "rabeprazole 20mg inj", "inj rabeprazole"],
        "category": "gastrointestinal",
        "formulation": "Inj. 20mg vial",
        "ceiling_inr": 62.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Ondansetron 4mg / 2ml Injection",
        "aliases": ["emset 2ml", "zofer 2ml", "ondansetron 4mg", "inj ondansetron", "emigo"],
        "category": "gastrointestinal",
        "formulation": "Inj. 4mg/2ml ampoule",
        "ceiling_inr": 12.80,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },

    # ── 4. CARDIOVASCULAR & ANTICOAGULANTS ────────────────────────────────────
    {
        "generic_name": "Enoxaparin 40mg / 0.4ml Prefilled Syringe",
        "aliases": ["clexane 40mg", "lonopin 40mg", "enoxaparin 40", "enoxaparin pfs 40", "clexane 0.4ml"],
        "category": "anticoagulant",
        "formulation": "Inj. 40mg PFS",
        "ceiling_inr": 420.00,
        "scheduled": True,
        "citation": "DPCO 2013 S.O. Ceiling Price"
    },
    {
        "generic_name": "Enoxaparin 60mg / 0.6ml Prefilled Syringe",
        "aliases": ["clexane 60mg", "lonopin 60mg", "enoxaparin 60", "clexane 0.6ml", "enoxaparin pfs 60"],
        "category": "anticoagulant",
        "formulation": "Inj. 60mg PFS",
        "ceiling_inr": 580.00,
        "scheduled": True,
        "citation": "DPCO 2013 S.O. Ceiling Price"
    },
    {
        "generic_name": "Heparin Sodium 5000 IU / 5ml Injection",
        "aliases": ["heparin 5000", "beparine 5000", "inj heparin", "heparin sodium"],
        "category": "anticoagulant",
        "formulation": "Inj. 5000 IU/5ml vial",
        "ceiling_inr": 92.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Nitroglycerin 25mg / 5ml Injection (NTG)",
        "aliases": ["nitroglycerin iv", "ntg iv", "myonit inj", "nitrolingual inj", "inj ntg"],
        "category": "cardiovascular",
        "formulation": "Inj. 25mg/5ml ampoule",
        "ceiling_inr": 115.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Noradrenaline 2mg / 2ml Injection (Norepinephrine)",
        "aliases": ["noradrenaline 2ml", "norad 2ml", "norepinephrine", "inj norad"],
        "category": "critical_care",
        "formulation": "Inj. 2mg/2ml ampoule",
        "ceiling_inr": 65.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Atorvastatin 20mg Tablet",
        "aliases": ["atorva 20", "atorlip 20", "lipicure 20", "atorvastatin 20"],
        "category": "cardiovascular",
        "formulation": "Tab 20mg",
        "ceiling_inr": 14.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Clopidogrel 75mg Tablet",
        "aliases": ["clopivas 75", "plavix 75", "clopilet 75", "clopidogrel 75"],
        "category": "cardiovascular",
        "formulation": "Tab 75mg",
        "ceiling_inr": 11.20,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },

    # ── 5. IV FLUIDS, ELECTROLYTES & EXPANDERS ────────────────────────────────
    {
        "generic_name": "Normal Saline 0.9% IV Infusion (500ml)",
        "aliases": ["normal saline 500ml", "ns 500ml", "0.9% nacl 500ml", "sodium chloride 0.9%"],
        "category": "iv_fluid",
        "formulation": "500ml IV bottle",
        "ceiling_inr": 24.50,
        "scheduled": True,
        "citation": "DPCO 2013 Price Cap Order"
    },
    {
        "generic_name": "Normal Saline 0.9% IV Infusion (100ml)",
        "aliases": ["ns 100ml", "normal saline 100ml", "0.9% nacl 100ml"],
        "category": "iv_fluid",
        "formulation": "100ml IV bottle",
        "ceiling_inr": 18.00,
        "scheduled": True,
        "citation": "DPCO 2013 Price Cap Order"
    },
    {
        "generic_name": "Ringer Lactate (RL) IV Infusion (500ml)",
        "aliases": ["ringer lactate 500ml", "rl 500ml", "compound sodium lactate 500ml"],
        "category": "iv_fluid",
        "formulation": "500ml IV bottle",
        "ceiling_inr": 26.00,
        "scheduled": True,
        "citation": "DPCO 2013 Price Cap Order"
    },
    {
        "generic_name": "Dextrose Normal Saline (DNS 500ml)",
        "aliases": ["dns 500ml", "dextrose saline 500ml", "dextrose 5% in 0.9% nacl"],
        "category": "iv_fluid",
        "formulation": "500ml IV bottle",
        "ceiling_inr": 25.50,
        "scheduled": True,
        "citation": "DPCO 2013 Price Cap Order"
    },
    {
        "generic_name": "Mannitol 20% IV Infusion (100ml / 350ml)",
        "aliases": ["mannitol 20%", "mannitol 100ml", "mannitol 350ml", "osmogyl"],
        "category": "iv_fluid",
        "formulation": "IV bottle",
        "ceiling_inr": 48.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Human Albumin 20% Infusion (100ml)",
        "aliases": ["human albumin 20%", "albumin 100ml", "albumin 20% 100ml", "buminate 20%"],
        "category": "plasma_expander",
        "formulation": "100ml glass vial",
        "ceiling_inr": 3650.00,
        "scheduled": True,
        "citation": "DPCO Special Notification / NPPA"
    },
    {
        "generic_name": "Potassium Chloride (KCl) 15% Injection (10ml)",
        "aliases": ["potcl", "kcl 10ml", "potassium chloride inj", "inj kcl"],
        "category": "electrolyte",
        "formulation": "10ml ampoule",
        "ceiling_inr": 18.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Sodium Bicarbonate 7.5% Injection (25ml)",
        "aliases": ["sodabicarb 25ml", "sodium bicarb", "inj soda bicarb", "bicarb 25ml"],
        "category": "electrolyte",
        "formulation": "25ml vial",
        "ceiling_inr": 32.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },

    # ── 6. ANESTHESIA CHEMICALS & SURGICAL GASES ──────────────────────────────
    {
        "generic_name": "Propofol 1% Injection (20ml)",
        "aliases": ["propofol 20ml", "diprivan 20ml", "neorof 20ml", "inj propofol", "propovan"],
        "category": "anesthetic",
        "formulation": "Inj. 10mg/ml 20ml vial",
        "ceiling_inr": 145.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Bupivacaine 0.5% Heavy Injection (4ml)",
        "aliases": ["bupivacaine heavy", "sensorcaine heavy", "anawin heavy 4ml", "spinal bupivacaine"],
        "category": "anesthetic",
        "formulation": "Inj. 0.5% 4ml ampoule",
        "ceiling_inr": 36.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Lignocaine (Lidocaine) 2% Injection (30ml)",
        "aliases": ["xylocaine 2%", "lignocaine 2% 30ml", "lidocaine 30ml", "inj xylocaine"],
        "category": "anesthetic",
        "formulation": "Inj. 2% 30ml vial",
        "ceiling_inr": 28.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Atracurium Besylate 25mg / 2.5ml Injection",
        "aliases": ["atracurium 2.5ml", "tracrium", "inj atracurium", "atracurium 25mg"],
        "category": "anesthetic_blocker",
        "formulation": "Inj. 25mg/2.5ml ampoule",
        "ceiling_inr": 110.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Medical Oxygen (per Cubic Meter)",
        "aliases": ["medical oxygen", "oxygen cylinder charge", "o2 therapy per hour", "oxygen flow"],
        "category": "medical_gas",
        "formulation": "Per Cubic Meter (Gas)",
        "ceiling_inr": 25.71,  # NPPA capped liquid medical oxygen ex-factory + compression
        "scheduled": True,
        "citation": "NPPA Gazette Notification S.O. 3322(E)"
    },

    # ── 7. EMERGENCY HORMONES & STEROIDS ──────────────────────────────────────
    {
        "generic_name": "Hydrocortisone Sodium Succinate 100mg Injection",
        "aliases": ["hydrocort 100mg", "primacort 100mg", "inj hydrocortisone", "succicort 100"],
        "category": "steroid",
        "formulation": "Inj. 100mg vial",
        "ceiling_inr": 42.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Dexamethasone Sodium Phosphate 4mg / 2ml Injection",
        "aliases": ["decadron 2ml", "dexona 2ml", "dexamethasone 2ml", "inj dexona"],
        "category": "steroid",
        "formulation": "Inj. 4mg/2ml vial",
        "ceiling_inr": 11.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Methylprednisolone Sodium Succinate 1g Injection",
        "aliases": ["solu-medrol 1g", "methylprednisolone 1g", "solumedrol 1g", "inj methylprednisolone 1000mg"],
        "category": "steroid",
        "formulation": "Inj. 1g vial",
        "ceiling_inr": 920.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Methylprednisolone Sodium Succinate 125mg Injection",
        "aliases": ["solu-medrol 125mg", "solumedrol 125", "methylprednisolone 125mg"],
        "category": "steroid",
        "formulation": "Inj. 125mg vial",
        "ceiling_inr": 195.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Human Insulin Regular 40 IU / ml (10ml vial)",
        "aliases": ["actrapid 40 iu", "human actrapid", "regular insulin 40", "huminsulin r 40"],
        "category": "endocrine",
        "formulation": "10ml vial",
        "ceiling_inr": 158.00,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },

    # ── 8. RESPIRATORY RESPULES & INHALANTS ───────────────────────────────────
    {
        "generic_name": "Budesonide 0.5mg / 2ml Nebulizing Suspension",
        "aliases": ["budecort 0.5mg", "pulmicort 0.5mg", "budesonide respules", "budesonide 2ml"],
        "category": "respiratory",
        "formulation": "Respule 2ml",
        "ceiling_inr": 19.80,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Levosalbutamol 0.63mg / 2.5ml Respules",
        "aliases": ["levolin 0.63mg", "levolin respules", "levosalbutamol respules"],
        "category": "respiratory",
        "formulation": "Respule 2.5ml",
        "ceiling_inr": 11.20,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },
    {
        "generic_name": "Ipratropium Bromide 500mcg / 2ml Respules",
        "aliases": ["ipratropium respules", "ipravent respules", "duolin respules"],
        "category": "respiratory",
        "formulation": "Respule 2ml",
        "ceiling_inr": 14.50,
        "scheduled": True,
        "citation": "DPCO 2013 / NLEM"
    },

    # ── 9. ONCOLOGY & SPECIALTY INJECTABLES ────────────────────────────────────
    {
        "generic_name": "Paclitaxel 100mg / 16.7ml Injection",
        "aliases": ["paclitaxel 100mg", "taxol 100mg", "paclitax 100", "inj paclitaxel"],
        "category": "oncology",
        "formulation": "Inj. 100mg vial",
        "ceiling_inr": 2150.00,
        "scheduled": True,
        "citation": "NPPA Trade Margin Rationalization (TMR 30% Cap)"
    },
    {
        "generic_name": "Gemcitabine 1g Injection",
        "aliases": ["gemcitabine 1g", "gemita 1g", "gemzar 1g", "inj gemcitabine"],
        "category": "oncology",
        "formulation": "Inj. 1g vial",
        "ceiling_inr": 2800.00,
        "scheduled": True,
        "citation": "NPPA Trade Margin Rationalization (TMR 30% Cap)"
    },
    {
        "generic_name": "Oxaliplatin 100mg Injection",
        "aliases": ["oxaliplatin 100mg", "eloxatin 100", "oxitan 100", "inj oxaliplatin"],
        "category": "oncology",
        "formulation": "Inj. 100mg vial",
        "ceiling_inr": 2950.00,
        "scheduled": True,
        "citation": "NPPA Trade Margin Rationalization (TMR 30% Cap)"
    },
    {
        "generic_name": "Filgrastim 300mcg Prefilled Syringe (G-CSF)",
        "aliases": ["neupogen 300", "grafeel 300", "filgrastim 300mcg", "g-csf 300mcg"],
        "category": "oncology_support",
        "formulation": "Inj. 300mcg PFS",
        "ceiling_inr": 1250.00,
        "scheduled": True,
        "citation": "DPCO Special Schedule / NPPA"
    }
]


def lookup_pharmaceutical(item_name: str) -> Optional[Dict[str, Any]]:
    """
    Universally lookup any pharmaceutical, injection, chemical, IV fluid,
    or antibiotic by generic or Indian trade brand name.
    """
    if not item_name:
        return None
        
    import re
    # Clean input
    clean_q = re.sub(r"[^a-zA-Z0-9\s]", " ", item_name.lower())
    clean_q = re.sub(r"\s+", " ", clean_q).strip()
    q_tokens = set(clean_q.split())

    best_match = None
    best_score = 0

    for drug in PHARMA_CATALOG:
        gen_clean = re.sub(r"[^a-zA-Z0-9\s]", " ", drug["generic_name"].lower())
        
        # 1. Direct match on generic name
        if gen_clean in clean_q or clean_q in gen_clean:
            return drug

        # 2. Match on Trade Brand / Alias
        for alias in drug["aliases"]:
            clean_alias = re.sub(r"[^a-zA-Z0-9\s]", " ", alias.lower()).strip()
            if clean_alias in clean_q or clean_q in clean_alias:
                return drug

            # Token overlap check
            alias_tokens = set(clean_alias.split())
            if alias_tokens.issubset(q_tokens):
                return drug

            overlap = len(alias_tokens.intersection(q_tokens))
            if overlap > best_score and overlap >= 1:
                # If distinctive brand name matches
                first_alias_word = clean_alias.split()[0]
                if first_alias_word in q_tokens and len(first_alias_word) >= 4:
                    best_score = overlap + 2
                    best_match = drug

    return best_match
