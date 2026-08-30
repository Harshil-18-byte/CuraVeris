"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { useBills } from "@/hooks/useBills";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["ALL", "QUEUED", "AUDITING", "COMPLETED", "FAILED"];

export default function BillsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useBills({
    page,
    per_page: 15,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const bills = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <PageShell
      title="My Bills"
      description="Manage and review your submitted hospital billing statements."
      action={
        <Link href="/bills/upload">
          <Button size="md">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Bill
          </Button>
        </Link>
      }
    >
      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-badge transition-colors",
                statusFilter === st
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bill Table */}
      <BillTable bills={bills} isLoading={isLoading} />

      {/* Pagination Controls */}
      {total > 15 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-300">
          <span className="text-xs text-neutral-600">
            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total} bills
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
