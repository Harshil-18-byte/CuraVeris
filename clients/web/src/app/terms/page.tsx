'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="app-container" style={{ padding: '3rem 0', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
          STATUTORY LEGAL TERMS
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Terms of Service & Statutory Citations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Governing Consumer Rights under Consumer Protection Act 2019 & Gazette Notifications.
        </p>
      </div>

      <section className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>1. Statutory Advocacy & Audit Scope</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          CuraVeris provides deterministic forensic cross-verification of medical billing invoices against Gazette notifications issued by the National Pharmaceutical Pricing Authority (NPPA), Drug Price Control Order (DPCO), Central Government Health Scheme (CGHS), and Insurance Regulatory and Development Authority of India (IRDAI).
        </p>
      </section>

      <section className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>2. Consumer Protection Act 2019</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Under Section 2(47) of the Consumer Protection Act 2019, charging amounts in excess of the price fixed by law or agreed upon is classified as an Unfair Trade Practice. CuraVeris audit cards and generated dispute letters serve as preliminary evidence notices for filing complaints before District and State Consumer Disputes Redressal Commissions.
        </p>
      </section>

      <section className="panel-raised" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>3. Not Formal Clinical Advice</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          CuraVeris evaluates tariff and billing compliance only. It does not provide medical diagnoses, treatment advice, or dispute the clinical necessity of any medical intervention performed by healthcare professionals.
        </p>
      </section>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/dashboard" className="btn btn-primary">
          Back to Audit Studio [→]
        </Link>
        <Link href="/privacy" className="btn btn-secondary">
          View Privacy Policy
        </Link>
      </div>
    </div>
  );
}
