'use client';

import React, { useState } from 'react';
import { formatINR } from '../../lib/utils/formatters';

interface DisputeCase {
  id: string;
  patient: string;
  hospital: string;
  disputeGround: string;
  amount: number;
  hospitalResponse: string;
  status: 'PENDING_HOSPITAL' | 'UNDER_REVIEW' | 'RESOLVED';
}

const DISPUTES: DisputeCase[] = [
  {
    id: 'DISP-801',
    patient: 'Ramesh Patel',
    hospital: 'Metro Multispeciality Hospital',
    disputeGround: 'NPPA Stent Pricing Overcharge & Unbundled OT Sanitization',
    amount: 13500,
    hospitalResponse: 'Hospital admitted error in item code categorization; credit note issued.',
    status: 'RESOLVED',
  },
  {
    id: 'DISP-802',
    patient: 'Amit Verma',
    hospital: 'Max Healthcare Institute',
    disputeGround: 'TPA Deduction Reversal Demand',
    amount: 8400,
    hospitalResponse: 'Awaiting response from Medical Superintendent desk.',
    status: 'PENDING_HOSPITAL',
  },
];

export default function ResolutionCenterPage() {
  const [activeDisputes, setActiveDisputes] = useState(DISPUTES);

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>LEGAL & DISPUTE WORKFLOW</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Discrepancy Resolution Center
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Serve formal demand notices, track hospital grievance responses, and execute credit note settlements.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Patient & Hospital</th>
              <th>Statutory Dispute Ground</th>
              <th className="amount-cell">Disputed Amount</th>
              <th>Hospital Response Status</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeDisputes.map((d) => (
              <tr key={d.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{d.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{d.patient}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{d.hospital}</div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--color-neutral-900)' }}>{d.disputeGround}</td>
                <td className="amount-cell" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>{formatINR(d.amount)}</td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)', maxWidth: '240px' }}>{d.hospitalResponse}</td>
                <td>
                  <span className={`badge ${d.status === 'RESOLVED' ? 'badge-completed' : 'badge-failed'}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
