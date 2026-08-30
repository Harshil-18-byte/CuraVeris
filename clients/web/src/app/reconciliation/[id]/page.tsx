'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../../lib/utils/formatters';

export default function ReconciliationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
        <Link href="/reconciliation" style={{ color: 'var(--color-primary)' }}>← Back to Reconciliation</Link>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-completed">MATCHED LEDGER</span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '8px' }}>
              Reconciliation Audit #{params.id || 'REC-001'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
              Metro Multispeciality Hospital · Invoice #INV-2026-8941
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Net Variance</div>
            <div className="text-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
              ₹0.00
            </div>
          </div>
        </div>
      </div>

      {/* Visual Reconciliation Flow */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '16px' }}>
        Authoritative Financial Flow
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
        {/* Node 1: Invoice */}
        <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>1. HOSPITAL GROSS INVOICE</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>Total Billed Charges</div>
          </div>
          <div className="text-mono" style={{ fontSize: '16px', fontWeight: 700 }}>₹2,18,400</div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: '18px' }}>↓</div>

        {/* Node 2: Insurance */}
        <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }}>2. TPA INSURANCE APPROVAL</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>Cashless Settlement Granted</div>
          </div>
          <div className="text-mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-success)' }}>−₹1,40,000</div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: '18px' }}>↓</div>

        {/* Node 3: TPA Deductions Adjusted */}
        <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)' }}>3. STATUTORY EXCLUSIONS</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>IRDAI Disallowed Consumables</div>
          </div>
          <div className="text-mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-warning)' }}>−₹5,000</div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: '18px' }}>↓</div>

        {/* Node 4: Patient Responsibility */}
        <div className="card card-severity-primary" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>4. PATIENT OBLIGATION</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>Verified Net Co-Pay</div>
          </div>
          <div className="text-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>₹73,400</div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: '18px' }}>↓</div>

        {/* Node 5: Razorpay Payment */}
        <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }}>5. RAZORPAY PAYMENT GATEWAY</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>UPI Captured · #pay_P92kL18vQa910Z</div>
          </div>
          <div className="text-mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-success)' }}>₹73,400</div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: '18px' }}>↓</div>

        {/* Node 6: Bank Settlement */}
        <div className="card card-severity-low" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }}>6. BANK ESCROW SETTLEMENT</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>UTR #HDFC002910842 · Net Settled</div>
          </div>
          <div className="text-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>₹73,400 ✓</div>
        </div>
      </div>
    </div>
  );
}
