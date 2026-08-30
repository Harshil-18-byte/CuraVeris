'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '../../lib/utils/formatters';
import { apiClient } from '../../lib/api/client';

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

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExceptions() {
      try {
        const billsRes: any = await apiClient('/api/v1/bills?per_page=20');
        const items = billsRes?.items || [];
        const mapped: ExceptionItem[] = items
          .filter((b: any) => (b.total_overcharge || 0) > 0)
          .map((b: any) => ({
            id: `EXC-${b.id.slice(0, 6)}`,
            priority: (b.total_overcharge || 0) > 20000 ? 'CRITICAL' : (b.total_overcharge || 0) > 5000 ? 'HIGH' : 'MEDIUM',
            exceptionType: 'Statutory Gazette Rate Discrepancy',
            hospital: b.hospital_name || 'Hospital Facility',
            amount: b.total_overcharge || 0,
            aging: 'Pending Audit',
            owner: 'Automated Rule Engine',
            status: b.processing_status || 'AUDITING',
          }));
        setExceptions(mapped);
      } catch {
        setExceptions([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadExceptions();
  }, []);

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-failed" style={{ marginBottom: '6px' }}>EXCEPTION QUEUE</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Financial Exception Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Review, escalate, and resolve billing discrepancies and underpayments across facilities.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Exception ID</th>
              <th>Priority</th>
              <th>Discrepancy Category</th>
              <th>Hospital / Facility</th>
              <th>Disputed Value</th>
              <th>Aging</th>
              <th>Assigned Specialist</th>
              <th>Resolution Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-600)' }}>
                  Loading financial exceptions…
                </td>
              </tr>
            ) : exceptions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-600)' }}>
                  No open exceptions flagged across your current medical bills.
                </td>
              </tr>
            ) : (
              exceptions.map((exc) => (
                <tr key={exc.id}>
                  <td className="text-mono" style={{ fontWeight: 600 }}>{exc.id}</td>
                  <td>
                    <span className={`badge ${exc.priority === 'CRITICAL' ? 'badge-failed' : 'badge-queued'}`}>
                      {exc.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{exc.exceptionType}</td>
                  <td>{exc.hospital}</td>
                  <td className="text-mono" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                    {formatINR(exc.amount)}
                  </td>
                  <td style={{ color: 'var(--color-neutral-600)' }}>{exc.aging}</td>
                  <td style={{ fontSize: '12px' }}>{exc.owner}</td>
                  <td>
                    <span className="badge badge-completed">{exc.status}</span>
                  </td>
                  <td>
                    <Link href="/dispute" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                      Review →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
