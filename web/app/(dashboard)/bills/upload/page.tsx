"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, ArrowRight, AlertTriangle, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadZone } from "@/components/bills/UploadZone";
import { api } from "@/lib/api";

export default function UploadBillPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [approxAmount, setApproxAmount] = useState("");
  const [insuranceType, setInsuranceType] = useState("Self");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateBillId, setDuplicateBillId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setDuplicateBillId(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (hospitalName) formData.append("hospital_name", hospitalName);
    if (approxAmount) formData.append("estimated_amount", approxAmount);
    if (insuranceType) formData.append("insurance_type", insuranceType);

    try {
      const res = await api.bills.upload(formData, (prog) => {
        setUploadProgress(prog);
      });
      router.push(`/bills/${res.bill_id}`);
    } catch (err: any) {
      setUploadProgress(null);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 409 && detail?.existing_bill_id) {
        setDuplicateBillId(detail.existing_bill_id);
      } else if (status === 413) {
        setErrorMsg("File too large. Maximum supported document size is 50MB.");
      } else if (status === 422) {
        setErrorMsg("Unsupported file type. Please upload a PDF, PNG, JPEG, or TIFF document.");
      } else {
        setErrorMsg(detail?.message || "Failed to upload document. Please check your connection and retry.");
      }
    }
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
              placeholder="e.g. Apollo Multispeciality, Max Super Speciality"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Approximate Total Bill Amount"
                placeholder="150000"
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
          disabled={!selectedFile || uploadProgress !== null}
          onClick={handleUpload}
        >
          {uploadProgress !== null ? (
            <span>Uploading & Enqueuing Pipeline… {uploadProgress}%</span>
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
