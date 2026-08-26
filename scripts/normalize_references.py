#!/usr/bin/env python3
"""Normalize reference tables into standardized structured records."""

import os
import sys
import json
import yaml

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))


def main():
    print("[*] Normalizing government statutory references...")
    sources_cfg = os.path.join(BASE_DIR, "config", "sources.yaml")
    
    with open(sources_cfg, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    normalized_records = []
    
    # 1. NPPA Stents
    stents = cfg.get("sources", {}).get("nppa_stents", {})
    eff = stents.get("effective_date", "2023-03-25")
    so = stents.get("active_so", "S.O. 1335(E)")
    for item in stents.get("items", []):
        normalized_records.append({
            "source": "NPPA",
            "gazette_so": so,
            "effective_date": eff,
            "domain": "cardiac_stents",
            "item_name": item["canonical_name"],
            "allowed_ceiling_inr": item["ceiling_inr"],
            "gst_rate_pct": item["gst_pct"],
            "citation": f"NPPA Gazette {so} dt. {eff}"
        })

    # 2. NPPA Orthopedics
    ortho = cfg.get("sources", {}).get("nppa_orthopedic", {})
    eff_ortho = ortho.get("effective_date", "2023-08-16")
    so_ortho = ortho.get("active_so", "S.O. 2668(E)")
    for item in ortho.get("items", []):
        normalized_records.append({
            "source": "NPPA",
            "gazette_so": so_ortho,
            "effective_date": eff_ortho,
            "domain": "orthopedic_implants",
            "item_name": item["canonical_name"],
            "allowed_ceiling_inr": item["ceiling_inr"],
            "gst_rate_pct": item["gst_pct"],
            "citation": f"NPPA Gazette {so_ortho} dt. {eff_ortho}"
        })

    # 3. DPCO Essential Medicines
    dpco = cfg.get("sources", {}).get("dpco_nlem", {})
    eff_dpco = dpco.get("effective_date", "2023-03-31")
    so_dpco = dpco.get("active_so", "S.O. 1480(E)")
    for item in dpco.get("sample_drugs", []):
        normalized_records.append({
            "source": "DPCO",
            "gazette_so": so_dpco,
            "effective_date": eff_dpco,
            "domain": "essential_medicines",
            "item_name": item["name"],
            "formulation": item["formulation"],
            "allowed_ceiling_inr": item["ceiling_inr"],
            "gst_rate_pct": 12.0,
            "citation": f"DPCO Ceiling Price Gazette {so_dpco}"
        })

    out_path = os.path.join(BASE_DIR, "data", "processed", "normalized_statutory_records.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(normalized_records, f, indent=2)

    print(f"[✓] Normalized {len(normalized_records)} structured reference records to {out_path}")


if __name__ == "__main__":
    main()
