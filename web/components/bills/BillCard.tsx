import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Calendar, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BillSummary } from "@/types";

interface BillCardProps {
  bill: BillSummary;
}

export const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const hasOvercharge = (bill.total_overcharge || 0) > 0;

  return (
    <Card
      variant={hasOvercharge ? "accent-left" : "interactive"}
      accentColor={hasOvercharge ? "danger" : undefined}
      className="hover:border-primary/40 transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-primary-surface border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-neutral-900 line-clamp-1">
              {bill.hospital_name || "Hospital Invoice"}
            </h3>
            <p className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(bill.created_at)}</span>
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(bill.processing_status)}>
          {bill.processing_status}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-y border-neutral-300">
        <div>
          <span className="text-xs text-neutral-600 block">Total Billed</span>
          <span className="font-mono text-sm font-bold text-neutral-900">
            {formatCurrency(bill.total_billed_amount)}
          </span>
        </div>
        <div>
          <span className="text-xs text-neutral-600 block">Overcharges Found</span>
          <span className="font-mono text-sm font-bold text-danger">
            {formatCurrency(bill.total_overcharge)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-600 truncate max-w-[140px]">
          {bill.file_name_original}
        </span>
        <Link
          href={`/bills/${bill.id}`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>View Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
