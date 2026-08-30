'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(12);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      await login({ email: identifier, password });
      router.push('/dashboard');
    } catch (err) {
      // handled by useAuth
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-neutral-50)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '22px',
              color: 'var(--color-primary)',
              letterSpacing: '-0.5px',
              marginBottom: '4px',
            }}
          >
            CURAVERIS
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              marginTop: '8px',
            }}
          >
            Welcome Back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
            Sign in to access your statutory healthcare audits
          </p>
        </div>

        {/* Lockout Banner */}
        {isLocked && (
          <div
            style={{
              backgroundColor: 'var(--color-warning-surface)',
              border: '1px solid var(--color-warning)',
              borderLeftWidth: '4px',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--color-neutral-900)',
              marginBottom: '16px',
            }}
          >
            <strong>Account locked.</strong> Try again in {lockoutMinutes} minutes.
          </div>
        )}

        {/* Error Banner */}
        {loginError && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-surface)',
              border: '1px solid var(--color-danger)',
              borderLeftWidth: '4px',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'var(--color-danger)',
              marginBottom: '16px',
            }}
          >
            {loginError.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. advocate@curaveris.in or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '60px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-neutral-600)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <Link
                href="/forgot-password"
                style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoggingIn}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            color: 'var(--color-neutral-600)',
            fontSize: '13px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-neutral-300)' }} />
          <span style={{ padding: '0 12px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-neutral-300)' }} />
        </div>

        {/* Create Account Secondary Button */}
        <Link
          href="/register"
          className="btn btn-secondary"
          style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
