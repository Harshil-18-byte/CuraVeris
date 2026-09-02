'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-neutral-50)' }}>
      {/* Top Public Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-neutral-300)',
          backgroundColor: 'var(--color-white)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '20px',
                color: 'var(--color-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              CURAVERIS
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/login"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-neutral-900)',
              }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '64px 0 48px' }}>
        <div
          className="app-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headline and CTAs */}
          <div>
            <span className="badge badge-completed" style={{ marginBottom: '16px' }}>
              STATUTORY HEALTHCARE AUDIT
            </span>

            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'var(--color-neutral-900)',
                letterSpacing: '-1.5px',
                marginBottom: '16px',
              }}
            >
              Your Hospital Bill,<br />Audited by Law.
            </h1>

            <p
              style={{
                fontSize: '18px',
                color: 'var(--color-neutral-600)',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}
            >
              CuraVeris automatically checks every charge against CGHS, NPPA, DPCO, IRDAI, and GST rules. Know exactly what you shouldn't have paid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link
                  href="/register"
                  className="btn btn-primary btn-lg"
                  style={{ fontWeight: 600 }}
                >
                  Analyse My Bill — It's Free →
                </Link>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                No credit card · Results in under 10 minutes
              </span>
            </div>
          </div>

          {/* Right Column: Clean SVG/Mockup Illustration */}
          <div
            className="card"
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-white)',
              border: '1.5px solid var(--color-neutral-300)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-300)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>SAMPLE AUDIT SUMMARY</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-neutral-900)' }}>Metro Multispeciality Hospital</div>
              </div>
              <span className="badge badge-failed">₹42,240 OVERCHARGED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--color-neutral-50)', borderRadius: '6px' }}>
                <span>ICU Room Charge (2 Days)</span>
                <span className="text-mono" style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Verified (₹36,000)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--color-danger-surface)', borderLeft: '4px solid var(--color-danger)', borderRadius: '4px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Drug Eluting Stent</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)' }}>Exceeds NPPA Cap S.O. 1335(E)</div>
                </div>
                <span className="text-mono" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>−₹26,740</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--color-danger-surface)', borderLeft: '4px solid var(--color-danger)', borderRadius: '4px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>OT PPE / Sanitization Kit</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-neutral-600)' }}>Unbundled illegal surcharge</div>
                </div>
                <span className="text-mono" style={{ fontWeight: 700, color: 'var(--color-danger)' }}>−₹15,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ borderTop: '1px solid var(--color-neutral-300)', borderBottom: '1px solid var(--color-neutral-300)', backgroundColor: 'var(--color-white)', padding: '36px 0' }}>
        <div
          className="app-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              14,200+
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              Total Hospital Bills Audited
            </div>
          </div>

          <div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-danger)', fontFamily: 'var(--font-heading)' }}>
              ₹8.4 Crore+
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              Overcharges Flagged by Law
            </div>
          </div>

          <div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-heading)' }}>
              6,800+
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              Dispute Documents Generated
            </div>
          </div>
        </div>
      </section>

      {/* Frameworks Section */}
      <section style={{ padding: '48px 0' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              We Check Against Every Indian Healthcare Framework
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginTop: '6px' }}>
              Deterministic statutory verification cross-referencing published official gazettes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>STATUTORY</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>CGHS Rate Master</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Official Central Government Health Scheme ceilings for 1,700+ procedures.</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>STATUTORY</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>NPPA Implant Ceilings</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>National Pharmaceutical Pricing Authority mandatory caps on stents and orthopaedics.</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>STATUTORY</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>DPCO Drug Price Orders</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Drug Price Control Order maximum retail prices on scheduled formulations.</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>REGULATORY</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>IRDAI Master Circulars</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Standardized list of non-payable items and admissible hospital expenses.</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>TAXATION</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>GST Healthcare Exemptions</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>CBIC statutory exemptions on clinical health care services and room rent limits.</div>
            </div>

            <div className="card" style={{ padding: '16px' }}>
              <span className="badge badge-queued" style={{ marginBottom: '6px' }}>STANDARDS</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-neutral-900)' }}>ABDM & PM-JAY Packages</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>Ayushman Bharat National Health Authority procedural tariff benchmarks.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '48px 0 64px', backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-neutral-300)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              How CuraVeris Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>1. Upload</div>
              <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-neutral-900)', marginBottom: '6px' }}>Upload Bill PDF or Photos</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Our OCR engine extracts every itemized line item, pharmacy entry, and procedure fee.</div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>2. Audit</div>
              <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-neutral-900)', marginBottom: '6px' }}>Statutory Cross-Check</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Every charge is matched against government price ceilings and unbundled billing rules.</div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>3. Dispute</div>
              <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-neutral-900)', marginBottom: '6px' }}>Evidence & Legal Notices</div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>Get signed Section 65B audit reports and ready-to-file ombudsman petitions.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-neutral-900)', color: '#FFFFFF', padding: '32px 0' }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.5px' }}>CURAVERIS</div>
            <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              Compliant with Digital Personal Data Protection (DPDP) Act 2023.
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-neutral-300)', display: 'flex', gap: '16px' }}>
            <Link href="/privacy" style={{ color: 'var(--color-neutral-300)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--color-neutral-300)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
