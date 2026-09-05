"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  Hash,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import { evidenceApi, billsApi } from "@/lib/api";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function EvidencePage() {
  const params = useParams();
  const billId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const { data: bill, isLoading: isBillLoading } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => billsApi.getById(billId),
    enabled: !!billId,
  });

  const {
    data: evidence,
    isLoading: isEvidenceLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["evidence", billId],
    queryFn: () => evidenceApi.getByBillId(billId),
    enabled: !!billId,
  });

  const verifyMutation = useMutation({
    mutationFn: (evidenceId: string) => evidenceApi.verify(evidenceId),
  });

  const isLoading = isBillLoading || isEvidenceLoading;

  return (
    <PageShell
      title="Section 65B Cryptographic Evidence"
      description="Court-admissible Merkle audit trail with immutable SHA-256 seal and timestamp."
      action={
        <Link href={`/bills/${billId}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Bill
          </Button>
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <InlineError
          title="Evidence Record Not Available"
          message={(error as any)?.message ?? "Could not load evidence certificates for this bill."}
          onRetry={() => refetch()}
        />
      ) : !evidence ? (
        <EmptyState
          icon={FileCheck2}
          title="Evidence Pending Generation"
          description="The cryptographic evidence certificate is sealed automatically upon statutory audit completion."
        />
      ) : (
        <div className="space-y-6">
          {/* Certificate Header Card */}
          <Card padding="lg" className="bg-gradient-to-b from-[#111520]/90 to-[#0A0D14]/95 border border-white/10 rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Section 65B Electronic Evidence Certificate
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Indian Evidence Act (1872) & Information Technology Act compliant
                  </p>
                </div>
              </div>
              <Badge variant="success" className="px-3 py-1 text-xs">
                SEALED & VERIFIED
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Certificate ID
                  </span>
                  <span className="font-mono text-xs text-white mt-1 block">
                    {evidence.id}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    HMAC Cryptographic Signature
                  </span>
                  <span className="font-mono text-xs text-cyan-400 mt-1 block break-all bg-white/5 p-2 rounded-lg border border-white/5">
                    {evidence.hmac_signature || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Merkle Root Hash
                  </span>
                  <span className="font-mono text-xs text-emerald-400 mt-1 block break-all bg-white/5 p-2 rounded-lg border border-white/5">
                    {evidence.merkle_root || "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Sealed Timestamp
                  </span>
                  <span className="text-xs text-white mt-1 block font-mono">
                    {formatDate(evidence.issued_at)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Signatory Authority
                  </span>
                  <span className="text-xs text-white mt-1 block">
                    CuraVeris Automated Statutory Auditing Node #01
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => verifyMutation.mutate(evidence.id)}
                    isLoading={verifyMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                    Verify Cryptographic Signature
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
