'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface RecRecord {
  id: string;
  invoiceNumber: string;
  hospitalName: string;
  expected: number;
  paid: number;
  settled: number;
  difference: number;
  status: 'MATCHED' | 'REVIEW_REQUIRED' | 'SETTLEMENT_PENDING';
}

const RECONCILIATION_DATA: RecRecord[] = [
  {
    id: 'REC-001',
    invoiceNumber: 'INV-2026-8941',
    hospitalName: 'Metro Multispeciality Hospital',
    expected: 73400,
    paid: 73400,
    settled: 73400,
    difference: 0,
    status: 'MATCHED',
  },
  {
    id: 'REC-002',
    invoiceNumber: 'INV-2026-2041',
    hospitalName: 'Apollo Surgical Centre',
    expected: 62000,
    paid: 62000,
    settled: 62000,
    difference: 0,
    status: 'MATCHED',
  },
  {
    id: 'REC-003',
    invoiceNumber: 'INV-2026-5512',
    hospitalName: 'Max Healthcare Institute',
    expected: 86900,
    paid: 73400,
    settled: 73400,
    difference: 13500,
    status: 'REVIEW_REQUIRED',
  },
  {
    id: 'REC-004',
    invoiceNumber: 'INV-2026-1029',
    hospitalName: 'Fortis Escorts Heart Hospital',
    expected: 110000,
    paid: 110000,
    settled: 0,
    difference: 0,
    status: 'SETTLEMENT_PENDING',
  },
];

export default function ReconciliationPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = RECONCILIATION_DATA.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>FINANCIAL OPERATIONS</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Financial Reconciliation
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Multi-party settlement matching across Hospital Invoices, Insurance TPAs, and Razorpay Gateways.
          </p>
        </div>

        <select
          className="input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ height: '36px', width: 'auto', padding: '0 12px', fontSize: '13px' }}
        >
          <option value="ALL">All Settlement Statuses</option>
          <option value="MATCHED">Matched</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
          <option value="SETTLEMENT_PENDING">Settlement Pending</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Hospital</th>
              <th className="amount-cell">Expected</th>
              <th className="amount-cell">Paid</th>
              <th className="amount-cell">Settled</th>
              <th className="amount-cell">Difference</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{r.invoiceNumber}</td>
                <td>{r.hospitalName}</td>
                <td className="amount-cell">{formatINR(r.expected)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-success)' }}>{formatINR(r.paid)}</td>
                <td className="amount-cell">{formatINR(r.settled)}</td>
                <td className="amount-cell" style={{ color: r.difference > 0 ? 'var(--color-danger)' : 'var(--color-neutral-600)', fontWeight: r.difference > 0 ? 700 : 400 }}>
                  {r.difference > 0 ? `+${formatINR(r.difference)}` : '₹0'}
                </td>
                <td>
                  <span className={`badge ${r.status === 'MATCHED' ? 'badge-completed' : r.status === 'REVIEW_REQUIRED' ? 'badge-failed' : 'badge-queued'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <Link href={`/reconciliation/${r.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Trace Flow →
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
