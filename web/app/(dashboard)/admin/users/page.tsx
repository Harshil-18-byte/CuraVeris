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
      <div className="w-full overflow-x-auto bg-gradient-to-b from-[#111520]/90 to-[#0A0D14]/95 rounded-3xl shadow-2xl border border-white/[0.08] backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="py-4 px-6">Full Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs font-body">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.03] transition-colors duration-150">
                <td className="py-4 px-6 font-semibold text-white">{u.full_name}</td>
                <td className="py-4 px-6 text-neutral-400 font-mono">{u.email}</td>
                <td className="py-4 px-6">
                  <Badge variant={u.role === "admin" ? "brand" : "default"}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <Badge variant={u.is_active ? "success" : "danger"}>
                    {u.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-xs text-neutral-400 font-mono">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
