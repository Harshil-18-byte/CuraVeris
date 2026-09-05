"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users as UsersIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import apiClient from "@/lib/api";

export default function AdminUsersPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get("/admin/users").then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <PageShell
      title={`User Directory (${total})`}
      description="Registered patients and administrators with active DPDP records."
    >
      {isError ? (
        <InlineError
          title="Could not load users"
          message={(error as any)?.message ?? "An error occurred fetching user records."}
          onRetry={() => refetch()}
        />
      ) : (
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
              {isLoading ? (
                <>
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={UsersIcon}
                      title="No registered users"
                      description="There are currently no patient or admin accounts in the database."
                    />
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}

