'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Scan Bill', href: '/scan' },
    { label: 'Reconciliation', href: '/reconciliation' },
    { label: 'Claims', href: '/claims' },
    { label: 'Audits', href: '/audits' },
    { label: 'Dispute Petitions', href: '/dispute' },
    { label: 'Advisory', href: '/copilot' },
    { label: 'Privacy & DPDP', href: '/privacy' },
  ];

  return (
    <header
      style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-neutral-300)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="CuraVeris"
              style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '-0.5px',
                color: 'var(--color-primary)',
              }}
            >
              CURAVERIS
            </span>
            <span className="badge badge-queued" style={{ fontSize: '10px' }}>
              NPPA • CGHS • DPCO
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--color-primary)' : 'var(--color-neutral-600)',
                  borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'color 0.15s ease',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {mounted && isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-completed" style={{ fontSize: '11px' }}>
                {user?.role || 'ADVOCATE'}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="btn btn-ghost btn-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/scan" className="btn btn-primary btn-sm">
                Audit Bill
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
