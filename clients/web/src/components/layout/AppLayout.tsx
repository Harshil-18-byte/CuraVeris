'use client';

import React from 'react';
import { Header } from './Header';
import { NetworkBanner } from '../ui/NetworkBanner';
import { ErrorBoundary } from '../ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-neutral-50)' }}>
      <NetworkBanner />
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--color-neutral-300)',
          padding: '24px 0',
          marginTop: 'auto',
          backgroundColor: 'var(--color-neutral-900)',
          color: '#FFFFFF',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        <div className="app-container">
          <p>© 2026 CuraVeris · Statutory Healthcare Financial Verification · DPDP Act 2023 Compliant</p>
        </div>
      </footer>
    </div>
  );
}
