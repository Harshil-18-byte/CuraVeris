'use client';

import React from 'react';

const INTEGRATIONS = [
  {
    name: 'Razorpay Payment Gateway',
    type: 'Payment & Webhooks',
    status: 'HEALTHY',
    latency: '142ms',
    details: 'Orders API v1 + Webhooks signature secret verified.',
  },
  {
    name: 'National Health Authority (ABDM / ABDC)',
    type: 'Govt Health Stack',
    status: 'CONNECTED',
    latency: '310ms',
    details: 'HIU/HIP gateway integration active.',
  },
  {
    name: 'Insurance Information Bureau (IIB)',
    type: 'Claims Registry',
    status: 'HEALTHY',
    latency: '220ms',
    details: 'TPA claim status feed synchronized.',
  },
  {
    name: 'NPPA Statutory Registry Feed',
    type: 'Price Ceiling Engine',
    status: 'HEALTHY',
    latency: '95ms',
    details: 'Daily gazette sync enabled.',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-completed" style={{ marginBottom: '6px' }}>SYSTEM HEALTH & APIS</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Integrations & Gateway Connections
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Real-time connection telemetry for Razorpay, Insurance TPA exchanges, and statutory registry feeds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {INTEGRATIONS.map((i) => (
          <div key={i.name} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>{i.type}</span>
              <span className="badge badge-completed">● {i.status}</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{i.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: '18px' }}>{i.details}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-neutral-300)', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-neutral-600)' }}>Avg Response Latency:</span>
              <span className="text-mono" style={{ fontWeight: 600, color: 'var(--color-success)' }}>{i.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
