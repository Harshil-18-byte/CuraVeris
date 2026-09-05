"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { UploadCloud, Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { api } from "@/lib/api";

export default function BillsListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "overcharge">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: billsData, isLoading, isError, error, refetch } = useQuery({
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

  const allBills = billsData?.items || [];
  const filteredBills = searchQuery.trim()
    ? allBills.filter(
        (b) =>
          b.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.file_name_original?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBills;

  const total = billsData?.total ?? 0;
  const startCount = total === 0 ? 0 : (page - 1) * 20 + 1;
  const endCount = Math.min(page * 20, total);

  const statusChips = [
    { label: "All Bills", value: "all" },
    { label: "Completed", value: "COMPLETED" },
    { label: "In Progress", value: "AUDITING" },
    { label: "Queued", value: "QUEUED" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <PageShell
      title="Your Bills"
      description="View all the bills you've uploaded and check your results."
      action={
        <Link href="/bills/upload">
          <button
            type="button"
            className="h-10 px-5 bg-[#202128] hover:bg-black text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" strokeWidth={2} />
            <span>Check a Bill</span>
          </button>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Controls: Search + Status Filter Chips + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606470]"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search by hospital name or filename…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white text-xs text-[#202128] placeholder:text-[#606470] rounded-full border border-black/[0.08] outline-none focus:border-[#43A8B2] shadow-xs transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#606470] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 px-4 bg-white text-xs font-semibold text-[#202128] rounded-full border border-black/[0.08] outline-none focus:border-[#43A8B2] shadow-xs cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="overcharge">Highest Overcharge</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusChips.map((chip) => {
            const active = statusFilter === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => {
                  setStatusFilter(chip.value);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-[#202128] text-white shadow-xs"
                    : "bg-white border border-black/[0.08] text-[#606470] hover:text-[#202128] hover:border-black/[0.15]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Bills Table Component */}
        <BillTable
          bills={filteredBills}
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as any)?.message}
          onRetry={() => refetch()}
          emptyTitle={
            searchQuery
              ? "No matching bills found"
              : statusFilter !== "all"
              ? "No bills with this status"
              : "No bills yet"
          }
          emptyDescription={
            searchQuery
              ? "Try searching for a different hospital name or clear your search."
              : statusFilter !== "all"
              ? "Try changing your status filter above."
              : "Upload your first medical bill to get started."
          }
        />

        {/* Pagination Controls */}
        {total > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] text-xs text-[#606470]">
            <span>
              Showing {startCount}–{endCount} of {total} bills
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={page * 20 >= total || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
