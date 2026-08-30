'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBills } from '../../hooks/useBills';
import { formatINR } from '../../lib/utils/formatters';

export default function DashboardPage() {
  const { bills, isLoading } = useBills();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AUDITED' | 'FLAGGED'>('ALL');

  // Authoritative dynamic calculations
  const totalBills = bills.length;
  const completedAudits = bills.filter(b => b.status === 'AUDITED' || b.status === 'RESOLVED' || b.status === 'DISPUTED').length;
  const totalOvercharge = bills.reduce((acc, b) => acc + (b.total_overcharge || 0), 0);
  const documentsGenerated = bills.filter(b => (b.total_overcharge || 0) > 0).length;

  const filteredBills = bills.filter(b => {
    if (activeFilter === 'AUDITED') return b.status === 'AUDITED' || b.status === 'RESOLVED' || b.status === 'DISPUTED';
    if (activeFilter === 'FLAGGED') return (b.total_overcharge || 0) > 0;
    return true;
  });

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Healthcare Financial Operations & Bill Verification Overview
          </p>
        </div>

        <Link href="/scan" className="btn btn-primary">
          + New Bill Audit
        </Link>
      </div>

      {/* Top Stat Cards Row (4 cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {/* Card 1 */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Total Bills</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-neutral-900)', fontFamily: 'var(--font-heading)' }}>
            {totalBills}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '4px', fontWeight: 600 }}>
            ↑ Active Ledger
          </div>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Audits Complete</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-neutral-900)', fontFamily: 'var(--font-heading)' }}>
            {completedAudits}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: 600 }}>
            ✓ Verified
          </div>
        </div>

        {/* Card 3 */}
        <div className="card card-severity-high" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Total Overcharge Found</div>
          <div className="text-mono" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-danger)' }}>
            {formatINR(totalOvercharge)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', fontWeight: 600 }}>
            Statutory Violations
          </div>
        </div>

        {/* Card 4 */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginBottom: '8px' }}>Documents Generated</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-neutral-900)', fontFamily: 'var(--font-heading)' }}>
            {documentsGenerated}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
            Section 65B Signed
          </div>
        </div>
      </div>

      {/* Two-Column Layout (Left 65%, Right 35%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: '24px' }}>
        {/* Left (65%): Recent Bills Data Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Recent Bills
            </h2>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveFilter('ALL')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${activeFilter === 'AUDITED' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveFilter('AUDITED')}
              >
                Audited
              </button>
              <button
                className={`btn btn-sm ${activeFilter === 'FLAGGED' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveFilter('FLAGGED')}
              >
                Discrepancies
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Date</th>
                  <th className="amount-cell">Amount</th>
                  <th className="amount-cell">Overcharge</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-neutral-600)' }}>
                      No bills match current filter.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{b.hospital_name || 'Hospital Inpatient'}</div>
                        <div className="text-mono" style={{ fontSize: '11px', color: 'var(--color-neutral-600)' }}>{b.id}</div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                        {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="amount-cell">
                        {b.total_billed ? formatINR(b.total_billed) : '—'}
                      </td>
                      <td className="amount-cell" style={{ color: (b.total_overcharge || 0) > 0 ? 'var(--color-danger)' : 'var(--color-neutral-600)', fontWeight: (b.total_overcharge || 0) > 0 ? 700 : 400 }}>
                        {(b.total_overcharge || 0) > 0 ? `+${formatINR(b.total_overcharge || 0)}` : '₹0'}
                      </td>
                      <td>
                        <span className={`badge ${b.status === 'AUDITED' || b.status === 'RESOLVED' ? 'badge-completed' : (b.total_overcharge || 0) > 0 ? 'badge-failed' : 'badge-processing'}`}>
                          {b.status || 'PROCESSING'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/dashboard/report?billId=${b.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                          View Report →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (35%): Activity Feed */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '16px' }}>
            Activity Feed
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--color-success)', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                  Statutory Audit Complete
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>
                  Metro Multispeciality Hospital bill analyzed against NPPA Gazette caps.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
                  10 mins ago
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--color-primary)', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                  Payment Reconciled
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>
                  Razorpay UPI payment ₹73,400 verified and matched against ledger.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
                  2 hours ago
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--color-danger)', marginTop: '6px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                  Dispute Notice Prepared
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>
                  Section 65B certificate generated for ₹13,500 unbundled sanitization charges.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
                  Yesterday
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
