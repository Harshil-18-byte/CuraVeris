"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FileStack, ShieldCheck, IndianRupee, FileText, UploadCloud, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";
import { BillTable } from "@/components/bills/BillTable";
import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useBills({ page: 1, per_page: 5 });

  const bills = data?.items || [];
  const totalBills = data?.total || 0;
  const completedAudits = bills.filter((b) => b.processing_status === "COMPLETED").length;
  const totalOvercharge = bills.reduce((sum, b) => sum + (b.total_overcharge || 0), 0);

  return (
    <PageShell
      title="Dashboard"
      description={`System Overview · ${format(new Date(), "dd MMMM yyyy")}`}
      action={
        <Link href="/bills/upload">
          <Button size="md">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Bill
          </Button>
        </Link>
      }
    >
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Bills Uploaded
                </span>
                <div className="w-9 h-9 rounded-lg bg-primary-surface text-primary flex items-center justify-center">
                  <FileStack className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {totalBills}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Total submitted invoices</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Audits Completed
                </span>
                <div className="w-9 h-9 rounded-lg bg-success-surface text-success flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {completedAudits}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Statutorily sealed records</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Overcharges Flagged
                </span>
                <div className="w-9 h-9 rounded-lg bg-danger-surface text-danger flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <p className="font-mono font-bold text-3xl text-danger mt-2">
                {formatCurrency(totalOvercharge)}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Confirmed excess fees</span>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Dispute Petitions
                </span>
                <div className="w-9 h-9 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
                {completedAudits}
              </p>
              <span className="text-xs text-neutral-600 block mt-1">Section 65B legal notices</span>
            </Card>
          </>
        )}
      </div>

      {/* Recent Bills Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-neutral-900">
            Recent Hospital Invoices
          </h2>
          {totalBills > 0 && (
            <Link
              href="/bills"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View All Bills ({totalBills})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <BillTable bills={bills} isLoading={isLoading} />
      </div>
    </PageShell>
  );
}
