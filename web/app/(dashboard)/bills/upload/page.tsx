"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud, ArrowRight, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadZone } from "@/components/bills/UploadZone";
import { api, AppError } from "@/lib/api";

export default function UploadBillPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [approxAmount, setApproxAmount] = useState("");
  const [insuranceType, setInsuranceType] = useState("Self");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateBillId, setDuplicateBillId] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.bills.upload(formData, (progress) => {
        setUploadProgress(progress);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.push(`/bills/${data.bill_id}`);
    },
    onError: (err: any) => {
      setUploadProgress(null);
      const code = err?.code;
      const status = err?.status || err?.response?.status;
      const detail = err?.message || err?.response?.data?.detail;

      if (code === "BILL_003" || status === 409) {
        const existingId = typeof detail === "object" ? detail?.existing_bill_id : null;
        if (existingId) {
          setDuplicateBillId(existingId);
        } else {
          setErrorMsg("This exact billing invoice was already uploaded.");
        }
      } else if (code === "BILL_001" || status === 413) {
        setErrorMsg("File exceeds 50MB limit.");
      } else if (code === "BILL_002" || status === 422) {
        setErrorMsg("Unsupported file format. Please upload PDF, PNG, or JPEG.");
      } else {
        setErrorMsg(typeof detail === "string" ? detail : "Failed to upload document. Please retry.");
      }
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setDuplicateBillId(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (hospitalName.trim()) formData.append("hospital_name", hospitalName.trim());
    if (approxAmount.trim()) formData.append("estimated_amount", approxAmount.trim());
    if (insuranceType) formData.append("insurance_type", insuranceType);

    uploadMutation.mutate(formData);
  };

  return (
    <PageShell
      title="Upload Medical Bill"
      description="Submit your hospitalization invoice to trigger automated statutory audit and Section 65B sealing."
      action={
        <Link href="/bills">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Bills
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Duplicate Warning Banner */}
        {duplicateBillId && (
          <div className="p-4 bg-warning-surface border border-warning/30 rounded-card flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 text-warning">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Duplicate Invoice Detected</p>
                <p className="text-xs mt-0.5">
                  You have already uploaded this exact billing document.
                </p>
              </div>
            </div>
            <Link href={`/bills/${duplicateBillId}`}>
              <Button size="sm">
                View Existing Audit →
              </Button>
            </Link>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <UploadZone
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          error={errorMsg}
        />

        {/* Optional Metadata Details Card */}
        <Card padding="lg" className="space-y-4">
          <h3 className="font-heading font-bold text-base text-neutral-900">
            Additional Hospital Details (Optional)
          </h3>
          <p className="text-xs text-neutral-600 font-body">
            Providing these details assists the OCR normalization pipeline in cross-referencing empanelment catalogs.
          </p>

          <div className="space-y-4 pt-2">
            <Input
              label="Hospital / Clinic Facility Name"
              placeholder="Enter hospital or clinic facility name"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Approximate Total Bill Amount"
                placeholder="Enter billed total amount"
                leftAddon={<span className="font-semibold text-neutral-600 text-xs">₹</span>}
                value={approxAmount}
                onChange={(e) => setApproxAmount(e.target.value)}
              />

              <div className="flex flex-col">
                <label className="font-medium text-sm text-neutral-900 mb-1">
                  Insurance / Coverage Scheme
                </label>
                <select
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-button text-sm text-neutral-900 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="Self">Self Pay / Out of Pocket</option>
                  <option value="CGHS">Central Government Health Scheme (CGHS)</option>
                  <option value="PMJAY">Ayushman Bharat PM-JAY</option>
                  <option value="IRDAI">Private TPA / Commercial Insurance</option>
                  <option value="Other">Other Government Health Scheme</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Upload Button with Live Progress State */}
        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold"
          disabled={!selectedFile || uploadMutation.isPending}
          onClick={handleUpload}
        >
          {uploadMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploadProgress !== null && uploadProgress < 100
                ? `Uploading… ${uploadProgress}%`
                : "Processing your bill…"}
            </span>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 mr-2" />
              Upload & Run Statutory Audit
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </PageShell>
  );
}
