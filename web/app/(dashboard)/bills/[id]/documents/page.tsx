"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  FileCheck2,
  Download,
  ArrowLeft,
  Sparkles,
  Scale,
  Building,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiClient, billsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LegalDocumentsPage({ params }: PageProps) {
  const { id: billId } = use(params);
  const queryClient = useQueryClient();
  const [selectedDocType, setSelectedDocType] = useState<string>("HOSPITAL_GRIEVANCE");

  const { data: bill } = useQuery({
    queryKey: ["bill", billId],
    queryFn: () => billsApi.getById(billId),
    enabled: !!billId,
  });

  const {
    data: documentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["legal-documents", billId],
    queryFn: () => apiClient.get(`/bills/${billId}/legal-documents`).then((r) => r.data),
    enabled: !!billId,
  });

  const generateMutation = useMutation({
    mutationFn: (docType: string) =>
      apiClient.post(`/bills/${billId}/legal-documents`, { document_type: docType }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["legal-documents", billId] });
    },
  });

  const documents = Array.isArray(documentsData) ? documentsData : documentsData?.items ?? [];

  const documentOptions = [
    {
      id: "HOSPITAL_GRIEVANCE",
      title: "Hospital Internal Grievance Notice",
      description: "Formal statutory overcharge notice to the hospital billing superintendent.",
      icon: Building,
    },
    {
      id: "CONSUMER_FORUM_COMPLAINT",
      title: "District Consumer Disputes Redressal Forum Notice",
      description: "Draft petition under Consumer Protection Act (2019) for unfair trade practices.",
      icon: Scale,
    },
    {
      id: "NPPA_COMPLAINT",
      title: "NPPA Price Cap Ceiling Violation Report",
      description: "Statutory report addressed to the National Pharmaceutical Pricing Authority.",
      icon: FileText,
    },
  ];

  return (
    <PageShell
      title="Legal Dispute & Complaint Documents"
      description="Pre-formatted, statutory notices ready for submission to hospitals and regulatory authorities."
      action={
        <Link href={`/bills/${billId}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Bill
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Document Generation Options */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Generate Formal Dispute Notice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documentOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedDocType === opt.id;
              return (
                <Card
                  key={opt.id}
                  padding="md"
                  onClick={() => setSelectedDocType(opt.id)}
                  className={`cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "hover:bg-white/[0.04] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-heading font-bold text-sm text-white">{opt.title}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">{opt.description}</p>
                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateMutation.mutate(opt.id);
                    }}
                    isLoading={generateMutation.isPending && selectedDocType === opt.id}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate Notice
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Existing Generated Documents List */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Available Documents ({documents.length})
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <InlineError
              title="Could not load legal documents"
              message={(error as any)?.message ?? "An error occurred."}
              onRetry={() => refetch()}
            />
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents generated yet"
              description="Select one of the notice types above to create your first customized legal dispute document."
            />
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <Card
                  key={doc.id}
                  padding="md"
                  className="flex items-center justify-between gap-4 bg-[#111520] border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-white">
                        {doc.title || doc.document_type}
                      </h4>
                      <span className="text-[11px] text-neutral-400 font-mono mt-0.5 block">
                        Generated on {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success">READY</Badge>
                    {doc.download_url && (
                      <a href={doc.download_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
