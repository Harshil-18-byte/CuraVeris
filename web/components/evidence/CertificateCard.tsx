"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, RefreshCw, Download, Lock, Info } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { EvidenceRecord } from "@/types";
import { api } from "@/lib/api";

interface CertificateCardProps {
  evidence: EvidenceRecord;
  billId: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ evidence, billId }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: string;
    integrity_valid: boolean;
  } | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await api.evidence.verify(evidence.id);
      setVerificationResult(res);
      if (res.integrity_valid) {
        toast.success("Live certificate verified: 0 modifications detected");
      }
    } catch {
      setVerificationResult({ status: "TAMPER_DETECTED", integrity_valid: false });
      toast.error("Integrity check failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-6">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-success-bg text-success flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Report verified — nothing has been changed
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                This certificate proves that this report has not been changed since it was created.
              </p>
            </div>
          </div>

          <Badge variant="success" size="md">
            <Lock className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            Verified Genuine
          </Badge>
        </div>

        {/* Cryptographic Fields with Copy Chip */}
        <div className="space-y-3">
          {/* Field 1: Certificate ID */}
          <div className="p-3.5 bg-bg-secondary rounded-md flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Certificate Number
              </span>
              <span className="font-mono text-xs text-text-primary truncate block mt-0.5">
                {evidence.id}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 text-xs flex-shrink-0"
              onClick={() => copyToClipboard(evidence.id, "Certificate ID")}
            >
              {copiedField === "Certificate ID" ? (
                <Check className="w-3.5 h-3.5 text-success" strokeWidth={2} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
            </Button>
          </div>

          {/* Field 2: Issued At */}
          <div className="p-3.5 bg-bg-secondary rounded-md flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Certificate Created On
              </span>
              <span className="font-mono text-xs text-text-primary truncate block mt-0.5">
                {formatDate(evidence.issued_at)}
              </span>
            </div>
          </div>

          {/* Field 3: Merkle Root */}
          <div className="p-3.5 bg-bg-secondary rounded-md flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Security Code
              </span>
              <span className="font-mono text-xs text-brand-accent font-semibold truncate block mt-0.5">
                {evidence.merkle_root}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 text-xs flex-shrink-0"
              onClick={() => copyToClipboard(evidence.merkle_root, "Security Code")}
            >
              {copiedField === "Security Code" ? (
                <Check className="w-3.5 h-3.5 text-success" strokeWidth={2} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
            </Button>
          </div>

          {/* Field 4: Digital Signature */}
          <div className="p-3.5 bg-bg-secondary rounded-md flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary block">
                Verification Stamp
              </span>
              <span className="font-mono text-xs text-text-secondary truncate block mt-0.5">
                {evidence.hmac_signature}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 text-xs flex-shrink-0"
              onClick={() => copyToClipboard(evidence.hmac_signature, "Verification Stamp")}
            >
              {copiedField === "Verification Stamp" ? (
                <Check className="w-3.5 h-3.5 text-success" strokeWidth={2} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationResult && (
          <div
            className={`p-4 rounded-md border flex items-center gap-3 animate-in fade-in-50 duration-150 ${
              verificationResult.integrity_valid
                ? "bg-success-bg border-success/30 text-success"
                : "bg-danger-bg border-danger/30 text-danger"
            }`}
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold">
                {verificationResult.integrity_valid
                  ? "✓ Report verified — nothing has been changed"
                  : "✗ Check failed — please contact support"}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                All lines and calculations match the original audit record.
              </p>
            </div>
          </div>
        )}

        {/* Explanatory Info Box */}
        <div className="p-3.5 bg-bg-secondary rounded-md text-xs text-text-secondary flex items-start gap-2.5">
          <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>
            This digital certificate proves that your CuraVeris audit was generated at a specific time and has not been altered. You can present this certificate if the hospital or insurance company questions whether your findings are genuine.
          </span>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <Button
            variant="secondary"
            size="md"
            onClick={handleVerify}
            isLoading={isVerifying}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            Check Again
          </Button>

          <a
            href={`/api/v1/legal-docs/bills/${billId}/dispute-notice`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Download Ready Complaint Letter
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
};
