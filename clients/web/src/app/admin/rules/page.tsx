'use client';

import React from 'react';

const RULES = [
  {
    code: 'RULE-NPPA-01',
    name: 'Coronary Stent Maximum Retail Ceiling',
    authority: 'NPPA S.O. 1335(E)',
    effectiveDate: '01 Apr 2026',
    status: 'ACTIVE_STATUTORY',
    lastSync: 'Today, 06:00 AM',
  },
  {
    code: 'RULE-DPCO-04',
    name: 'Essential Injections NLEM Rate Bounds',
    authority: 'DPCO 2013 / NPPA Schedule I',
    effectiveDate: '15 May 2026',
    status: 'ACTIVE_STATUTORY',
    lastSync: 'Today, 06:00 AM',
  },
  {
    code: 'RULE-CGHS-12',
    name: 'Unbundled OT Sanitization Prohibition',
    authority: 'CGHS OM S.11011/11/2023',
    effectiveDate: '01 Jan 2026',
    status: 'ACTIVE_STATUTORY',
    lastSync: 'Today, 06:00 AM',
  },
  {
    code: 'RULE-IRDAI-09',
    name: 'Standard List of Non-Payable Items in Health Insurance',
    authority: 'IRDAI Master Circular 2024',
    effectiveDate: '01 Jun 2026',
    status: 'ACTIVE_STATUTORY',
    lastSync: 'Today, 06:00 AM',
  },
];

export default function RuleCenterPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-completed" style={{ marginBottom: '6px' }}>STATUTORY REPOSITORY</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Statutory Rule Center
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Statutory ceiling registries: NPPA, DPCO 2013, CGHS Tariffs, and IRDAI Non-Payable Master Circulars.
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Rule Identifier</th>
              <th>Rule Scope</th>
              <th>Statutory Authority & Gazette Ref</th>
              <th>Effective Date</th>
              <th>Status</th>
              <th>Last Gazette Sync</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.code}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{r.code}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{r.name}</td>
                <td style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>{r.authority}</td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{r.effectiveDate}</td>
                <td><span className="badge badge-completed">{r.status}</span></td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{r.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
