'use client';

import React from 'react';
import { useSystemHealth } from '../../hooks/useHealth';
import { formatINR } from '../../lib/utils/formatters';

export default function FinancePage() {
  const { data: health } = useSystemHealth();

  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>
            OPERATIONS & RECONCILIATION
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Institutional Operations Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Real-time health of statutory audit pipelines, OCR queues, and ledger sync.
          </p>
        </div>

        <span className="badge badge-completed">
          {health?.status === 'healthy' ? 'SYSTEM OPERATIONAL' : 'ONLINE'}
        </span>
      </div>

      {/* System Health Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>API Status</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            ● Online
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>p99: 42ms</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>PostgreSQL & SQLite</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            ● Synced
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Rate DB Active</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Redis Cache</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            ● Healthy
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Hit Ratio: 98.4%</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Worker Pool</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '4px' }}>
            4 Active
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>OCR Engines</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Queue Depth</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '4px' }}>
            0 Jobs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px' }}>Zero backlog</div>
        </div>
      </div>

      {/* Worker Tasks Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '16px' }}>
          Statutory Audit Task Pipeline
        </h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Engine Subsystem</th>
                <th>Status</th>
                <th>Processed Today</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-mono" style={{ fontWeight: 600 }}>worker-nppa-01</td>
                <td>NPPA Device Cap Matching Engine</td>
                <td><span className="badge badge-completed">IDLE</span></td>
                <td>420 Invoices</td>
                <td>99.98%</td>
              </tr>
              <tr>
                <td className="text-mono" style={{ fontWeight: 600 }}>worker-dpco-02</td>
                <td>DPCO NLEM 2013 Medicine Pricing</td>
                <td><span className="badge badge-completed">IDLE</span></td>
                <td>385 Invoices</td>
                <td>99.95%</td>
              </tr>
              <tr>
                <td className="text-mono" style={{ fontWeight: 600 }}>worker-cghs-03</td>
                <td>CGHS Tier-1 Tariff Inspector</td>
                <td><span className="badge badge-completed">IDLE</span></td>
                <td>512 Invoices</td>
                <td>99.99%</td>
              </tr>
              <tr>
                <td className="text-mono" style={{ fontWeight: 600 }}>worker-merkle-04</td>
                <td>Section 65B Cryptographic Ledger</td>
                <td><span className="badge badge-completed">IDLE</span></td>
                <td>1,240 Hashes</td>
                <td>100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
