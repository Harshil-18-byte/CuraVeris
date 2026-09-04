"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
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

  const { status: wsStatus, isConnected } = useBillStatusSocket(
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
        description="Retrieving bill details and checking progress…"
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
        title={is404 ? "Bill Not Found" : "Could not load bill"}
        description="Could not load details for this bill."
        action={
          <Link href="/bills">
            <Button variant="secondary" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              Back to Your Bills
            </Button>
          </Link>
        }
      >
        <Card padding="lg" className="text-center py-12 bg-white border border-black/[0.06] shadow-sm">
          {is404 ? (
            <div className="space-y-3 max-w-sm mx-auto">
              <h2 className="font-heading font-bold text-lg text-[#202128]">
                Bill not found
              </h2>
              <p className="text-xs text-[#606470]">
                The requested bill does not exist or you do not have permission to view it.
              </p>
              <div className="pt-3">
                <Link href="/bills">
                  <Button size="sm" variant="primary" className="rounded-full bg-[#202128] hover:bg-black text-white">
                    <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                    Back to Your Bills
                  </Button>
                </Link>
              </div>
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
      case "QUEUED":
      default:
        return "In queue";
    }
  };

  return (
    <PageShell
      title={bill.hospital_name || "Hospital Bill"}
      description={`Reference #${bill.reference_number || bill.id.slice(0, 8)} · Submitted on ${formatDate(bill.created_at)}`}
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/bills">
            <Button variant="secondary" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              All Bills
            </Button>
          </Link>
          {bill.file_url && (
            <a href={bill.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm" className="rounded-full">
                <ExternalLink className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                Original Document
              </Button>
            </a>
          )}
        </div>
      }
    >
      {/* Bill Overview Header Card */}
      <Card padding="md" className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider block">
            Hospital or Clinic
          </span>
          <p className="font-heading font-bold text-lg text-[#202128] mt-1">
            {bill.hospital_name || "—"}
          </p>
          <span className="text-xs text-[#606470] mt-0.5 block truncate font-mono">
            {bill.file_name_original}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider block">
            Hospital Stay
          </span>
          <p className="font-semibold text-sm text-[#202128] mt-1">
            {bill.admission_date
              ? `${formatDate(bill.admission_date)}${bill.discharge_date ? ` – ${formatDate(bill.discharge_date)}` : ""}`
              : "—"}
          </p>
          <span className="text-xs text-[#606470] mt-0.5 block font-medium">
            Payment: {bill.insurance_type || "Self Pay"}
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-[11px] font-bold text-[#606470] uppercase tracking-wider block">
            Total on Your Bill
          </span>
          <p className="font-mono font-bold text-2xl text-[#202128] mt-1">
            {formatCurrency(bill.total_billed_amount)}
          </p>
          <div className="mt-1 sm:justify-end flex">
            <Badge variant={getStatusBadgeVariant(effectiveStatus)}>
              {getStatusText(effectiveStatus)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Live Processing Pipeline Tracker */}
      <ProcessingTracker
        billId={bill.id}
        initialStatus={effectiveStatus}
        failureReason={bill.failure_reason}
        onRetry={() => refetch()}
      />
    </PageShell>
  );
}
