"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileStack, AlertCircle } from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonRow, SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BillSummary } from "@/types";

interface BillTableProps {
  bills: BillSummary[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const BillTable: React.FC<BillTableProps> = ({
  bills,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = "You haven't uploaded any bills yet",
  emptyDescription = "Take a photo of your hospital bill and we'll check it for overcharges.",
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Check complete";
      case "PROCESSING":
      case "AUDITING":
        return "Checking prices";
      case "EXTRACTING":
        return "Reading bill";
      case "FAILED":
        return "Needs re-upload";
      case "RETRYING":
        return "Trying again";
      case "QUEUED":
      default:
        return "In queue";
    }
  };

  if (isError) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.06] p-8 text-center space-y-3 shadow-xs">
        <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" strokeWidth={1.5} />
        <p className="font-bold text-sm text-[#202128]">Could not load your bills</p>
        <p className="text-xs text-[#606470] max-w-sm mx-auto">
          {errorMessage || "Please check your connection and try again."}
        </p>
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry} className="rounded-full">
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!isLoading && bills.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.06] p-12 text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="w-12 h-12 rounded-full bg-[#EDF0FB] flex items-center justify-center text-[#202128] mx-auto">
          <FileStack className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-[#202128]">
            {emptyTitle}
          </h3>
          <p className="text-xs text-[#606470] max-w-sm mx-auto mt-1">
            {emptyDescription}
          </p>
        </div>
        <div className="pt-2">
          <Link href="/bills/upload">
            <button
              type="button"
              className="bg-[#202128] hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition-all hover:scale-[1.02]"
            >
              Check a Bill
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. DESKTOP TABLE VIEW (≥ 768px) */}
      <div className="hidden md:block bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F7FB] border-b border-black/[0.06] text-[11px] font-bold uppercase tracking-wider text-[#606470]">
              <th className="py-3.5 px-6">Hospital / Clinic</th>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6 text-right">Bill Total</th>
              <th className="py-3.5 px-6 text-right">Possible Overcharge</th>
              <th className="py-3.5 px-6 text-center">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {isLoading ? (
              <>
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
              </>
            ) : (
              bills.map((b) => {
                const hasOvercharge = (b.total_overcharge || 0) > 0;
                return (
                  <tr
                    key={b.id}
                    className="hover:bg-[#F5F7FB]/70 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#202128] truncate max-w-[220px]">
                        {b.hospital_name || "Hospital Bill"}
                      </div>
                      <div className="text-[11px] text-[#606470] truncate max-w-[200px] mt-0.5 font-mono">
                        {b.file_name_original}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#606470] whitespace-nowrap text-xs font-medium">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-[#202128] whitespace-nowrap">
                      {formatCurrency(b.total_billed_amount)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold whitespace-nowrap">
                      {hasOvercharge ? (
                        <span className="text-[#DC2626]">
                          {formatCurrency(b.total_overcharge)}
                        </span>
                      ) : (
                        <span className="text-[#606470] font-mono">₹0</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(b.processing_status)}
                        isPulsing={
                          b.processing_status === "AUDITING" ||
                          b.processing_status === "EXTRACTING"
                        }
                      >
                        {getStatusText(b.processing_status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/bills/${b.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDF0FB] text-[#202128] hover:bg-[#DBF1F4] font-bold text-xs transition-all duration-150"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE CARD LIST VIEW (< 768px) */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          bills.map((b) => {
            const hasOvercharge = (b.total_overcharge || 0) > 0;
            return (
              <Link key={b.id} href={`/bills/${b.id}`} className="block">
                <div className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-xs space-y-3 active:scale-[0.99] transition-transform">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#202128]">
                        {b.hospital_name || "Hospital Bill"}
                      </h4>
                      <p className="text-[11px] text-[#606470] mt-0.5 font-medium">{formatDate(b.created_at)}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(b.processing_status)}>
                      {getStatusText(b.processing_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] text-xs">
                    <div>
                      <span className="text-[#606470] block text-[11px] font-medium">Total Bill</span>
                      <span className="font-mono font-bold text-[#202128]">
                        {formatCurrency(b.total_billed_amount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[#606470] block text-[11px] font-medium">Extra Charges</span>
                      <span className={`font-mono font-bold ${hasOvercharge ? "text-[#DC2626]" : "text-[#606470]"}`}>
                        {hasOvercharge ? formatCurrency(b.total_overcharge) : "₹0"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
