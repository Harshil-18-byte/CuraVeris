'use client';

import React from 'react';

const USERS = [
  { id: 'USR-01', name: 'Dr. Vikram Malhotra', email: 'malhotra@metrohospital.in', role: 'Hospital Admin', status: 'ACTIVE' },
  { id: 'USR-02', name: 'Arjun Mehta', email: 'arjun.mehta@curaveris.in', role: 'Lead Forensic Auditor', status: 'ACTIVE' },
  { id: 'USR-03', name: 'Priya Sharma', email: 'priya.s@metrohospital.in', role: 'Billing Operations', status: 'ACTIVE' },
  { id: 'USR-04', name: 'Kavita Rao', email: 'kavita.rao@starhealth.in', role: 'TPA Reviewer', status: 'ACTIVE' },
];

export default function UsersPage() {
  return (
    <div className="app-container" style={{ padding: '32px 0 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-queued" style={{ marginBottom: '6px' }}>ROLE-BASED ACCESS CONTROL</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            User & Organization RBAC
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            Manage permissions across Hospital Finance, Billing, Auditors, and Insurers.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Assigned RBAC Role</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id}>
                <td className="text-mono" style={{ fontWeight: 600 }}>{u.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{u.name}</td>
                <td style={{ color: 'var(--color-neutral-600)' }}>{u.email}</td>
                <td><span className="badge badge-completed">{u.role}</span></td>
                <td><span className="badge badge-completed">{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
