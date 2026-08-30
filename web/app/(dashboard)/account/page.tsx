"use client";

import React, { useState } from "react";
import { User, ShieldCheck, Mail, Phone, Lock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);
    try {
      const updated = await api.users.updateMe({
        full_name: fullName,
        phone_number: phoneNumber,
      });
      setUser({ ...user!, ...updated });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch {
      alert("Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell
      title="Account Settings"
      description="Manage your profile credentials and review your DPDP statutory privacy record."
    >
      <div className="max-w-2xl space-y-6">
        <form onSubmit={handleUpdate}>
          <Card padding="lg" className="space-y-4">
            <h3 className="font-heading font-bold text-base text-neutral-900">
              Personal Information
            </h3>

            {successMsg && (
              <div className="p-3 bg-success-surface border border-success/20 rounded-button text-xs text-success font-semibold">
                Profile updated successfully.
              </div>
            )}

            <div className="space-y-4 pt-1">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Email Address"
                value={user?.email || ""}
                disabled
                hint="Your email address is verified and serves as your primary login identifier."
              />

              <Input
                label="Mobile Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                leftAddon={<span className="font-semibold text-neutral-600 text-xs">+91</span>}
              />
            </div>

            <div className="pt-3 border-t border-neutral-300 flex justify-end">
              <Button type="submit" size="md" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>

        {/* DPDP Act Compliance Card */}
        <Card padding="lg" className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h3 className="font-heading font-bold text-base text-neutral-900">
              Statutory Data Protection Status
            </h3>
          </div>

          <p className="text-xs text-neutral-600 font-body leading-relaxed">
            Your medical billing records, OCR extractions, and Section 65B Merkle certificates are processed in full compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-neutral-600">Consent Status:</span>
            <Badge variant="success">CONSENT VERIFIED & ACTIVE</Badge>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-neutral-300 pt-2">
            <span className="text-neutral-600">Account Member Since:</span>
            <span className="font-medium text-neutral-900">{formatDate(user?.created_at)}</span>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
