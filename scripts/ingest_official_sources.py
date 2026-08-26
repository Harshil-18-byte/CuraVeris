#!/usr/bin/env python3
"""Ingest and discover official statutory pricing sources from configuration."""

import os
import sys
import argparse
import yaml
import json

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))


def main():
    parser = argparse.ArgumentParser(description="Ingest official government source files.")
    parser.add_argument("--config", default="config/sources.yaml", help="Path to sources YAML config")
    parser.add_argument("--outdir", default="data/raw_sources", help="Output directory for raw sources")
    args = parser.parse_args()

    config_path = os.path.join(BASE_DIR, args.config)
    if not os.path.exists(config_path):
        print(f"[!] Sources config not found at {config_path}")
        sys.exit(1)

    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    out_dir = os.path.join(BASE_DIR, args.outdir)
    os.makedirs(out_dir, exist_ok=True)

    print(f"[*] Reading statutory target sources from {args.config}...")
    sources = cfg.get("sources", {})
    manifest = []

    for name, sdata in sources.items():
        authority = sdata.get("authority")
        doc_type = sdata.get("document_type")
        url = sdata.get("target_url")
        effective = sdata.get("effective_date")
        print(f"  -> Discovered source [{name}]: {authority} | {doc_type} | Eff: {effective}")
        
        manifest.append({
            "source_id": name,
            "authority": authority,
            "url": url,
            "document_type": doc_type,
            "effective_date": effective,
            "status": "INGESTED_METADATA"
        })

    manifest_path = os.path.join(out_dir, "sources_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[✓] Successfully ingested {len(sources)} source references to {manifest_path}")


if __name__ == "__main__":
    main()
