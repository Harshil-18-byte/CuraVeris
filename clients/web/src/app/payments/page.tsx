'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface PaymentRow {
  paymentId: string;
  invoiceId: string;
  patient: string;
  amount: number;
  method: string;
  status: string;
  settlementState: string;
  reconciliation: string;
}

const PAYMENTS: PaymentRow[] = [
  {
    paymentId: 'pay_P92kL18vQa910Z',
    invoiceId: 'INV-2026-8941',
    patient: 'Ramesh Patel',
    amount: 73400,
    method: 'UPI',
    status: 'CAPTURED',
    settlementState: 'SETTLED',
    reconciliation: 'MATCHED ✓',
  },
  {
    paymentId: 'pay_K71vN43xPz881Q',
    invoiceId: 'INV-2026-2041',
    patient: 'Sunita Sharma',
    amount: 62000,
    method: 'NETBANKING',
    status: 'CAPTURED',
    settlementState: 'SETTLED',
    reconciliation: 'MATCHED ✓',
  },
];

export default function PaymentsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-completed" style={{ marginBottom: '6px' }}>RAZORPAY GATEWAY LEDGER</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Payment Transactions
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Authoritative gateway settlements, webhook confirmations, and escrow captures.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Invoice</th>
              <th>Patient</th>
              <th className="amount-cell">Settled Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Settlement</th>
              <th>Reconciliation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p) => (
              <tr key={p.paymentId}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{p.paymentId}</td>
                <td className="text-mono">{p.invoiceId}</td>
                <td>{p.patient}</td>
                <td className="amount-cell" style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatINR(p.amount)}</td>
                <td>{p.method}</td>
                <td><span className="badge badge-completed">{p.status}</span></td>
                <td><span className="badge badge-completed">{p.settlementState}</span></td>
                <td style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>{p.reconciliation}</td>
                <td>
                  <Link href={`/payments/${p.paymentId}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Trace →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
