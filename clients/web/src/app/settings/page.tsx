'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-queued" style={{ marginBottom: '6px' }}>ORGANIZATION CONFIGURATION</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Organization & System Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Configure reconciliation tolerance thresholds, statutory benchmark feeds, and automated settlement rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Box 1: Reconciliation Parameters */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Financial Reconciliation Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)', display: 'block', marginBottom: '6px' }}>
                Auto-Match Tolerance (INR)
              </label>
              <input type="text" className="input" defaultValue="₹5.00" />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)', display: 'block', marginBottom: '6px' }}>
                Razorpay Webhook Retry Window
              </label>
              <input type="text" className="input" defaultValue="3 attempts (Exponential backoff)" />
            </div>
          </div>
        </div>

        {/* Box 2: DPDP Compliance & Security */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            DPDP Act 2023 & Data Controls
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>Audit Trail Data Retention</div>
              <div>Authoritative immutable ledger stored for 7 years as per IRDAI compliance.</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>End-to-End Encryption</div>
              <div>AES-256 at rest · TLS 1.3 in transit with Section 65B hash seals.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
