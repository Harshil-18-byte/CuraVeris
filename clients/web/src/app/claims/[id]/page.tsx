'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../../lib/utils/formatters';

export default function ClaimDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
        <Link href="/claims" style={{ color: 'var(--color-primary)' }}>← Back to Claims</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Claim Document Panel */}
        <div className="card" style={{ padding: '24px' }}>
          <span className="badge badge-completed">CASHLESS PRE-AUTH</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '8px' }}>
            Claim {params.id || 'CLM-9012'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
            Star Health Insurance · TPA Settlement File #SH-88410
          </p>

          <div style={{ background: 'var(--color-neutral-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-neutral-600)', marginBottom: '6px' }}>
              ATTACHED DOCUMENTS (3)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-neutral-900)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>📄 Final_Inpatient_Tax_Invoice.pdf (2.4 MB)</div>
              <div>📄 TPA_Cashless_PreAuth_Letter.pdf (640 KB)</div>
              <div>📄 Hospital_Discharge_Summary.pdf (1.1 MB)</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/evidence" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              View Document In Viewer
            </Link>
          </div>
        </div>

        {/* Right Column: Financial Panel & Deductions */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '16px' }}>
            Financial Settlement Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Hospital Gross Billed:</span>
              <span className="text-mono" style={{ fontSize: '14px', fontWeight: 600 }}>₹2,18,400</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>TPA Eligible Base:</span>
              <span className="text-mono" style={{ fontSize: '14px', fontWeight: 600 }}>₹1,80,000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Insurance Approved:</span>
              <span className="text-mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-success)' }}>₹1,40,000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Disallowed Exclusions:</span>
              <span className="text-mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-warning)' }}>−₹5,000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-neutral-300)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Patient Responsibility:</span>
              <span className="text-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>₹73,400</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
