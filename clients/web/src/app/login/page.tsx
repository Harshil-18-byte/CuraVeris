'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role });
        setSuccessMsg('Account registered successfully! Redirecting...');
      } else {
        await login({ email, password });
        setSuccessMsg('Login successful! Redirecting...');
      }
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch {
      // Handled in mutation error state
    }
  };

  if (isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Already Authenticated</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You are currently logged into CuraVeris.
          </p>
          <a href="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const err = isRegister ? registerError : loginError;

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isRegister ? 'Access statutory advocacy and bill auditing' : 'Sign in to access your bill audits'}
          </p>
        </div>

        {err && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {err.message || 'Authentication failed. Please verify your credentials.'}
          </div>
        )}

        {successMsg && (
          <div
            role="alert"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                >
                  <option value="PATIENT">Patient / Financial Advocate</option>
                  <option value="HOSPITAL_FINANCE">Hospital Finance Controller</option>
                  <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                  <option value="TPA_REVIEWER">TPA Claim Reviewer</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@curaveris.internal"
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || isRegistering}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {isLoggingIn || isRegistering ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Do not have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
