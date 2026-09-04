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
  const [searchQuery, setSearchQuery] = useState("");

  const { data: billsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bills", "list", page],
    queryFn: () => api.bills.list({ page, per_page: 15 }),
    staleTime: 30 * 1000,
  });

  const allBills = billsData?.items || [];
  const filteredBills = searchQuery.trim()
    ? allBills.filter(
        (b) =>
          b.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.file_name_original?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBills;

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
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
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
        </div>

        {/* Bills Table Component */}
        <BillTable
          bills={filteredBills}
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as any)?.message}
          onRetry={() => refetch()}
          emptyTitle={searchQuery ? "No matching bills found" : "No bills checked yet"}
          emptyDescription={
            searchQuery
              ? "Try searching for a different hospital name or clear your search."
              : "Upload your hospital bill to see if you were charged more than government limits."
          }
        />

        {/* Pagination Controls */}
        {billsData && billsData.total > 15 && (
          <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] text-xs text-[#606470]">
            <span>
              Showing {filteredBills.length} of {billsData.total} bills
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={page * 15 >= billsData.total}
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
