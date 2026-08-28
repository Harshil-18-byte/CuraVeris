'use client';

import React from 'react';

export function Sidebar() {
  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'Bill Audits', href: '/dashboard/bills', icon: '🧾' },
    { label: 'Statutory Claims', href: '/dashboard/claims', icon: '⚖️' },
    { label: 'Dispute Petitions', href: '/dashboard/disputes', icon: '📜' },
    { label: 'Reconciliation', href: '/dashboard/reconciliation', icon: '🔄' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <aside
      aria-label="Dashboard Sidebar"
      style={{
        width: '240px',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: 'calc(100vh - 4rem)',
        background: 'rgba(17, 24, 39, 0.4)',
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
        Navigation
      </div>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            color: item.href === '/dashboard' ? '#ffffff' : 'var(--text-secondary)',
            background: item.href === '/dashboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: item.href === '/dashboard' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            fontSize: '0.9rem',
            fontWeight: item.href === '/dashboard' ? 600 : 500,
            transition: 'all 0.15s ease',
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </aside>
  );
}
