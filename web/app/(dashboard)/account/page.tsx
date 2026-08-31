"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Phone, Lock, Trash2, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { api, apiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [showAnonymizeConfirm, setShowAnonymizeConfirm] = useState(false);
  const [anonymizeError, setAnonymizeError] = useState<string | null>(null);

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

  const handleAnonymize = async () => {
    setIsAnonymizing(true);
    setAnonymizeError(null);
    try {
      await apiClient.post("/auth/anonymize-me");
      logout();
      router.replace("/login");
    } catch (err: any) {
      setAnonymizeError(err?.response?.data?.detail || "Failed to anonymize account.");
      setIsAnonymizing(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <PageShell
      title="Account Settings"
      description="Manage your profile credentials, privacy preferences, and DPDP statutory data rights."
      action={
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>
      }
    >
      <div className="max-w-2xl space-y-6">
        {/* Personal Information Form */}
        <form onSubmit={handleUpdate}>
          <Card padding="lg" className="space-y-4">
            <h3 className="font-heading font-bold text-base text-neutral-900">
              Personal Information
            </h3>

            {successMsg && (
              <div className="p-3 bg-success-surface border border-success/20 rounded-button text-xs text-success font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully.</span>
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
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="pt-3 border-t border-neutral-300 flex justify-end">
              <Button type="submit" size="md" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>

        {/* Statutory DPDP Act 2023 Compliance Card */}
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h3 className="font-heading font-bold text-base text-neutral-900">
              Statutory Data Protection & Consent Status
            </h3>
          </div>

          <p className="text-xs text-neutral-600 font-body leading-relaxed">
            Your medical billing records, OCR extractions, and Section 65B Merkle certificates are processed in full compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Consent Status:</span>
              <Badge variant="success">CONSENT VERIFIED & ACTIVE</Badge>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-300 pt-2">
              <span className="text-neutral-600">Account Role:</span>
              <Badge variant={user?.role === "admin" ? "primary" : "secondary"}>
                {user?.role ? user.role.toUpperCase() : "PATIENT"}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-300 pt-2">
              <span className="text-neutral-600">Account Member Since:</span>
              <span className="font-medium text-neutral-900">{formatDate(user?.created_at)}</span>
            </div>
          </div>
        </Card>

        {/* DPDP Right to Erasure / Danger Zone */}
        <Card padding="lg" accentColor="danger" className="space-y-4">
          <div>
            <h3 className="font-heading font-bold text-base text-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              DPDP Act 2023 Section 12 — Right to Erasure
            </h3>
            <p className="text-xs text-neutral-600 mt-1 font-body leading-relaxed">
              You can exercise your statutory right to erasure. This permanently anonymizes your personal identifiers and audit records.
            </p>
          </div>

          {anonymizeError && (
            <div className="p-3 bg-danger-surface border border-danger/20 rounded-button text-xs text-danger">
              {anonymizeError}
            </div>
          )}

          {showAnonymizeConfirm ? (
            <div className="p-4 bg-danger-surface/50 border border-danger/30 rounded-card space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-danger font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Are you sure? This action is irreversible and will permanently delete your identity and sign you out immediately.
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleAnonymize}
                  isLoading={isAnonymizing}
                >
                  Yes, Anonymize My Account
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAnonymizeConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-neutral-300 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowAnonymizeConfirm(true)}
              >
                Anonymize My Account
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
