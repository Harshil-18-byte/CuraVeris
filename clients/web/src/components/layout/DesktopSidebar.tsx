'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useBills } from '../../hooks/useBills';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { bills } = useBills();
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { label: 'Overview', href: '/' },
    { label: 'Forensic Audit', href: '/dashboard' },
    { label: 'Reconciliation', href: '/reconciliation' },
    { label: 'Claims (TPA)', href: '/claims' },
    { label: 'Exception Queue', href: '/exceptions' },
    { label: 'Payments', href: '/payments' },
    { label: 'Recovery', href: '/recovery' },
    { label: 'Statutory Rules', href: '/admin/rules' },
    { label: 'Model Center', href: '/admin/models' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '60px' : '250px',
        minHeight: '100vh',
        background: '#0D0F14',
        borderRight: '1px solid #1E232F',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1rem',
        transition: 'width 0.15s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Top Header & New Audit CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Brand & Collapse Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="CuraVeris"
              style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }}
            />
            {!collapsed && (
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                CURAVERIS
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '4px',
              margin: collapsed ? '0 auto' : '0',
            }}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Primary Action Button: + New Bill Audit */}
        <Link
          href="/scan"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.5rem',
            background: '#FFFFFF',
            color: '#090B0E',
            borderRadius: 'var(--radius-pill)',
            padding: collapsed ? '0.65rem' : '0.65rem 1rem',
            fontSize: '0.84rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>+</span>
          {!collapsed && <span>New Bill Audit</span>}
        </Link>

        {/* Main Nav Links (No Icons) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  background: isActive ? '#1A1F2B' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  letterSpacing: '-0.01em',
                }}
              >
                <span>{collapsed ? item.label.slice(0, 2).toUpperCase() : item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Recent Audits Section */}
        {!collapsed && bills.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div className="label" style={{ fontSize: '0.625rem', padding: '0 0.5rem', color: 'var(--text-dim)' }}>
              Recent Audit Files
            </div>
            {bills.slice(0, 3).map((b) => (
              <Link
                key={b.id}
                href="/dashboard"
                style={{
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                {b.hospital_name || b.id}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div
        style={{
          borderTop: '1px solid #1E232F',
          paddingTop: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                {user?.full_name || 'Patient Advocate'}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                {user?.email || 'advocate@curaveris.in'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
