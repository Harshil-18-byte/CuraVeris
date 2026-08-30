'use client';

import React from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';

interface ExceptionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exceptionType: string;
  hospital: string;
  amount: number;
  aging: string;
  owner: string;
  status: string;
}

const EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'EXC-101',
    priority: 'CRITICAL',
    exceptionType: 'TPA Settlement Underpayment Discrepancy',
    hospital: 'Metro Multispeciality Hospital',
    amount: 13500,
    aging: '4 days',
    owner: 'Arjun Mehta (Senior Auditor)',
    status: 'INVESTIGATING',
  },
  {
    id: 'EXC-102',
    priority: 'HIGH',
    exceptionType: 'Unbundled OT Sanitization Surcharge',
    hospital: 'Max Healthcare Institute',
    amount: 8400,
    aging: '2 days',
    owner: 'Priya Sharma (Billing Ops)',
    status: 'NOTICE_SERVED',
  },
  {
    id: 'EXC-103',
    priority: 'MEDIUM',
    exceptionType: 'Delayed Razorpay Gateway Webhook Capture',
    hospital: 'Apollo Surgical Centre',
    amount: 62000,
    aging: '12 hours',
    owner: 'System Auto-Reconciliation',
    status: 'AUTO_RESOLVING',
  },
];

export default function ExceptionsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-failed" style={{ marginBottom: '6px' }}>EXCEPTION QUEUE</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Financial Exception Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Prioritized operational queue for billing variances, gateway mismatches, and claim rejections.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Priority</th>
              <th>Exception Description</th>
              <th>Hospital</th>
              <th className="amount-cell">Variance</th>
              <th>Aging</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {EXCEPTIONS.map((e) => (
              <tr key={e.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{e.id}</td>
                <td>
                  <span className={`badge ${e.priority === 'CRITICAL' ? 'badge-failed' : e.priority === 'HIGH' ? 'badge-queued' : 'badge-completed'}`}>
                    {e.priority}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{e.exceptionType}</td>
                <td>{e.hospital}</td>
                <td className="amount-cell" style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                  +{formatINR(e.amount)}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{e.aging}</td>
                <td style={{ fontSize: '12px', fontWeight: 500 }}>{e.owner}</td>
                <td>
                  <Link href={`/exceptions/${e.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Resolve →
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
