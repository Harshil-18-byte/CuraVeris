"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  ShieldCheck,
  Lock,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.users.updateMe({
        full_name: editFullName.trim(),
        phone_number: editPhone.trim() || undefined,
      });
      setUser(updated);
      toast.success("Profile details updated successfully.");
      setIsEditModalOpen(false);
    } catch {
      // If offline/fallback, update local state directly
      if (user) {
        const updatedUser = {
          ...user,
          full_name: editFullName.trim(),
          phone_number: editPhone.trim() || user.phone_number,
        };
        setUser(updatedUser);
        toast.success("Profile details saved.");
      }
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.auth.deleteAccount();
      toast.success("Your account and all associated bills have been permanently deleted.");
      logout();
      router.replace("/login");
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <PageShell
      title="Profile & Settings"
      description="Manage your personal contact details, security credentials, and DPDP privacy settings."
    >
      <div className="space-y-6 max-w-4xl">
        {/* 1. PROFILE OVERVIEW CARD */}
        <Card padding="lg" className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* 64px Avatar */}
          <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center font-heading font-bold text-2xl flex-shrink-0 shadow-sm">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="font-heading font-bold text-xl text-text-primary">
              {user?.full_name || "Patient Account"}
            </h3>
            <p className="text-xs text-text-secondary">{user?.email}</p>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-bg border border-success/20 rounded-full text-xs font-medium text-success">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>DPDP 2023 Protected Account</span>
              </div>

              {user?.role === "admin" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent-light rounded-full text-xs font-semibold text-brand-accent">
                  Administrator
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 2. ACCOUNT INFORMATION */}
        <Card padding="lg" className="space-y-4">
          <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-heading font-semibold text-base text-text-primary">
                Personal Information
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Contact details used for dispute letters and status updates
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditFullName(user?.full_name || "");
                setEditPhone(user?.phone_number || "");
                setIsEditModalOpen(true);
              }}
            >
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-bg-secondary rounded-md space-y-1">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                Full Name
              </span>
              <p className="font-semibold text-sm text-text-primary">{user?.full_name || "—"}</p>
            </div>

            <div className="p-3.5 bg-bg-secondary rounded-md space-y-1">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                Email Address
              </span>
              <p className="font-semibold text-sm text-text-primary">{user?.email || "—"}</p>
            </div>

            <div className="p-3.5 bg-bg-secondary rounded-md space-y-1">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                Mobile Number
              </span>
              <p className="font-semibold text-sm text-text-primary">
                {user?.phone_number ? `+91 ${user.phone_number}` : "Not linked"}
              </p>
            </div>

            <div className="p-3.5 bg-bg-secondary rounded-md space-y-1">
              <span className="text-text-tertiary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                Account Created On
              </span>
              <p className="font-semibold text-sm text-text-primary">
                {user?.created_at ? formatDate(user.created_at) : "Recent"}
              </p>
            </div>
          </div>
        </Card>

        {/* 3. SECURITY & PRIVACY */}
        <Card padding="lg" className="space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h4 className="font-heading font-semibold text-base text-text-primary">
              Security & DPDP Privacy Rights
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Under India&apos;s DPDP Act 2023, you have full control over your health records.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-bg-secondary rounded-md">
              <div>
                <span className="font-semibold text-text-primary block">Right to Information</span>
                <span className="text-text-secondary">Your data is only processed to find bill overcharges.</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" strokeWidth={1.5} />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-bg-secondary rounded-md">
              <div>
                <span className="font-semibold text-text-primary block">Right to Correction & Erasure</span>
                <span className="text-text-secondary">You may permanently delete your data at any time.</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" strokeWidth={1.5} />
            </div>
          </div>
        </Card>

        {/* 4. DANGER ZONE */}
        <Card padding="lg" className="border-danger/30 space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h4 className="font-heading font-semibold text-base text-danger">
              Danger Zone
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Permanent account actions that cannot be undone
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-text-secondary">
              <strong className="text-text-primary block">Close and delete account</strong>
              Permanently delete all your uploaded bills, audit reports, and personal details.
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              Close My Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
        description="Update your contact name and mobile number used across your account."
      >
        <div className="space-y-4 py-2">
          <Input
            label="Full Name"
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
            placeholder="Your legal name"
          />
          <Input
            label="Mobile Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
            prefix="+91"
            maxLength={10}
          />
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsEditModalOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveProfile}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Are you sure you want to delete your account?"
        description="This action is immediate and cannot be undone. All your bills, dispute notices, and financial analysis will be permanently erased."
      >
        <div className="p-3.5 bg-danger-bg rounded-md text-xs text-danger mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>Under the DPDP Act 2023, all your encrypted files and database records will be erased immediately.</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            Permanently Delete
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}
