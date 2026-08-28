'use client';

import React from 'react';
import { useSystemHealth, useLiveness, useReadiness } from '../hooks/useHealth';
import { LoadingState } from '../components/ui/LoadingState';

export default function HomePage() {
  const { data: health, isLoading: isHealthLoading, error: healthError } = useSystemHealth();
  const { data: liveness } = useLiveness();
  const { data: readiness } = useReadiness();

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-success">Phase 5 — Web Foundation Active</span>
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
          Statutory Medical Bill Audit & <span style={{ color: 'var(--accent-primary)' }}>Patient Financial Advocacy</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Deterministic statutory compliance checks (NPPA, DPCO, CGHS, IRDAI) coupled with forensic ML risk models and Section 65B cryptographic ledgers.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Open Dashboard →
          </a>
          <a href="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Account Sign In
          </a>
        </div>
      </section>

      {/* Backend Health Diagnostics Card */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Backend Connectivity & System Probes</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Real-time synchronization status with FastAPI backend (`/health`, `/health/live`, `/health/ready`).
            </p>
          </div>
          {health && (
            <span className={`badge ${health.status === 'healthy' ? 'badge-success' : 'badge-danger'}`}>
              {health.status}
            </span>
          )}
        </div>

        {isHealthLoading ? (
          <LoadingState message="Connecting to CuraVeris backend..." size="sm" />
        ) : healthError ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', color: '#ef4444' }}>
            Unable to reach FastAPI backend: {healthError.message}
          </div>
        ) : (
          <div className="grid-cols-3">
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                Primary Database
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: health?.database ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {health?.database ? '✓ Connected (PostgreSQL)' : '✗ Offline'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Environment: {health?.environment}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                Statutory Reference Rates
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: health?.reference_db ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {health?.reference_db ? '✓ Loaded (NPPA / DPCO / CGHS)' : '✗ Missing'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Version: {health?.version}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                Liveness & Readiness
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {liveness?.status === 'alive' && readiness?.status === 'ready' ? '✓ Ready for Traffic' : '● Initializing'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Probes: Live (200), Ready (200)
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
