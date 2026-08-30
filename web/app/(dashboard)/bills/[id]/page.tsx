"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Calendar, FileText, Download, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProcessingTracker } from "@/components/bills/ProcessingTracker";
import { useBillDetail } from "@/hooks/useBills";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BillDetailPage() {
  const params = useParams();
  const billId = params.id as string;
  const { data: bill, isLoading, error } = useBillDetail(billId);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-600">Loading invoice details…</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <Card padding="lg" className="text-center py-12">
        <h2 className="font-heading font-bold text-lg text-neutral-900">
          Invoice Record Not Found
        </h2>
        <p className="text-xs text-neutral-600 mt-1 mb-6">
          The requested invoice does not exist or you do not have permission to view it.
        </p>
        <Link href="/bills">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to My Bills
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <PageShell
      title={bill.hospital_name || "Hospital Invoice"}
      description={`Reference: #${bill.reference_number || bill.id.slice(0, 8)} · Submitted on ${formatDate(bill.created_at)}`}
      action={
        <div className="flex items-center gap-3">
          <Link href="/bills">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              All Bills
            </Button>
          </Link>
          {bill.file_url && (
            <a href={bill.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Original Document
              </Button>
            </a>
          )}
        </div>
      }
    >
      {/* Bill Overview Header Card */}
      <Card padding="lg" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Hospital Facility
          </span>
          <p className="font-heading font-bold text-lg text-neutral-900 mt-1">
            {bill.hospital_name || "Hospital Billing Dept"}
          </p>
          <span className="text-xs text-neutral-600 font-mono mt-0.5 block">
            {bill.file_name_original}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Admission & Stay
          </span>
          <p className="font-medium text-sm text-neutral-900 mt-1">
            {bill.admission_date ? formatDate(bill.admission_date) : "Outpatient / Day Care"}
            {bill.discharge_date ? ` – ${formatDate(bill.discharge_date)}` : ""}
          </p>
          <span className="text-xs text-neutral-600 mt-0.5 block">
            Scheme: {bill.insurance_type || "Self Pay"}
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Gross Billed Amount
          </span>
          <p className="font-mono font-bold text-2xl text-neutral-900 mt-1">
            {formatCurrency(bill.total_billed_amount)}
          </p>
          <div className="mt-1 sm:justify-end flex">
            <Badge variant={getStatusBadgeVariant(bill.processing_status)}>
              {bill.processing_status}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Live Processing Pipeline Tracker */}
      <ProcessingTracker
        billId={bill.id}
        initialStatus={bill.processing_status}
        failureReason={bill.failure_reason}
      />
    </PageShell>
  );
}
