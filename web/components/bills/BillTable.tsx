import React from "react";
import Link from "next/link";
import { ArrowRight, FileStack } from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineError } from "@/components/ui/InlineError";
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
  emptyTitle = "No bills yet",
  emptyDescription = "Upload your first medical bill to get started with automated statutory audits.",
}) => {
  if (isError) {
    return (
      <div className="bg-white rounded-card shadow-card border border-neutral-300 p-6">
        <InlineError
          title="Failed to load bills"
          message={errorMessage || "Unable to reach server to fetch invoice records."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!isLoading && bills.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card border border-neutral-300">
        <EmptyState
          icon={FileStack}
          title={emptyTitle}
          description={emptyDescription}
          action={{
            label: "Upload Bill",
            href: "/bills/upload",
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-card shadow-card border border-neutral-300">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <th className="py-3.5 px-4">Hospital / Facility</th>
            <th className="py-3.5 px-4">Date Uploaded</th>
            <th className="py-3.5 px-4 text-right">Billed Amount</th>
            <th className="py-3.5 px-4 text-right">Flagged Overcharge</th>
            <th className="py-3.5 px-4 text-center">Status</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300 text-sm font-body">
          {isLoading ? (
            <>
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
            </>
          ) : (
            bills.map((b) => {
              const hasOvercharge = (b.total_overcharge || 0) > 0;
              return (
                <tr
                  key={b.id}
                  className="hover:bg-neutral-50/80 transition-colors duration-150 cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="font-semibold text-neutral-900 line-clamp-1">
                      {b.hospital_name || "Hospital Invoice"}
                    </div>
                    <div className="text-xs text-neutral-600 truncate max-w-[200px]">
                      {b.file_name_original}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-600 whitespace-nowrap">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-medium text-neutral-900 whitespace-nowrap">
                    {formatCurrency(b.total_billed_amount)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-semibold whitespace-nowrap">
                    {hasOvercharge ? (
                      <span className="text-danger">{formatCurrency(b.total_overcharge)}</span>
                    ) : (
                      <span className="text-neutral-600">₹0</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(b.processing_status)}>
                      {b.processing_status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/bills/${b.id}`}
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
