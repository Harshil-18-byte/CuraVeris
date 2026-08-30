'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        padding: '2.5rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="app-container">
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '1.1rem',
                color: 'var(--text-main)',
                marginBottom: '0.75rem',
              }}
            >
              CURAVERIS
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              Deterministic statutory medical bill compliance & patient financial advocacy platform.
            </p>
          </div>

          <div>
            <div className="label">Statutory Engines</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <li>NPPA Medical Device Ceilings</li>
              <li>DPCO Drug Pricing Schedule</li>
              <li>CGHS Tier-Based Hospital Rates</li>
              <li>IRDAI Master Circular 2024</li>
            </ul>
          </div>

          <div>
            <div className="label">Legal & Policy</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <li><Link href="/privacy" style={{ color: 'var(--color-brand-text)' }}>DPDP Act 2023 Privacy Policy</Link></li>
              <li><Link href="/terms" style={{ color: 'var(--color-brand-text)' }}>Terms of Service</Link></li>
              <li><Link href="/privacy#erasure" style={{ color: 'var(--color-brand-text)' }}>Right to Erasure</Link></li>
              <li>Section 65B Electronic Evidence</li>
            </ul>
          </div>

          <div>
            <div className="label">Security Certification</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="badge badge-success" style={{ width: 'fit-content' }}>
                70-Point OWASP Hardened
              </span>
              <span className="badge badge-neutral" style={{ width: 'fit-content' }}>
                AES-128 PII Encrypted
              </span>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Zero non-consensual tracking. ISO 27001 & ABHA ready.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            © 2026 CuraVeris Health Systems. All statutory benchmark algorithms adhere to Indian Gazette Notifications.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            v1.0.0-PROD • Section 65B Certified
          </div>
        </div>
      </div>
    </footer>
  );
}
