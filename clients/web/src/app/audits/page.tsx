'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface AuditRecord {
  id: string;
  invoiceNumber: string;
  hospital: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: string;
  itemsReviewed: number;
  unexplainedVariance: number;
  mlSubsystem: string;
}

const AUDITS: AuditRecord[] = [
  {
    id: 'AUD-8821',
    invoiceNumber: 'INV-2026-8941',
    hospital: 'Metro Multispeciality Hospital',
    riskLevel: 'HIGH',
    confidence: '94% (Ensemble)',
    itemsReviewed: 38,
    unexplainedVariance: 13500,
    mlSubsystem: 'XGBoost v2.1 + Rule Engine',
  },
  {
    id: 'AUD-8819',
    invoiceNumber: 'INV-2026-2041',
    hospital: 'Apollo Surgical Centre',
    riskLevel: 'LOW',
    confidence: '98% (Ensemble)',
    itemsReviewed: 24,
    unexplainedVariance: 0,
    mlSubsystem: 'MLP Classifier v1.8',
  },
  {
    id: 'AUD-8805',
    invoiceNumber: 'INV-2026-5512',
    hospital: 'Max Healthcare Institute',
    riskLevel: 'MEDIUM',
    confidence: '91% (Ensemble)',
    itemsReviewed: 45,
    unexplainedVariance: 8400,
    mlSubsystem: 'XGBoost v2.1 + Rule Engine',
  },
];

export default function BillAuditPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>STATUTORY & ML AUDIT ENGINE</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Bill Audit Operations
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Authoritative forensic risk classification with calibrated uncertainty estimation.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Hospital & Invoice</th>
              <th>Risk Level</th>
              <th>Confidence</th>
              <th>Items Audited</th>
              <th className="amount-cell">Flagged Variance</th>
              <th>Subsystem</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {AUDITS.map((a) => (
              <tr key={a.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{a.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{a.hospital}</div>
                  <div className="text-mono" style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{a.invoiceNumber}</div>
                </td>
                <td>
                  <span className={`badge ${a.riskLevel === 'HIGH' ? 'badge-failed' : a.riskLevel === 'MEDIUM' ? 'badge-queued' : 'badge-completed'}`}>
                    {a.riskLevel} RISK
                  </span>
                </td>
                <td style={{ fontSize: '13px', fontWeight: 600 }}>{a.confidence}</td>
                <td>{a.itemsReviewed} lines</td>
                <td className="amount-cell" style={{ color: a.unexplainedVariance > 0 ? 'var(--color-danger)' : 'var(--color-neutral-600)', fontWeight: 700 }}>
                  {a.unexplainedVariance > 0 ? `+${formatINR(a.unexplainedVariance)}` : '₹0'}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{a.mlSubsystem}</td>
                <td>
                  <Link href="/findings" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    View Findings →
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
