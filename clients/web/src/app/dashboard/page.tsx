'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { useBills } from '../../hooks/useBills';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState } from '../../components/ui/LoadingState';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { bills, isLoading, uploadBill, isUploading } = useBills();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadStatus('Uploading and initiating deterministic audit...');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await uploadBill(formData);
      setUploadStatus('Bill uploaded successfully!');
      setSelectedFile(null);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message || 'Error processing bill'}`);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Welcome Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Welcome back, {user?.full_name || 'Advocate'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Role: <span className="badge badge-success">{user?.role || 'PATIENT'}</span> | Statutory Audit Dashboard
            </p>
          </div>
        </div>

        {/* Upload Bill Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Upload Medical Invoices & Summaries
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Supports Itemized Bills, Discharge Summaries, and Pharmacy Invoices (PDF, PNG, JPG).
          </p>

          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            />
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="btn btn-primary"
            >
              {isUploading ? 'Processing OCR & Audit...' : 'Audit Document'}
            </button>
          </form>

          {uploadStatus && (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Recent Audits Table */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Audited Bills & Forensic Ledgers
          </h2>

          {isLoading ? (
            <LoadingState message="Loading bills ledger..." />
          ) : bills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No bills audited yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Upload an invoice to run NPPA, DPCO, and CGHS compliance verification.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Bill ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Hospital</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Total Billed</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Overcharge Tally</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Risk Score</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{bill.id.substring(0, 8)}...</td>
                      <td style={{ padding: '1rem' }}>{bill.hospital_name || 'Apollo / Max Healthcare'}</td>
                      <td style={{ padding: '1rem' }}>₹{bill.total_billed.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem', color: 'var(--accent-danger)', fontWeight: 600 }}>
                        ₹{bill.total_overcharge.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${bill.risk_score > 50 ? 'badge-danger' : 'badge-success'}`}>
                          {bill.risk_score}/100
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-warning">{bill.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
