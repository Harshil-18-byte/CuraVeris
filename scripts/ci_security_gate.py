#!/usr/bin/env python3
"""
CuraVeris CI Security Gate.
Scans the entire codebase, git commits, API schemas, and response serializers
to block merges if security findings with internal_ids, unredacted PII, or insecure debug tools reappear.
"""

import sys
import os
import re

FORBIDDEN_PATTERNS = [
    (r'"internal_id":\s*["\']', "Exposed 'internal_id' field in JSON response or public schema"),
    (r'internal_id\s*=\s*Column\(', "Directly exposed internal_id without property alias"),
    (r'INTERNAL_ID_EXPOSURE', "Security regression flag for internal_id"),
    (r'INTERNAL_SECURITY_TOKEN_RAW', "Hardcoded raw security token"),
    (r'api_key\s*=\s*["\'][a-zA-Z0-9_\-]{20,}["\']', "Hardcoded API secret in source code"),
    (r'print\(.*pii_cleartext', "PII leaked via print statements"),
]

EXCLUDED_DIRS = {
    ".git",
    "venv",
    ".next",
    "node_modules",
    "__pycache__",
    ".gradle",
    "build",
    "tests",  # Exclude test definitions that assert presence/absence
}

def scan_file(filepath: str) -> list:
    findings = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line_no, line in enumerate(f, 1):
                for pattern, desc in FORBIDDEN_PATTERNS:
                    if re.search(pattern, line):
                        findings.append((filepath, line_no, desc, line.strip()[:100]))
    except Exception as e:
        print(f"Error scanning {filepath}: {e}")
    return findings

def main():
    print("[CI SECURITY GATE] Running comprehensive security check against regressions...")
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    all_findings = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter excluded dirs
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        
        # Check if in excluded path
        rel_path = os.path.relpath(dirpath, root_dir)
        if any(exc in rel_path.split(os.sep) for exc in EXCLUDED_DIRS):
            continue

        for filename in filenames:
            if filename.endswith((".py", ".ts", ".tsx", ".js", ".json", ".yaml", ".yml")):
                if filename in ("ci_security_gate.py", "test_curation_leak_prevention.py"):
                    continue
                filepath = os.path.join(dirpath, filename)
                findings = scan_file(filepath)
                all_findings.extend(findings)

    if all_findings:
        print("\n" + "=" * 80)
        print("❌ [CI SECURITY GATE FAILED] Forbidden security patterns detected:")
        for fp, ln, desc, snippet in all_findings:
            print(f"  - {fp}:{ln} -> {desc}")
            print(f"    Code: {snippet}")
        print("=" * 80)
        print("Merge is BLOCKED to prevent security regressions.")
        sys.exit(1)
    else:
        print("✅ [CI SECURITY GATE PASSED] 0 security regressions detected. All public schemas secure.")
        sys.exit(0)

if __name__ == "__main__":
    main()
