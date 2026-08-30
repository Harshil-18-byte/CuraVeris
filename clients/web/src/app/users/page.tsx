'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const currentUser: any = await apiClient('/api/v1/users/me');
        if (currentUser) {
          setUsers([
            {
              id: currentUser.id || 'USR-01',
              name: currentUser.full_name || 'Active User',
              email: currentUser.email || '',
              role: currentUser.role || 'Patient',
              status: currentUser.is_active ? 'ACTIVE' : 'INACTIVE',
            },
          ]);
        }
      } catch {
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

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
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-neutral-600)' }}>
                  Loading authorized users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-neutral-600)' }}>
                  No additional organization users configured yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="text-mono" style={{ fontWeight: 600 }}>{u.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{u.name}</td>
                  <td style={{ color: 'var(--color-neutral-600)' }}>{u.email}</td>
                  <td><span className="badge badge-completed">{u.role}</span></td>
                  <td><span className="badge badge-completed">{u.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
