import React from "react";
import Link from "next/link";
import { ArrowRight, UploadCloud, FileText } from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BillSummary } from "@/types";

interface BillTableProps {
  bills: BillSummary[];
  isLoading?: boolean;
}

export const BillTable: React.FC<BillTableProps> = ({ bills, isLoading }) => {
  if (bills.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-card shadow-card border border-neutral-300 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-300 flex items-center justify-center text-neutral-300 mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-lg text-neutral-900">
          No bills uploaded yet
        </h3>
        <p className="text-sm text-neutral-600 max-w-sm mt-1 mb-6">
          Upload your first hospital bill (PDF or image) to run automated statutory and AI auditing.
        </p>
        <Link href="/bills/upload">
          <Button size="md">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Medical Bill
          </Button>
        </Link>
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
          {bills.map((b) => {
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
          })}
        </tbody>
      </table>
    </div>
  );
};
