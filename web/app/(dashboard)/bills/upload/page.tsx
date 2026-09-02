"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { UploadZone } from "@/components/bills/UploadZone";

export default function BillUploadPage() {
  return (
    <PageShell
      title="Check a Hospital Bill"
      description="Upload your hospital bill, discharge summary, or pharmacy receipts to check for overcharges."
      action={
        <Link href="/bills">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
            Back to Bills
          </Button>
        </Link>
      }
    >
      <UploadZone />
    </PageShell>
  );
}
