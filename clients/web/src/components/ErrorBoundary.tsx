'use client';

/**
 * Robust React Error Boundary with user-friendly recovery UI and trace display.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CuraVeris Web Client:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div className="glass-panel" style={{
            maxWidth: '540px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '1.5rem',
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              An unexpected application error occurred. We have logged this diagnostic event.
            </p>
            {this.state.error && (
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.8rem',
                color: '#f87171',
                overflowX: 'auto',
                marginBottom: '1.5rem',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
