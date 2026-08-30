'use client';

import React from 'react';

const TIMELINE = [
  { id: '1', time: '16 Aug 2026, 01:20 PM', actor: 'Razorpay UPI Gateway', action: 'Payment Captured', detail: '₹73,400 settled against Invoice #INV-2026-8941 · Ref #pay_P92kL18vQa910Z' },
  { id: '2', time: '16 Aug 2026, 11:45 AM', actor: 'CuraVeris Forensic Ledger', action: 'Statutory Audit Completed', detail: 'Verified responsibility calculated at ₹73,400. Flagged ₹13,500 unbundled surcharge.' },
  { id: '3', time: '16 Aug 2026, 11:00 AM', actor: 'Metro Multispeciality Hospital', action: 'Inpatient Bill Invoiced', detail: 'Gross inpatient bill generated for ₹2,18,400.' },
  { id: '4', time: '13 Aug 2026, 04:30 PM', actor: 'Star Health TPA', action: 'Cashless Pre-Auth Granted', detail: 'Approved ₹1,40,000 for cardiology admission.' },
];

export default function FinancialTimelinePage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-completed" style={{ marginBottom: '6px' }}>AUDIT TRAIL</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Comprehensive Financial Timeline
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Complete, chronological transaction ledger tracking admissions, audits, and payouts.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
        {TIMELINE.map((item) => (
          <div key={item.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '6px', background: 'var(--color-primary)', marginTop: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{item.action}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{item.time}</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>{item.actor}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: '18px' }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
