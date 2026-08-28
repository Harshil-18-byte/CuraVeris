'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSystemHealth } from '../../hooks/useHealth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: health } = useSystemHealth();

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.025em',
            }}
          >
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.1rem',
              }}
            >
              ⚖️
            </span>
            <span>Cura<span style={{ color: 'var(--accent-primary)' }}>Veris</span></span>
          </a>

          {/* Backend Status Pill */}
          {health && (
            <span
              className={`badge ${health.status === 'healthy' ? 'badge-success' : 'badge-warning'}`}
              style={{ marginLeft: '0.5rem' }}
              title={`API Backend: ${health.environment} (v${health.version})`}
            >
              ● {health.status}
            </span>
          )}
        </div>

        {/* Navigation links & user session */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} aria-label="Main Navigation">
          <a
            href="/"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '0.5rem 0.75rem',
            }}
          >
            Overview
          </a>
          <a
            href="/dashboard"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '0.5rem 0.75rem',
            }}
          >
            Dashboard
          </a>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {user?.full_name || user?.email}
              </span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
              Sign In
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
