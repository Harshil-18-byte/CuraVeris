"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Queued", value: "QUEUED" },
  { label: "Auditing", value: "AUDITING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

export default function BillsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "overcharge">("newest");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bills", { page, statusFilter, sortBy }],
    queryFn: () =>
      api.bills.list({
        page,
        per_page: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort: sortBy,
      }),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const bills = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

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
      {/* Filter and Sort Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setStatusFilter(st.value);
                setPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-badge transition-colors whitespace-nowrap",
                statusFilter === st.value
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <label htmlFor="sortBySelect" className="font-medium">Sort by:</label>
          <select
            id="sortBySelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs text-neutral-900 focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="overcharge">Highest Overcharge</option>
          </select>
        </div>
      </div>

      {/* Bill Table */}
      <BillTable
        bills={bills}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as any)?.message}
        onRetry={() => refetch()}
        emptyTitle={statusFilter === "all" ? "No bills yet" : "No bills with this status"}
        emptyDescription={
          statusFilter === "all"
            ? "Upload your first hospital bill to get started."
            : `There are currently no bills matching the filter "${statusFilter}".`
        }
      />

      {/* Pagination Controls */}
      {total > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-300">
          <span className="text-xs text-neutral-600">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} bills
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
              disabled={page >= totalPages}
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
