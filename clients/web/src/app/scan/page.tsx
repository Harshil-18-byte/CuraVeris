'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBills } from '../../hooks/useBills';
import { PersistenceEngine, StorageKeys } from '../../lib/storage/persistence';
import { formatINR } from '../../lib/utils/formatters';

const PROCESSING_STAGES = [
  {
    step: 1,
    title: 'Reading Bill',
    phrases: [
      'Extracting high-resolution OCR text...',
      'Normalizing itemized line items and tax codes...',
    ],
  },
  {
    step: 2,
    title: 'Statutory Check',
    phrases: [
      'Cross-referencing NPPA Medical Device price caps...',
      'Verifying DPCO 2013 essential medicine MRPs...',
      'Checking CGHS tier rates and IRDAI non-payable rules...',
    ],
  },
  {
    step: 3,
    title: 'AI Analysis',
    phrases: [
      'Evaluating SHAP anomaly vectors against 85k hospital bills...',
      'Testing shadow billing and phantom charge invariants...',
    ],
  },
  {
    step: 4,
    title: 'Financial Analysis',
    phrases: [
      'Computing patient financial hardship classification...',
      'Calculating statutory refund and restitution totals...',
    ],
  },
  {
    step: 5,
    title: 'Report Ready',
    phrases: ['Generating Section 65B cryptographic evidence certificate...'],
  },
];

export default function ScanBillPage() {
  const router = useRouter();
  const { uploadBill, isUploading } = useBills();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billDate, setBillDate] = useState('');

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(0);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Cycle through active status phrases
  useEffect(() => {
    if (currentStep > 0 && currentStep <= 5) {
      const interval = setInterval(() => {
        setActivePhraseIndex((prev) => (prev + 1) % 2);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorBanner(null);
    setAuditResult(null);
    setCurrentStep(0);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setErrorBanner(null);
    setCurrentStep(1); // Reading Bill

    try {
      // Advance step tracking animations
      setTimeout(() => setCurrentStep(2), 1200); // Statutory Check
      setTimeout(() => setCurrentStep(3), 2600); // AI Analysis
      setTimeout(() => setCurrentStep(4), 3800); // Financial Analysis

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (hospitalName) formData.append('hospital_name', hospitalName);
      if (totalAmount) formData.append('total_amount', totalAmount);
      if (billDate) formData.append('bill_date', billDate);

      const result: any = await uploadBill(formData);

      setCurrentStep(5); // Report Ready
      setAuditResult(result);
      PersistenceEngine.set(StorageKeys.ACTIVE_BILL, result);
    } catch (err: any) {
      setErrorBanner(err.message || 'Invoice processing failed. Please ensure the bill is clearly legible.');
      setCurrentStep(0);
    }
  };

  return (
    <div className="app-container" style={{ padding: '32px 0 64px', maxWidth: '640px' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href="/dashboard" style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 500 }}>
          ← Back to Dashboard
        </Link>
        <span className="badge badge-queued">STEP 1 OF 2</span>
      </div>

      {currentStep === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Upload Hospital Bill
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              Photograph your paper invoice or upload an itemized PDF for statutory audit.
            </p>
          </div>

          {/* Two Large Action Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Tile 1: Camera */}
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="card"
              style={{
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                border: '1.5px solid var(--color-neutral-300)',
                background: 'var(--color-neutral-50)',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>
                Take a Photo
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                Photograph paper bill
              </div>
            </div>

            {/* Tile 2: File Picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="card"
              style={{
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                border: '1.5px solid var(--color-neutral-300)',
                background: 'var(--color-neutral-50)',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '15px', color: 'var(--color-neutral-900)' }}>
                Choose File
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                PDF, PNG, JPEG · Max 50MB
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {/* Selected File Preview Box */}
          {selectedFile && (
            <div className="card" style={{ padding: '16px', background: 'var(--color-primary-surface)', borderColor: 'var(--color-primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--color-primary)', color: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                    {selectedFile.type.includes('pdf') ? 'PDF' : 'IMG'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-900)' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>
                      {(selectedFile.size / 1024).toFixed(0)} KB · Ready for analysis
                    </div>
                  </div>
                </div>

                <span className="badge badge-completed">✓ SELECTED</span>
              </div>

              {previewUrl && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--color-neutral-300)' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Optional Fields Accordion */}
          <div className="card" style={{ padding: '16px' }}>
            <div
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-neutral-900)' }}>
                Add Hospital & Bill Details (Optional)
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>
                {showOptionalFields ? '▲ Hide' : '▼ Add Details'}
              </span>
            </div>

            {showOptionalFields && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter hospital or healthcare facility name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Invoiced Amount (₹)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 185000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bill Date</label>
                  <input
                    type="date"
                    className="input"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {errorBanner && (
            <div style={{ background: 'var(--color-danger-surface)', border: '1px solid var(--color-danger)', borderLeft: '4px solid var(--color-danger)', padding: '12px 16px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-danger)' }}>
              {errorBanner}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={!selectedFile || isUploading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {isUploading ? 'Uploading Invoice...' : 'Upload & Analyse Bill →'}
          </button>
        </div>
      )}

      {/* STEP PROCESSING VIEW (SCREEN 11) */}
      {currentStep > 0 && (
        <div className="card" style={{ padding: '32px 24px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-processing" style={{ marginBottom: '8px' }}>
              STEP 2 OF 2 · IN PROGRESS
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              {currentStep < 5 ? 'Analysing Your Bill' : 'Audit Complete'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)', marginTop: '4px' }}>
              {currentStep < 5
                ? 'Cross-checking invoiced items against gazetted government price schedules.'
                : 'All statutory rate checks and anomaly invariants have completed.'}
            </p>
          </div>

          {/* 5-Step Vertical Track */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '8px' }}>
            {PROCESSING_STAGES.map((stage) => {
              const isDone = currentStep > stage.step;
              const isActive = currentStep === stage.step;
              const isPending = currentStep < stage.step;

              return (
                <div key={stage.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Step Circle Icon */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                      background: isDone
                        ? 'var(--color-success)'
                        : isActive
                        ? 'var(--color-primary)'
                        : 'var(--color-white)',
                      color: isDone || isActive ? 'var(--color-white)' : 'var(--color-neutral-600)',
                      border: isPending ? '1.5px solid var(--color-neutral-300)' : 'none',
                    }}
                  >
                    {isDone ? '✓' : stage.step}
                  </div>

                  {/* Step Label & Dynamic Sub-Label */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: isDone || isActive ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
                      }}
                    >
                      {stage.title}
                    </div>

                    {isActive && (
                      <div style={{ fontSize: '13px', color: 'var(--color-primary)', marginTop: '2px' }}>
                        {stage.phrases[activePhraseIndex % stage.phrases.length]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Processing Time Remaining */}
          {currentStep < 5 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-neutral-300)', fontSize: '13px', color: 'var(--color-neutral-600)', textAlign: 'center' }}>
              Estimated time remaining: ~30 seconds
            </div>
          )}

          {/* Completed State Button */}
          {currentStep === 5 && (
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <Link href="/dashboard/report" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                View Your Report →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
