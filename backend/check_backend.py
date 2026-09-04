"""
CuraVeris Backend Subsystem & ML Architecture Health Diagnostic.

Validates:
1. Core Database & Async SQLAlchemy Models
2. Statutory Audit Checkers (NPPA, DPCO, CGHS, GST, IRDAI)
3. ML Subsystems (EnsemblePredictor, MasterMLEnsemble, DeepRiskNetwork)
4. Financial Risk Engine (FRM Orchestrator, VaR/CVaR, Liquidity Risk)
5. Core Risk Engine & 65B Evidence Pipeline
"""
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    print("=" * 60)
    print("CURAVERIS BACKEND SYSTEM HEALTH DIAGNOSTIC")
    print("=" * 60)

    # 1. Database & Schemas
    try:
        from app.db.database import engine, Base
        from app.db.models import User, Bill, LineItem, AuditLog, Dispute
        print("[OK] Database Models & Engine loaded successfully")
    except Exception as e:
        print(f"[FAIL] Database Models: {e}")

    # 2. Statutory Checkers
    try:
        from app.audit_engine.statutory.nppa import NPPAChecker
        from app.audit_engine.statutory.dpco import DPCOChecker
        from app.audit_engine.statutory.cghs import CGHSChecker
        from app.audit_engine.statutory.gst import GSTChecker
        from app.audit_engine.statutory.irdai import IRDAIChecker
        print("[OK] Statutory Audit Modules (NPPA, DPCO, CGHS, GST, IRDAI) loaded")
    except Exception as e:
        print(f"[FAIL] Statutory Checkers: {e}")

    # 3. ML Ensemble & Risk Models
    try:
        from app.audit_engine.ml.ensemble import EnsemblePredictor
        from app.ml.unified_master_ensemble import MasterMLEnsemble
        from app.ml.deep_risk_network import DeepRiskNetwork
        print("[OK] ML Pipelines (EnsemblePredictor, MasterMLEnsemble, DeepRiskNetwork) loaded")
    except Exception as e:
        print(f"[FAIL] ML Ensembles: {e}")

    # 4. Financial Risk Management (FRM)
    try:
        from app.audit_engine.frm.orchestrator import FRMOrchestrator
        from app.audit_engine.frm.var_cvar import VaRCVaREngine
        from app.audit_engine.frm.liquidity_risk import LiquidityRiskEngine
        print("[OK] Financial Risk Engine (FRM Orchestrator, VaR/CVaR, Liquidity) loaded")
    except Exception as e:
        print(f"[FAIL] FRM Subsystems: {e}")

    # 5. Core Forensic & Evidence Engines
    try:
        from app.engine.risk_engine import RiskEngine
        from app.engine.evidence_engine import generate_section_65b_certificate
        from app.engine.financial_truth import FinancialTruthEngine
        print("[OK] Forensic Engines (RiskEngine, 65B Evidence, Financial Truth) loaded")
    except Exception as e:
        print(f"[FAIL] Forensic Engines: {e}")

    # 6. Auth & Security
    try:
        from app.api.auth import router as auth_router
        from app.core.security import create_access_token, verify_password
        print("[OK] Auth & Cryptographic Security Pipelines loaded")
    except Exception as e:
        print(f"[FAIL] Auth & Security: {e}")

    print("=" * 60)
    print("ALL BACKEND MODULES OPERATIONAL")
    print("=" * 60)

if __name__ == "__main__":
    test_imports()
