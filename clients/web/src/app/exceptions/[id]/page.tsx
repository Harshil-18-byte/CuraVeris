'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ExceptionDetailPage({ params }: { params: { id: string } }) {
  const [resolved, setResolved] = useState(false);

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
        <Link href="/exceptions" style={{ color: 'var(--color-primary)' }}>← Back to Exceptions</Link>
      </div>

      <div className="card card-severity-high" style={{ padding: '24px', marginBottom: '24px' }}>
        <span className="badge badge-failed">CRITICAL EXCEPTION</span>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '8px' }}>
          Exception #{params.id || 'EXC-101'}: TPA Settlement Underpayment Discrepancy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
          Metro Multispeciality Hospital · Invoice #INV-2026-8941 · Owner: Arjun Mehta
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        {/* Left: Forensic Variance Breakdown & Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '12px' }}>
              Variance Ledger Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Hospital Requested Patient Share:</span>
                <span className="text-mono" style={{ fontWeight: 600 }}>₹86,900</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>CuraVeris Verified Legal Responsibility:</span>
                <span className="text-mono" style={{ fontWeight: 600, color: 'var(--color-success)' }}>₹73,400</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-neutral-300)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>Unreconciled Variance:</span>
                <span className="text-mono" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>+₹13,500</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '8px' }}>
              Root Cause & Statutory Citation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: '18px' }}>
              Hospital billed OT personal protection packs under unbundled code 992-OT at ₹18,000 instead of bundled institutional theatre tariff (statutory ceiling ₹4,500 under CGHS OM 2023).
            </p>
          </div>
        </div>

        {/* Right: Suggested Resolution & Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '12px' }}>
              Suggested Action
            </h3>

            <div style={{ background: 'var(--color-neutral-50)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--color-neutral-900)', marginBottom: '16px', lineHeight: '18px' }}>
              Serve formal credit adjustment demand letter to Hospital Accounts Head citing CGHS unbundling prohibition.
            </div>

            {resolved ? (
              <div className="badge badge-completed" style={{ padding: '8px', textAlign: 'center', width: '100%' }}>
                ✓ Exception Resolved & Credit Note Applied
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setResolved(true)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Accept Adjusted Variance & Close
                </button>
                <Link
                  href="/resolutions"
                  className="btn btn-secondary"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                >
                  Serve Legal Dispute Notice
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
