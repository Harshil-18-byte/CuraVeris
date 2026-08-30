'use client';

import React from 'react';
import Link from 'next/link';

export default function EvidencePage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)', marginBottom: '16px' }}>
        <Link href="/findings" style={{ color: 'var(--color-primary)' }}>← Back to Findings</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span className="badge badge-completed">SECTION 65B VERIFIED</span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '6px' }}>
            Evidence & Document Verification Center
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        {/* Left: Document Preview Surface */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>📄 Final_Inpatient_Tax_Invoice.pdf</span>
            <span style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>Page 7 of 14</span>
          </div>

          <div style={{ padding: '24px', background: '#FAF9F6', minHeight: '480px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '24px', color: 'var(--color-neutral-900)' }}>
            <div style={{ color: 'var(--color-neutral-600)' }}>... 14. 2D Echocardiography Color Doppler ........................ ₹4,500.00</div>
            
            {/* Highlighted Bounding Box Surface */}
            <div style={{ background: 'rgba(253, 237, 236, 0.9)', border: '1.5px solid var(--color-danger)', padding: '10px 14px', borderRadius: '4px', margin: '8px 0', position: 'relative' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                15. Coronary Drug Eluting Stent (Sierra 3.0mm) ........ ₹65,000.00
              </span>
              <div style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--color-danger)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '2px' }}>
                STATUTORY OVERCHARGE DETECTED
              </div>
            </div>

            <div style={{ color: 'var(--color-neutral-600)' }}>... 16. Cathlab Procedure Fee (Level 3) .......................... ₹45,000.00</div>
            <div style={{ color: 'var(--color-neutral-600)' }}>... 17. Coronary Angioplasty Consumables Kit .................... ₹18,000.00</div>
          </div>
        </div>

        {/* Right: Statutory Finding Ground & Extraction Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card card-severity-high" style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '4px' }}>
              VIOLATION OF STATUTORY CEILING
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '8px' }}>
              NPPA Gazette Order S.O. 1335(E)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-neutral-600)', lineHeight: '18px' }}>
              The National Pharmaceutical Pricing Authority (NPPA) legally caps Coronary Drug Eluting Stents at ₹38,260 (plus 5% GST). Hospital billed ₹65,000, creating an impermissible overcharge of ₹26,740.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '12px' }}>
              Extraction Metadata & Model Grounding
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>OCR Extraction Engine:</span>
                <span style={{ fontWeight: 600 }}>Tesseract + LayoutLMv3</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Bounding Box:</span>
                <span className="text-mono">[x: 120, y: 450, w: 580, h: 32]</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>SHA-256 Digest:</span>
                <span className="text-mono" style={{ fontSize: '11px' }}>e3b0c44298fc1c149afb...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Extraction Confidence:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>99.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
