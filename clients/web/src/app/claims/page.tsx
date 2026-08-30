'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface Claim {
  claimId: string;
  invoiceId: string;
  patientName: string;
  billed: number;
  eligible: number;
  approved: number;
  adjustment: number;
  patientResponsibility: number;
  payment: number;
  status: string;
}

const CLAIMS: Claim[] = [
  {
    claimId: 'CLM-9012',
    invoiceId: 'INV-2026-8941',
    patientName: 'Ramesh Patel',
    billed: 218400,
    eligible: 180000,
    approved: 140000,
    adjustment: 5000,
    patientResponsibility: 73400,
    payment: 73400,
    status: 'APPROVED',
  },
  {
    claimId: 'CLM-7811',
    invoiceId: 'INV-2026-2041',
    patientName: 'Sunita Sharma',
    billed: 160000,
    eligible: 140000,
    approved: 98000,
    adjustment: 0,
    patientResponsibility: 62000,
    payment: 62000,
    status: 'APPROVED',
  },
  {
    claimId: 'CLM-6500',
    invoiceId: 'INV-2026-5512',
    patientName: 'Amit Verma',
    billed: 286900,
    eligible: 240000,
    approved: 200000,
    adjustment: 13500,
    patientResponsibility: 73400,
    payment: 0,
    status: 'QUERY_RAISED',
  },
];

export default function ClaimsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>INSURANCE & TPA OPERATIONS</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Insurance Claims Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Track cashless claims, TPA eligibility audits, and co-payment obligations.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Patient</th>
              <th className="amount-cell">Billed</th>
              <th className="amount-cell">Approved</th>
              <th className="amount-cell">Adjustment</th>
              <th className="amount-cell">Patient Share</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {CLAIMS.map((c) => (
              <tr key={c.claimId}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{c.claimId}</td>
                <td>{c.patientName}</td>
                <td className="amount-cell">{formatINR(c.billed)}</td>
                <td className="amount-cell" style={{ color: 'var(--color-success)' }}>{formatINR(c.approved)}</td>
                <td className="amount-cell">{formatINR(c.adjustment)}</td>
                <td className="amount-cell" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatINR(c.patientResponsibility)}</td>
                <td>
                  <span className={`badge ${c.status === 'APPROVED' ? 'badge-completed' : 'badge-failed'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <Link href={`/claims/${c.claimId}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    View Claim →
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
