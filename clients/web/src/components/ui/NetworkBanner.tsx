'use client';

/**
 * Network Offline/Reconnecting Alert Banner.
 */
import React from 'react';
import { useNetworkState } from '../../hooks/useNetworkState';

export function NetworkBanner() {
  const { isOnline } = useNetworkState();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <span>⚡</span>
      <span>You are currently offline. Actions will be synced once your connection is restored.</span>
    </div>
  );
}
