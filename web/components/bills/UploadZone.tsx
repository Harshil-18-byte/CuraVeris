"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  error,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  const validateAndSet = (file: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/tiff"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|tiff?)$/i)) {
      onFileSelect(null);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      onFileSelect(null);
      return;
    }
    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.tiff"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={cn(
          "w-full min-h-[220px] rounded-card border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer",
          isDragOver
            ? "border-primary bg-primary-surface"
            : error
            ? "border-danger bg-danger-surface/20"
            : "border-neutral-300 bg-neutral-50 hover:bg-neutral-50/80"
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-success-surface border border-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-base">{selectedFile.name}</p>
              <p className="text-xs text-neutral-600 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for statutory audit
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="mt-2 text-xs font-semibold text-danger hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove Document</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-primary-surface border border-primary/20 flex items-center justify-center text-primary mb-1">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="font-semibold text-neutral-900 text-base">
              Drag and drop your hospital bill here
            </p>
            <p className="text-sm text-neutral-600">
              or{" "}
              <span className="text-primary font-medium hover:underline">
                browse files on your device
              </span>
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              PDF, PNG, JPEG, TIFF · Maximum 50MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-danger-surface border border-danger/20 rounded-button flex items-center gap-2 text-danger text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
