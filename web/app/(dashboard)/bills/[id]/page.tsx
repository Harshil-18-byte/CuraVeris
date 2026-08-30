"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { ProcessingTracker } from "@/components/bills/ProcessingTracker";
import { useBillStatusSocket } from "@/hooks/useBillStatusSocket";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProcessingStatus } from "@/types";

export default function BillDetailPage() {
  const params = useParams();
  const billId = params.id as string;

  const { data: bill, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.bills.getById(billId),
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      return status === "COMPLETED" || status === "FAILED" ? false : 15000;
    },
  });

  const { status: wsStatus, isConnected, isPolling } = useBillStatusSocket(
    billId,
    bill?.processing_status
  );

  const effectiveStatus: ProcessingStatus = isConnected
    ? wsStatus
    : (bill?.processing_status || "QUEUED");

  if (isLoading) {
    return (
      <PageShell
        title={<SkeletonText width="md" className="h-8" />}
        description="Retrieving invoice details and statutory validation progress…"
      >
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (isError || !bill) {
    const is404 = (error as any)?.status === 404;
    return (
      <PageShell
        title={is404 ? "Bill Not Found" : "Error Loading Invoice"}
        description="Could not load details for this invoice."
        action={
          <Link href="/bills">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to My Bills
            </Button>
          </Link>
        }
      >
        <Card padding="lg" className="text-center py-12">
          {is404 ? (
            <div>
              <h2 className="font-heading font-bold text-lg text-neutral-900">
                Invoice Record Not Found
              </h2>
              <p className="text-xs text-neutral-600 mt-1 mb-6">
                The requested invoice does not exist or you do not have permission to view it.
              </p>
              <Link href="/bills">
                <Button size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to My Bills
                </Button>
              </Link>
            </div>
          ) : (
            <InlineError
              title="Could not load bill details"
              message={(error as any)?.message || "Failed to communicate with server."}
              onRetry={() => refetch()}
            />
          )}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={bill.hospital_name || "Extracting Hospital Information…"}
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
            {bill.hospital_name || "—"}
          </p>
          <span className="text-xs text-neutral-600 font-mono mt-0.5 block truncate">
            {bill.file_name_original}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
            Admission & Stay
          </span>
          <p className="font-medium text-sm text-neutral-900 mt-1">
            {bill.admission_date
              ? `${formatDate(bill.admission_date)}${bill.discharge_date ? ` – ${formatDate(bill.discharge_date)}` : ""}`
              : "—"}
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
            <Badge variant={getStatusBadgeVariant(effectiveStatus)}>
              {effectiveStatus}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Live Processing Pipeline Tracker */}
      <ProcessingTracker
        billId={bill.id}
        initialStatus={effectiveStatus}
        failureReason={bill.failure_reason}
      />
    </PageShell>
  );
}
