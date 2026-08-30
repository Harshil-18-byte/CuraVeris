'use client';

import React from 'react';

const REPORTS = [
  { id: 'RPT-01', title: 'Monthly Financial Reconciliation Ledger', format: 'PDF / CSV', period: 'August 2026', size: '3.8 MB' },
  { id: 'RPT-02', title: 'TPA Deduction Variance Audit Summary', format: 'PDF / XLSX', period: 'Q2 2026', size: '5.1 MB' },
  { id: 'RPT-03', title: 'Razorpay Gateway Settlement & Tax Invoice', format: 'PDF', period: 'August 2026', size: '1.2 MB' },
  { id: 'RPT-04', title: 'Statutory Rate Discrepancy & NPPA Compliance', format: 'PDF / Section 65B Hash', period: 'FY 2026-27', size: '8.4 MB' },
];

export default function ReportsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-queued" style={{ marginBottom: '6px' }}>FINANCIAL EXPORTS</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Operational Reports & Audit Exports
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Download verified reconciliation statements, forensic audit certificates, and gateway settlement ledgers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {REPORTS.map((r) => (
          <div key={r.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-completed">{r.format}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{r.period}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{r.title}</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-neutral-300)' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Size: {r.size}</span>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                Download Export ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
