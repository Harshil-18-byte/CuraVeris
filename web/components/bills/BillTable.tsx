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
      <div className="bg-white rounded-lg border border-border-subtle p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" strokeWidth={1.5} />
        <p className="font-semibold text-sm text-text-primary">Could not load your bills</p>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          {errorMessage || "Please check your connection and try again."}
        </p>
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!isLoading && bills.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border-subtle p-12 text-center space-y-3">
        <FileStack className="w-10 h-10 text-border-default mx-auto" strokeWidth={1.5} />
        <h3 className="font-heading font-semibold text-base text-text-primary mt-3">
          {emptyTitle}
        </h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto font-normal">
          {emptyDescription}
        </p>
        <div className="pt-2">
          <Link href="/bills/upload">
            <Button variant="primary" size="md">
              Check a Bill
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. DESKTOP TABLE VIEW (≥ 768px) */}
      <div className="hidden md:block bg-white rounded-lg border border-border-subtle shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary border-b border-border-subtle text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <th className="py-3 px-4">Hospital / Clinic</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Bill Total</th>
              <th className="py-3 px-4 text-right">Possible Extra Charges</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-sm">
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
                    className="hover:bg-bg-secondary transition-colors duration-100"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-text-primary truncate max-w-[220px]">
                        {b.hospital_name || "Hospital Bill"}
                      </div>
                      <div className="text-xs text-text-tertiary truncate max-w-[200px]">
                        {b.file_name_original}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap text-xs">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-text-primary whitespace-nowrap">
                      {formatCurrency(b.total_billed_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold whitespace-nowrap">
                      {hasOvercharge ? (
                        <span className="text-danger">{formatCurrency(b.total_overcharge)}</span>
                      ) : (
                        <span className="text-text-tertiary font-mono">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/bills/${b.id}`}
                        className="text-brand-accent font-medium hover:underline inline-flex items-center gap-1 text-xs"
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
                <div className="bg-white rounded-lg border border-border-subtle p-4 shadow-xs space-y-3 active:scale-[0.99] transition-transform">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-text-primary">
                        {b.hospital_name || "Hospital Bill"}
                      </h4>
                      <p className="text-xs text-text-tertiary mt-0.5">{formatDate(b.created_at)}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(b.processing_status)}>
                      {getStatusText(b.processing_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                    <div>
                      <span className="text-text-tertiary block">Total Bill</span>
                      <span className="font-mono font-medium text-text-primary">
                        {formatCurrency(b.total_billed_amount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-text-tertiary block">Extra Charges</span>
                      <span className={`font-mono font-semibold ${hasOvercharge ? "text-danger" : "text-text-tertiary"}`}>
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
