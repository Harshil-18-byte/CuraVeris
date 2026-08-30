'use client';

import React from 'react';

const MODELS = [
  {
    name: 'XGBoost Billing Risk Classifier',
    version: 'v2.1.0',
    dataset: 'IRDAI-NPPA-2026.4',
    accuracy: '96.4%',
    eceScore: '0.021 (Well Calibrated)',
    status: 'PRODUCTION_ACTIVE',
  },
  {
    name: 'Multi-Layer Perceptron (MLP) Outlier Detector',
    version: 'v1.8.2',
    dataset: 'IRDAI-NPPA-2026.4',
    accuracy: '94.8%',
    eceScore: '0.034 (Calibrated)',
    status: 'PRODUCTION_ACTIVE',
  },
  {
    name: 'LayoutLMv3 Invoice Structure Extractor',
    version: 'v3.0.1',
    dataset: 'Health-OCR-India-v2',
    accuracy: '98.7%',
    eceScore: '0.015 (Well Calibrated)',
    status: 'PRODUCTION_ACTIVE',
  },
];

export default function ModelCenterPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-completed" style={{ marginBottom: '6px' }}>ADMIN / ML TELEMETRY</span>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          ML Model Registry & Telemetry
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
          Inspect active inference weights, expected calibration error (ECE), and dataset lineage.
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Version</th>
              <th>Training Dataset</th>
              <th>Validation Accuracy</th>
              <th>Calibration (ECE)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.name}>
                <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{m.name}</td>
                <td className="text-mono">{m.version}</td>
                <td style={{ fontSize: '12px', color: 'var(--color-neutral-600)' }}>{m.dataset}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>{m.accuracy}</td>
                <td style={{ fontSize: '12px' }}>{m.eceScore}</td>
                <td><span className="badge badge-completed">{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
