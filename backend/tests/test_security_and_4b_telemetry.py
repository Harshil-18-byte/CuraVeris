"""Test Suite for Security Hardening Engine & 4B/1B Model Observability APIs."""

import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.core.security_hardening import SecurityHardeningEngine


def test_filename_sanitization_and_path_traversal():
    """Verify that malicious path traversal strings, null bytes, and shell metachars are sanitized."""
    malicious_inputs = [
        ("../../etc/passwd", "passwd"),
        ("..\\..\\windows\\system32\\cmd.exe", "cmd.exe"),
        ("bill\x00_inject.pdf", "bill_inject.pdf"),
        ("invoice;rm -rf .pdf", "invoice_rm_-rf_.pdf")
    ]
    for inp, expected in malicious_inputs:
        clean = SecurityHardeningEngine.sanitize_filename(inp)
        assert ".." not in clean
        assert "\x00" not in clean
        assert clean == expected


def test_magic_bytes_file_upload_validation():
    """Verify that valid PDFs pass and spoofed files (executables named .pdf) are rejected."""
    valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj"
    valid_png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    fake_exe_as_pdf = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff"

    # Valid PDF
    is_valid, msg = SecurityHardeningEngine.validate_upload("hospital_bill.pdf", valid_pdf_content)
    assert is_valid is True

    # Valid PNG
    is_valid, msg = SecurityHardeningEngine.validate_upload("scan.png", valid_png_content)
    assert is_valid is True

    # Fake executable disguised as PDF
    is_valid, msg = SecurityHardeningEngine.validate_upload("malware.pdf", fake_exe_as_pdf)
    assert is_valid is False
    assert "magic bytes" in msg

    # Oversized file check (> 25MB)
    huge_content = b"%PDF" + b"0" * (26 * 1024 * 1024)
    is_valid, msg = SecurityHardeningEngine.validate_upload("huge.pdf", huge_content)
    assert is_valid is False
    assert "maximum allowed size" in msg


def test_sha256_cryptographic_integrity():
    """Verify deterministic SHA-256 hash generation for bill tamper-evident logs."""
    data = b"Hospital Invoice Line Item Verification 2026"
    hash1 = SecurityHardeningEngine.compute_sha256(data)
    hash2 = SecurityHardeningEngine.compute_sha256(data)
    assert hash1 == hash2
    assert len(hash1) == 64


@pytest.mark.asyncio
async def test_curaveris_4b_and_security_endpoints():
    """Verify that /api/v1/dev/curaveris-4b, /curaveris-1b, and /security-status return 200 OK with correct schemas."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. 4B Model API
        res_4b = await client.get("/api/v1/dev/curaveris-4b")
        assert res_4b.status_code == 200
        data_4b = res_4b.json()
        assert data_4b["model_name"] == "CuraVeris-4B-Audit-Transformer"
        assert data_4b["layers"] == 36
        assert data_4b["hidden_size"] == 3072
        assert "4.07 Billion" in data_4b["parameter_count_formatted"]

        # 2. 1B Model API
        res_1b = await client.get("/api/v1/dev/curaveris-1b")
        assert res_1b.status_code == 200
        data_1b = res_1b.json()
        assert data_1b["model_name"] == "CuraVeris-1B-Audit-Transformer"
        assert data_1b["layers"] == 24
        assert "1.05 Billion" in data_1b["parameter_count_formatted"]

        # 3. Security Status API
        res_sec = await client.get("/api/v1/dev/security-status")
        assert res_sec.status_code == 200
        data_sec = res_sec.json()
        assert data_sec["status"] == "HARDENED"
        assert "HSTS" in data_sec["tls_enforcement"]

        # 4. Master Model Metrics API
        res_metrics = await client.get("/api/v1/dev/model-metrics")
        assert res_metrics.status_code == 200
        data_metrics = res_metrics.json()
        assert "curaveris_4b_transformer" in data_metrics
        assert "security_posture" in data_metrics
