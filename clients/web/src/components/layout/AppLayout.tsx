import React from 'react';
import { Header } from './Header';
import { NetworkBanner } from '../ui/NetworkBanner';
import { ErrorBoundary } from '../ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NetworkBanner />
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '2rem 0',
          marginTop: 'auto',
          background: 'rgba(10, 15, 29, 0.95)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p>© 2026 CuraVeris. Automated Statutory Medical Bill Verification & Patient Financial Advocacy.</p>
        </div>
      </footer>
    </div>
  );
}
