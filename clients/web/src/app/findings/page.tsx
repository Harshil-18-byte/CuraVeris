'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface Finding {
  id: string;
  item: string;
  billed: number;
  reference: number;
  variance: number;
  origin: 'RULE' | 'ML' | 'RECONCILIATION';
  confidence: string;
  status: string;
}

const FINDINGS: Finding[] = [
  {
    id: 'FND-01',
    item: 'Drug Eluting Stent (Sierra 3.0mm)',
    billed: 65000,
    reference: 38260,
    variance: 26740,
    origin: 'RULE',
    confidence: '99%',
    status: 'POTENTIAL_DISCREPANCY',
  },
  {
    id: 'FND-02',
    item: 'OT Sanitization & PPE Surcharge',
    billed: 18000,
    reference: 4500,
    variance: 13500,
    origin: 'RULE',
    confidence: '96%',
    status: 'POTENTIAL_DISCREPANCY',
  },
  {
    id: 'FND-03',
    item: 'Post-Op Monitoring Charges (Day 3)',
    billed: 12000,
    reference: 8000,
    variance: 4000,
    origin: 'ML',
    confidence: '89%',
    status: 'NEEDS_REVIEW',
  },
];

export default function FindingsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-failed" style={{ marginBottom: '6px' }}>AUDIT FINDINGS & DISCREPANCIES</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Statutory Findings Registry
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Itemized statutory rate deviations, unbundled charges, and anomalous fee classifications.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Line Item Description</th>
              <th className="amount-cell">Billed Amount</th>
              <th className="amount-cell">Statutory Reference</th>
              <th className="amount-cell">Flagged Variance</th>
              <th>Origin</th>
              <th>Confidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {FINDINGS.map((f) => (
              <tr key={f.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{f.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{f.item}</td>
                <td className="amount-cell">{formatINR(f.billed)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-success)' }}>{formatINR(f.reference)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                  +${formatINR(f.variance).replace('$', '')}
                </td>
                <td>
                  <span className="badge badge-queued">{f.origin}</span>
                </td>
                <td style={{ fontSize: '13px', fontWeight: 600 }}>{f.confidence}</td>
                <td>
                  <Link href="/evidence" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Examine Evidence →
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
