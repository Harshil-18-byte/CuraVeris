'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { analytics } from '../../lib/analytics/events';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught unhandled React render error:', error, errorInfo);

    analytics.track('unhandled_render_error', {
      error_message: error.message,
      component_stack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReturnHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="app-container"
          style={{
            padding: '4rem 1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <div
            className="panel-raised"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '2.5rem',
              textAlign: 'center',
              border: '1px solid var(--color-danger-border)',
            }}
          >
            <span className="badge badge-danger" style={{ marginBottom: '1rem' }}>
              RENDER RECOVERY TRIGGERED
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              {this.props.fallbackTitle || 'Service Interface Encountered an Error'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {this.props.fallbackMessage ||
                'The system detected an unexpected rendering issue and safely prevented a blank screen. Your session data is preserved.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Reload Interface [→]
              </button>
              <button
                type="button"
                onClick={this.handleReturnHome}
                className="btn btn-secondary"
              >
                Return to Homepage
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-danger-text)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
