'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDevice } from '../../providers/DeviceProvider';

export function MobileTabBar() {
  const pathname = usePathname();
  const { deviceMode } = useDevice();

  const tabs = [
    { label: 'Home', href: '/', indicator: '⌂' },
    { label: 'Audit', href: '/dashboard', indicator: '📋' },
    { label: 'Scan', href: '/scan', isPrimary: true, indicator: '📷' },
    { label: 'Dispute', href: '/dispute', indicator: '⚖' },
    { label: 'Advisory', href: '/copilot', indicator: '💬' },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      style={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        background: 'rgba(18, 21, 27, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.4rem 0.5rem env(safe-area-inset-bottom, 0.5rem)',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        if (tab.isPrimary) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                color: '#090B0E',
                borderRadius: 'var(--radius-pill)',
                padding: '0.5rem 1.25rem',
                gap: '0.35rem',
                fontWeight: 800,
                fontSize: '0.8125rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <span>{tab.indicator}</span>
              <span>SCAN</span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              textDecoration: 'none',
              color: isActive ? '#FFFFFF' : 'var(--text-dim)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.6875rem',
              letterSpacing: '0.02em',
              padding: '0.25rem 0.5rem',
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>
              {tab.indicator}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
