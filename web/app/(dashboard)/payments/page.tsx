"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, IndianRupee, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiClient } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["payments", "list"],
    queryFn: () => apiClient.get("/payments").then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const payments = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <PageShell
      title="Payments & Escrow Transactions"
      description="Record of legal dispute retainers, Section 65B certifications, and hospital settlement disbursements."
    >
      {isError ? (
        <InlineError
          title="Could not load payment records"
          message={(error as any)?.message ?? "An error occurred fetching payments."}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="w-full overflow-x-auto bg-gradient-to-b from-[#111520]/90 to-[#0A0D14]/95 rounded-3xl shadow-2xl border border-white/[0.08] backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <th className="py-4 px-6">Transaction / Order ID</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs font-body">
              {isLoading ? (
                <>
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                  <SkeletonRow columns={5} />
                </>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={CreditCard}
                      title="No payment history yet"
                      description="When you generate court-certified documents or process hospital dispute retainers, transactions will appear here."
                    />
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors duration-150">
                    <td className="py-4 px-6 font-mono text-cyan-400">{p.order_id || p.id}</td>
                    <td className="py-4 px-6 text-white font-medium">{p.description || "Statutory Audit Processing"}</td>
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {formatCurrency(p.amount_inr || p.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={p.status === "PAID" || p.status === "SUCCESS" ? "success" : "warning"}>
                        {p.status || "COMPLETED"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-neutral-400 font-mono">
                      {formatDate(p.created_at)}
                    </td>
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
