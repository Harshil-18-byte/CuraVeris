---
{
  "id": "file_ez5qkze6",
  "filetype": "document",
  "filename": "GOVERNMENT_DATA_COLLECTION",
  "created_at": "2026-08-26T17:00:44.169Z",
  "updated_at": "2026-08-26T17:00:44.169Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# Government Data Collection — CGHS / NPPA / DPCO

## Purpose

Collect official government source files for hospital-bill auditing and model training. Originals are stored under `data/raw/` with a SHA-256 manifest.

## Run

```bash
python scripts/scrape_government_sources.py --max-pages 2000 --delay 1.0
```

For a fresh re-download:

```bash
python scripts/scrape_government_sources.py --refresh
```

## Raw-data layout

```text
data/raw/cghs/
data/raw/nppa_medical_devices/
data/raw/nppa_dpco_pricing/
data/raw/nppa_other/
```

## Provenance

Every downloaded file is written to:

```text
data/metadata/government_sources_manifest.jsonl
```

The manifest records:

- source URL
- landing page
- retrieval timestamp
- local path
- SHA-256
- HTTP status
- content type
- ETag / Last-Modified when available

## Important source interpretation

The current NPPA Medical Devices index is primarily a dated document/PDF index; it should not be assumed to contain one master Excel price-order file. The collector downloads every attachment it discovers from the official government pages instead of fabricating a missing Excel dataset.

## Recommended downstream processing

Do not train directly on the raw originals. First create `data/processed/` with parsed, versioned, normalized records containing source URL + effective date + document date + extraction method + row-level provenance.
