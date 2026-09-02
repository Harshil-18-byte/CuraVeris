'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegistering, registerError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    if (!dpdpConsent) {
      setLocalError('You must consent to bill verification under DPDP Act 2023');
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role: 'PATIENT',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setLocalError(err?.message || 'Registration failed. Please try again.');
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
          maxWidth: '460px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-elevated)',
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          border: '1px solid var(--color-neutral-300)',
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '22px',
                color: 'var(--color-primary)',
                letterSpacing: '-0.5px',
                marginBottom: '4px',
              }}
            >
              CURAVERIS
            </div>
          </Link>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              marginTop: '6px',
            }}
          >
            Create Your Account
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
            Start auditing hospital bills against statutory government price caps
          </p>
        </div>

        {/* Error Banner */}
        {(localError || registerError) && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-surface, #FEF2F2)',
              border: '1px solid var(--color-danger, #EF4444)',
              borderLeftWidth: '4px',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#991B1B',
              marginBottom: '16px',
            }}
          >
            {localError || registerError?.message || 'Registration failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-neutral-900)',
                marginBottom: '6px',
              }}
            >
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-neutral-900)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-neutral-900)',
                marginBottom: '6px',
              }}
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-neutral-900)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-neutral-900)',
                marginBottom: '6px',
              }}
            >
              Mobile Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-neutral-900)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-neutral-900)',
                marginBottom: '6px',
              }}
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: '6px',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-neutral-900)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* DPDP Consent */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
            <input
              id="dpdpConsent"
              type="checkbox"
              checked={dpdpConsent}
              onChange={(e) => setDpdpConsent(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <label htmlFor="dpdpConsent" style={{ fontSize: '12px', color: 'var(--color-neutral-600)', lineHeight: '1.4' }}>
              I consent to CuraVeris processing medical bills under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              marginTop: '8px',
              cursor: isRegistering ? 'not-allowed' : 'pointer',
            }}
          >
            {isRegistering ? 'Creating Account...' : 'Create Free Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
