'use client';

import React from 'react';
import { formatINR } from '../../lib/utils/formatters';

interface Settlement {
  id: string;
  grossAmount: number;
  fees: number;
  tax: number;
  netSettled: number;
  utr: string;
  date: string;
  status: string;
}

const SETTLEMENTS: Settlement[] = [
  {
    id: 'SET-9910',
    grossAmount: 73400,
    fees: 146.80,
    tax: 26.42,
    netSettled: 73226.78,
    utr: 'HDFC002910842',
    date: '17 Aug 2026',
    status: 'SETTLED',
  },
  {
    id: 'SET-9884',
    grossAmount: 62000,
    fees: 124.00,
    tax: 22.32,
    netSettled: 61853.68,
    utr: 'ICIC001928471',
    date: '23 Jul 2026',
    status: 'SETTLED',
  },
];

export default function SettlementsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-completed" style={{ marginBottom: '6px' }}>BANK ESCROW PAYOUTS</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Settlements & Payouts
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Net bank disbursements with gateway fee reconciliation and UTR tracking.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th className="amount-cell">Gross Settled</th>
              <th className="amount-cell">Gateway Fee</th>
              <th className="amount-cell">GST (18%)</th>
              <th className="amount-cell">Net Bank Payout</th>
              <th>Bank UTR Reference</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SETTLEMENTS.map((s) => (
              <tr key={s.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{s.id}</td>
                <td className="amount-cell">{formatINR(s.grossAmount)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-neutral-600)' }}>₹{s.fees.toFixed(2)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-neutral-600)' }}>₹{s.tax.toFixed(2)}</td>
                <td className="amount-cell" style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{s.netSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="text-mono" style={{ fontSize: '12px' }}>{s.utr}</td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{s.date}</td>
                <td><span className="badge badge-completed">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
