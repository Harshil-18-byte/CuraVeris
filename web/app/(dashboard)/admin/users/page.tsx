"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await apiClient.get("/admin/users");
        setUsers(res.data.items);
        setTotal(res.data.total);
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <PageShell
      title={`User Directory (${total})`}
      description="Registered patients and administrators with active DPDP records."
    >
      <div className="w-full overflow-x-auto bg-white rounded-card shadow-card border border-neutral-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <th className="py-3.5 px-4">Full Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300 text-sm font-body">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="py-3.5 px-4 font-semibold text-neutral-900">{u.full_name}</td>
                <td className="py-3.5 px-4 text-neutral-600">{u.email}</td>
                <td className="py-3.5 px-4">
                  <Badge variant={u.role === "admin" ? "brand" : "default"}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={u.is_active ? "success" : "danger"}>
                    {u.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-xs text-neutral-600">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
