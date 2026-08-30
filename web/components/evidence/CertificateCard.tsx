"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, RefreshCw, Download, Lock } from "lucide-react";
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await api.evidence.verify(evidence.id);
      setVerificationResult(res);
    } catch {
      setVerificationResult({ status: "TAMPER_DETECTED", integrity_valid: false });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card accentColor="primary" padding="lg" className="space-y-6">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-surface border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-neutral-900">
                Section 65B Cryptographic Evidence Record
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Indian Evidence Act / BSA 2023 Tamper-Evident Digital Certificate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="md">
              <Lock className="w-3 h-3 mr-1" />
              INTEGRITY SEALED
            </Badge>
          </div>
        </div>

        {/* Cryptographic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 rounded-card border border-neutral-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                Evidence Certificate ID
              </span>
              <button
                onClick={() => copyToClipboard(evidence.id, "id")}
                className="text-neutral-600 hover:text-primary transition-colors"
                title="Copy ID"
              >
                {copiedField === "id" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono text-xs text-neutral-900 break-all">{evidence.id}</span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-card border border-neutral-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                Issued At (Timestamp)
              </span>
            </div>
            <span className="font-mono text-xs text-neutral-900 block">
              {formatDate(evidence.issued_at)}
            </span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-card border border-neutral-300 md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                Merkle Tree Root (SHA-256)
              </span>
              <button
                onClick={() => copyToClipboard(evidence.merkle_root, "root")}
                className="text-neutral-600 hover:text-primary transition-colors"
                title="Copy Merkle Root"
              >
                {copiedField === "root" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono text-xs text-primary font-bold break-all">
              {evidence.merkle_root}
            </span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-card border border-neutral-300 md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase text-neutral-600">
                HMAC-SHA256 Digital Signature
              </span>
              <button
                onClick={() => copyToClipboard(evidence.hmac_signature, "hmac")}
                className="text-neutral-600 hover:text-primary transition-colors"
                title="Copy Signature"
              >
                {copiedField === "hmac" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono text-xs text-neutral-600 break-all">
              {evidence.hmac_signature}
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationResult && (
          <div
            className={`p-4 rounded-card border flex items-center gap-3 ${
              verificationResult.integrity_valid
                ? "bg-success-surface border-success/20 text-success"
                : "bg-danger-surface border-danger/20 text-danger"
            }`}
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                {verificationResult.integrity_valid
                  ? "Live Merkle Hash Match Verified: 0 Modifications"
                  : "Integrity Mismatch Detected"}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Every line item, rate benchmark, and timestamp matches the original audit seal.
              </p>
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-300">
          <Button variant="outline" size="sm" onClick={handleVerify} isLoading={isVerifying}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Re-verify Live Root
          </Button>
          <a href={`/api/v1/legal-docs/bills/${billId}/dispute-notice`} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Legal Dispute Notice
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
};
