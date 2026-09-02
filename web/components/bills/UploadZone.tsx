"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const uploadFormSchema = z.object({
  hospital_name: z.string().min(2, "Please enter the hospital name"),
  total_billed_amount: z.coerce
    .number()
    .min(1, "Please enter the total bill amount"),
  admission_date: z.string().optional(),
  discharge_date: z.string().optional(),
  insurance_type: z.string().default("Self Pay"),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export const UploadZone: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      insurance_type: "Self Pay",
    },
  });

  const handleFileChange = (file: File | null) => {
    setUploadError(null);
    if (!file) return;

    // Validate type
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a PDF document or an image (JPG, PNG, WEBP).");
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size allowed is 20MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!selectedFile) {
      setUploadError("Please select or drop your bill file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (data.hospital_name) formData.append("hospital_name", data.hospital_name);
      if (data.total_billed_amount) formData.append("total_billed_amount", data.total_billed_amount.toString());
      if (data.admission_date) formData.append("admission_date", data.admission_date);
      if (data.discharge_date) formData.append("discharge_date", data.discharge_date);
      if (data.insurance_type) formData.append("insurance_type", data.insurance_type);

      const res = await api.bills.upload(formData);
      toast.success("Bill uploaded! We are now checking the prices.");
      router.push(`/bills/${res.bill_id}`);
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.detail;
      setUploadError(
        typeof detail === "string" ? detail : "Failed to upload bill. Please try again."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Drag & Drop File Zone */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Upload Hospital Bill or Discharge Summary
          </label>

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
                isDragging
                  ? "border-brand-accent bg-brand-accent-light"
                  : "border-border-default hover:border-brand-accent bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              <div className="w-14 h-14 rounded-full bg-brand-accent-light text-brand-accent flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <h3 className="font-heading font-semibold text-base text-text-primary">
                Click to choose a file or drag it here
              </h3>
              <p className="text-xs text-text-secondary mt-1 font-normal">
                Supported formats: PDF, JPG, PNG, WEBP (up to 20MB)
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-success" strokeWidth={1.5} />
                <span>Your bill is encrypted & never shared</span>
              </div>
            </div>
          ) : (
            <Card padding="md" className="flex items-center justify-between gap-4 border-brand-accent/30 bg-brand-accent-light/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="text-text-tertiary hover:text-danger"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </Card>
          )}

          {uploadError && (
            <p className="mt-2 text-xs text-danger flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span>{uploadError}</span>
            </p>
          )}
        </div>

        {/* Form Details */}
        <Card padding="lg" className="space-y-4">
          <h4 className="font-heading font-semibold text-sm text-text-primary border-b border-border-subtle pb-3">
            Hospital & Bill Details
          </h4>

          <Input
            label="Hospital or Clinic Name"
            placeholder="e.g. Apollo Hospital, Fortis Healthcare, AIIMS"
            error={errors.hospital_name?.message}
            {...register("hospital_name")}
          />

          <Input
            label="Total Bill Amount (₹)"
            type="number"
            leftAddon={<span className="text-xs font-semibold">₹</span>}
            placeholder="e.g. 1,45,000"
            hint="Total amount before any insurance discount or payment."
            error={errors.total_billed_amount?.message}
            {...register("total_billed_amount")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admission Date (Optional)"
              type="date"
              error={errors.admission_date?.message}
              {...register("admission_date")}
            />

            <Input
              label="Discharge Date (Optional)"
              type="date"
              error={errors.discharge_date?.message}
              {...register("discharge_date")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Payment Method / Insurance
            </label>
            <select
              className="w-full h-[44px] px-3.5 bg-white text-text-primary text-base font-normal rounded-md border border-border-default outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition-all"
              {...register("insurance_type")}
            >
              <option value="Self Pay">Self Pay / Cash</option>
              <option value="Private Health Insurance">Private Health Insurance (Mediclaim)</option>
              <option value="CGHS / ECHS">CGHS / ECHS (Central Govt)</option>
              <option value="PM-JAY Ayushman Bharat">PM-JAY Ayushman Bharat</option>
              <option value="Corporate / Employer">Corporate / Employer Group Plan</option>
            </select>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Check My Bill Now
        </Button>
      </form>
    </div>
  );
};
