'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../../lib/utils/formatters';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
        <Link href="/payments" style={{ color: 'var(--color-primary)' }}>← Back to Payments</Link>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-completed">PAYMENT CAPTURED</span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '8px' }}>
              Transaction #{params.id || 'pay_P92kL18vQa910Z'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
              Order #order_Nx881024 · Invoice #INV-2026-8941
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Captured Amount</div>
            <div className="text-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
              ₹73,400.00
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Metadata & Obligation Map */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '14px' }}>
            Gateway & Internal Settlement IDs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Payment Method:</span>
              <span style={{ fontWeight: 600 }}>UPI (Google Pay)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Internal Obligation ID:</span>
              <span className="text-mono" style={{ fontWeight: 600 }}>OBL-2026-8941</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Reconciliation Ledger ID:</span>
              <span className="text-mono" style={{ fontWeight: 600 }}>REC-2026-5512</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Bank UTR:</span>
              <span className="text-mono" style={{ fontWeight: 600 }}>HDFC002910842</span>
            </div>
          </div>
        </div>

        {/* Right: Razorpay Webhook Events Log */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '14px' }}>
            Authoritative Webhook Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span className="badge badge-completed" style={{ alignSelf: 'flex-start' }}>CAPTURED</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>payment.captured</div>
                <div style={{ color: 'var(--color-neutral-600)' }}>16 Aug 2026, 01:20:14 PM · Signature Validated</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span className="badge badge-completed" style={{ alignSelf: 'flex-start' }}>CREATED</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>order.paid</div>
                <div style={{ color: 'var(--color-neutral-600)' }}>16 Aug 2026, 01:20:02 PM · Full Amount Met</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
