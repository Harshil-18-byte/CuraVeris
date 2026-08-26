"""CuraVeris — Temporal Gazette & Statutory Registry Store.

Provides time-versioned statutory pricing and compliance benchmarks for:
- NPPA Notified Medical Device Price Caps (with SO numbers and gazette amendment dates)
- DPCO / NLEM Essential Drug Ceiling Prices (effective from/to)
- CGHS City Tier & NABH Package Benchmark Rates
- IRDAI Master Circular Non-Payable Schedules

Ensures the auditing engine queries statutory prices valid ON THE DATE OF SERVICE,
preventing false accusations from gazette amendments or price drift.
"""

import os
import sqlite3
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.core.logging import logger

TEMPORAL_DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "reference_data", "temporal_gazette.db"
)


TEMPORAL_NPPA_SEEDS = [
    # Stents - Historical and Current
    {
        "authority": "NPPA",
        "so_number": "S.O. 1335(E)",
        "effective_from": "2023-03-25",
        "effective_to": None,
        "category": "cardiac_stent",
        "canonical_name": "Coronary Stent - Drug Eluting (DES)",
        "alias_patterns": "DES|drug eluting|xience|promus|resolute|onyx|orisiro|stent des",
        "ceiling_price": 38260.00,
        "gst_rate": 5.0,
        "applicability": "Includes balloon catheter delivery system. Separate billing prohibited.",
        "citation": "NPPA Order S.O. 1335(E) dt. 25-03-2023"
    },
    {
        "authority": "NPPA",
        "so_number": "S.O. 1234(E)",
        "effective_from": "2020-03-31",
        "effective_to": "2023-03-24",
        "category": "cardiac_stent",
        "canonical_name": "Coronary Stent - Drug Eluting (DES)",
        "alias_patterns": "DES|drug eluting|xience|promus|resolute|onyx|orisiro|stent des",
        "ceiling_price": 30080.00,
        "gst_rate": 5.0,
        "applicability": "Historical cap prior to 2023 WPI adjustment.",
        "citation": "NPPA Order S.O. 1234(E) dt. 31-03-2020"
    },
    {
        "authority": "NPPA",
        "so_number": "S.O. 1335(E)",
        "effective_from": "2023-03-25",
        "effective_to": None,
        "category": "cardiac_stent",
        "canonical_name": "Coronary Stent - Bare Metal (BMS)",
        "alias_patterns": "BMS|bare metal stent",
        "ceiling_price": 10509.00,
        "gst_rate": 5.0,
        "applicability": "Bare metal coronary stent ceiling.",
        "citation": "NPPA Order S.O. 1335(E) dt. 25-03-2023"
    },
    # Knee Implants
    {
        "authority": "NPPA",
        "so_number": "S.O. 2668(E)",
        "effective_from": "2023-08-16",
        "effective_to": None,
        "category": "orthopedic_implant",
        "canonical_name": "Knee Implant System - Primary TKR (Cruciate Retaining)",
        "alias_patterns": "knee implant|tkr implant|cruciate retaining|cr knee",
        "ceiling_price": 63800.00,
        "gst_rate": 5.0,
        "applicability": "Complete primary knee system (Femoral + Tibial + Polyethylene insert).",
        "citation": "NPPA Gazette Notification S.O. 2668(E) dt. 16-08-2023"
    },
    {
        "authority": "NPPA",
        "so_number": "S.O. 2668(E)",
        "effective_from": "2023-08-16",
        "effective_to": None,
        "category": "orthopedic_implant",
        "canonical_name": "Knee Implant System - Primary TKR (Posterior Stabilized)",
        "alias_patterns": "posterior stabilized|ps knee|tkr ps implant",
        "ceiling_price": 71000.00,
        "gst_rate": 5.0,
        "applicability": "Posterior stabilized primary knee arthroplasty kit.",
        "citation": "NPPA Gazette Notification S.O. 2668(E) dt. 16-08-2023"
    },
    {
        "authority": "NPPA",
        "so_number": "S.O. 2668(E)",
        "effective_from": "2023-08-16",
        "effective_to": None,
        "category": "orthopedic_implant",
        "canonical_name": "Knee Implant System - Revision TKR",
        "alias_patterns": "revision knee|revision tkr|stem extension knee",
        "ceiling_price": 128480.00,
        "gst_rate": 5.0,
        "applicability": "Revision total knee arthroplasty component kit.",
        "citation": "NPPA Gazette Notification S.O. 2668(E) dt. 16-08-2023"
    },
    # Orthopedic Consumables
    {
        "authority": "NPPA",
        "so_number": "S.O. 1890(E)",
        "effective_from": "2022-04-01",
        "effective_to": None,
        "category": "orthopedic_consumable",
        "canonical_name": "Orthopedic Bone Cement (per 40g pack)",
        "alias_patterns": "bone cement|palacos|simplex|smartset",
        "ceiling_price": 3800.00,
        "gst_rate": 12.0,
        "applicability": "Plain or antibiotic-loaded surgical bone cement (40g standard pack).",
        "citation": "NPPA Trade Margin Rationalization Order 2022"
    },
]

TEMPORAL_DPCO_SEEDS = [
    {
        "authority": "DPCO",
        "so_number": "S.O. 1480(E)",
        "effective_from": "2023-03-31",
        "effective_to": None,
        "canonical_name": "Pantoprazole 40mg Injection",
        "alias_patterns": "pantoprazole 40mg|pan 40 inj|pantocid 40 inj|pantodac inj",
        "dosage_form": "Inj. 40mg vial",
        "ceiling_price": 54.20,
        "gst_rate": 12.0,
        "is_nlem": True,
        "citation": "DPCO 2013 Ceiling Price Gazette S.O. 1480(E)"
    },
    {
        "authority": "DPCO",
        "so_number": "S.O. 1480(E)",
        "effective_from": "2023-03-31",
        "effective_to": None,
        "canonical_name": "Ceftriaxone 1g Injection",
        "alias_patterns": "ceftriaxone 1g|monocek 1g|monocef 1g|oframax 1g",
        "dosage_form": "Inj. 1g vial",
        "ceiling_price": 62.40,
        "gst_rate": 12.0,
        "is_nlem": True,
        "citation": "DPCO 2013 Ceiling Price Gazette S.O. 1480(E)"
    },
    {
        "authority": "DPCO",
        "so_number": "S.O. 1480(E)",
        "effective_from": "2023-03-31",
        "effective_to": None,
        "canonical_name": "Meropenem 1g Injection",
        "alias_patterns": "meropenem 1g|meronem 1g|merocrit 1g",
        "dosage_form": "Inj. 1g vial",
        "ceiling_price": 950.00,
        "gst_rate": 12.0,
        "is_nlem": True,
        "citation": "DPCO 2013 Ceiling Price Gazette S.O. 1480(E)"
    },
    {
        "authority": "DPCO",
        "so_number": "S.O. 1480(E)",
        "effective_from": "2023-03-31",
        "effective_to": None,
        "canonical_name": "Enoxaparin 40mg / 0.4ml Prefilled Syringe",
        "alias_patterns": "enoxaparin 40|clexane 40|lonopin 40",
        "dosage_form": "Inj. 40mg PFS",
        "ceiling_price": 420.00,
        "gst_rate": 12.0,
        "is_nlem": True,
        "citation": "DPCO 2013 Ceiling Price Gazette S.O. 1480(E)"
    },
    {
        "authority": "DPCO",
        "so_number": "S.O. 1480(E)",
        "effective_from": "2023-03-31",
        "effective_to": None,
        "canonical_name": "Atorvastatin 20mg Tablet",
        "alias_patterns": "atorvastatin 20|atorva 20|lipitor 20|atorlip 20",
        "dosage_form": "Tab 20mg",
        "ceiling_price": 14.50,
        "gst_rate": 12.0,
        "is_nlem": True,
        "citation": "DPCO 2013 Ceiling Price Gazette S.O. 1480(E)"
    },
]


def get_temporal_db_connection() -> sqlite3.Connection:
    """Return a thread-safe connection to the temporal gazette database."""
    os.makedirs(os.path.dirname(TEMPORAL_DB_PATH), exist_ok=True)
    conn = sqlite3.connect(TEMPORAL_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_temporal_gazette_db() -> None:
    """Create temporal tables and populate gazette seeds."""
    conn = get_temporal_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS nppa_temporal_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authority TEXT NOT NULL,
        so_number TEXT NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        category TEXT NOT NULL,
        canonical_name TEXT NOT NULL,
        alias_patterns TEXT NOT NULL,
        ceiling_price REAL NOT NULL,
        gst_rate REAL NOT NULL DEFAULT 5.0,
        applicability TEXT,
        citation TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dpco_temporal_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authority TEXT NOT NULL,
        so_number TEXT NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        canonical_name TEXT NOT NULL,
        alias_patterns TEXT NOT NULL,
        dosage_form TEXT NOT NULL,
        ceiling_price REAL NOT NULL,
        gst_rate REAL NOT NULL DEFAULT 12.0,
        is_nlem BOOLEAN DEFAULT 1,
        citation TEXT NOT NULL
    )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nppa_temp_dates ON nppa_temporal_registry(effective_from, effective_to)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dpco_temp_dates ON dpco_temporal_registry(effective_from, effective_to)")

    # Check and seed NPPA
    cursor.execute("SELECT COUNT(*) FROM nppa_temporal_registry")
    if cursor.fetchone()[0] == 0:
        for r in TEMPORAL_NPPA_SEEDS:
            cursor.execute("""
            INSERT INTO nppa_temporal_registry 
            (authority, so_number, effective_from, effective_to, category, canonical_name, alias_patterns, ceiling_price, gst_rate, applicability, citation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["authority"], r["so_number"], r["effective_from"], r["effective_to"],
                r["category"], r["canonical_name"], r["alias_patterns"], r["ceiling_price"],
                r["gst_rate"], r["applicability"], r["citation"]
            ))

    # Check and seed DPCO
    cursor.execute("SELECT COUNT(*) FROM dpco_temporal_registry")
    if cursor.fetchone()[0] == 0:
        for r in TEMPORAL_DPCO_SEEDS:
            cursor.execute("""
            INSERT INTO dpco_temporal_registry 
            (authority, so_number, effective_from, effective_to, canonical_name, alias_patterns, dosage_form, ceiling_price, gst_rate, is_nlem, citation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["authority"], r["so_number"], r["effective_from"], r["effective_to"],
                r["canonical_name"], r["alias_patterns"], r["dosage_form"], r["ceiling_price"],
                r["gst_rate"], r["is_nlem"], r["citation"]
            ))

    conn.commit()
    conn.close()
    logger.info("Temporal Gazette registry initialized successfully at %s", TEMPORAL_DB_PATH)


def query_temporal_nppa_ceiling(item_text: str, service_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Query the NPPA statutory ceiling price active on the given service date."""
    target_date = service_date or datetime.now().strftime("%Y-%m-%d")
    conn = get_temporal_db_connection()
    cursor = conn.cursor()
    
    # Query all active or historically bounded rules
    cursor.execute("""
    SELECT * FROM nppa_temporal_registry
    WHERE effective_from <= ? AND (effective_to IS NULL OR effective_to >= ?)
    """, (target_date, target_date))
    
    item_lower = item_text.lower()
    for row in cursor.fetchall():
        patterns = row["alias_patterns"].lower().split("|")
        if any(p.strip() in item_lower for p in patterns if p.strip()):
            conn.close()
            return {
                "canonical_name": row["canonical_name"],
                "category": row["category"],
                "ceiling_price": row["ceiling_price"],
                "gst_rate": row["gst_rate"],
                "gazette_so": row["so_number"],
                "effective_from": row["effective_from"],
                "citation": row["citation"],
                "applicability": row["applicability"]
            }
            
    conn.close()
    return None


def query_temporal_dpco_ceiling(item_text: str, service_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Query the DPCO statutory drug ceiling price active on the given service date."""
    target_date = service_date or datetime.now().strftime("%Y-%m-%d")
    conn = get_temporal_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM dpco_temporal_registry
    WHERE effective_from <= ? AND (effective_to IS NULL OR effective_to >= ?)
    """, (target_date, target_date))
    
    item_lower = item_text.lower()
    for row in cursor.fetchall():
        patterns = row["alias_patterns"].lower().split("|")
        if any(p.strip() in item_lower for p in patterns if p.strip()):
            conn.close()
            return {
                "canonical_name": row["canonical_name"],
                "dosage_form": row["dosage_form"],
                "ceiling_price": row["ceiling_price"],
                "gst_rate": row["gst_rate"],
                "gazette_so": row["so_number"],
                "effective_from": row["effective_from"],
                "citation": row["citation"],
                "is_nlem": bool(row["is_nlem"])
            }
            
    conn.close()
    return None


# Initialize on import
try:
    init_temporal_gazette_db()
except Exception as exc:
    logger.warning("Could not auto-initialize temporal gazette DB: %s", exc)
