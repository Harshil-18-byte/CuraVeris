'use client';

import React from 'react';
import { formatINR } from '../../lib/utils/formatters';

interface RecoveryTarget {
  id: string;
  patient: string;
  hospital: string;
  discrepancyType: string;
  recoverableAmount: number;
  probability: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedStrategy: string;
}

const RECOVERIES: RecoveryTarget[] = [
  {
    id: 'REC-T01',
    patient: 'Amit Verma',
    hospital: 'Max Healthcare Institute',
    discrepancyType: 'TPA Deduction Under-settlement',
    recoverableAmount: 13500,
    probability: '92% (High Confidence)',
    priority: 'HIGH',
    recommendedStrategy: 'Issue statutory demand notice citing OM 2023 tariff caps.',
  },
  {
    id: 'REC-T02',
    patient: 'Sunil Nair',
    hospital: 'Fortis Escorts Heart Hospital',
    discrepancyType: 'Impermissible Surcharge on Stents',
    recoverableAmount: 26740,
    probability: '88% (High Confidence)',
    priority: 'HIGH',
    recommendedStrategy: 'Re-file Section 65B authenticated petition to hospital Ombudsman.',
  },
];

export default function RevenueRecoveryPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-failed" style={{ marginBottom: '6px' }}>REVENUE RECOVERY PIPELINE</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Prioritized Revenue Recovery
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            ML-prioritized recovery pipeline for disallowed hospital deductions and unverified billing overcharges.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Target ID</th>
              <th>Patient & Facility</th>
              <th>Variance Root Cause</th>
              <th className="amount-cell">Recoverable Value</th>
              <th>Recovery Probability</th>
              <th>Priority</th>
              <th>Recommended Strategy</th>
            </tr>
          </thead>
          <tbody>
            {RECOVERIES.map((r) => (
              <tr key={r.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{r.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.patient}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{r.hospital}</div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--color-neutral-900)' }}>{r.discrepancyType}</td>
                <td className="amount-cell" style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatINR(r.recoverableAmount)}</td>
                <td style={{ fontSize: '13px', fontWeight: 600 }}>{r.probability}</td>
                <td><span className="badge badge-failed">{r.priority}</span></td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)', maxWidth: '280px' }}>{r.recommendedStrategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
