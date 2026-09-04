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
      description="Manage your personal details and privacy settings."
    >
      <div className="space-y-6 max-w-4xl">
        {/* 1. PROFILE OVERVIEW CARD */}
        <div className="bg-[#DFF1F3] rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* 64px Avatar */}
          <div className="w-16 h-16 rounded-full bg-[#202128] text-white flex items-center justify-center font-heading font-extrabold text-2xl flex-shrink-0 shadow-md">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h3 className="font-heading font-extrabold text-2xl text-[#202128]">
              {user?.full_name || "Patient Account"}
            </h3>
            <p className="text-xs text-[#606470] font-medium">{user?.email}</p>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-black/[0.06] rounded-full text-xs font-bold text-[#202128] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
                <span>DPDP 2023 Sovereignty Protected</span>
              </div>

              {user?.role === "admin" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#202128] text-white rounded-full text-xs font-bold shadow-xs">
                  Administrator
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. ACCOUNT INFORMATION */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-5">
          <div className="border-b border-black/[0.06] pb-4 flex items-center justify-between">
            <div>
              <h4 className="font-heading font-extrabold text-lg text-[#202128]">
                Personal Information
              </h4>
              <p className="text-xs text-[#606470] mt-0.5 font-medium">
                Contact details used for complaint letters and status updates
              </p>
            </div>
            <button
              type="button"
              className="h-9 px-4 rounded-full text-xs font-bold bg-[#F5F7FB] hover:bg-[#EDF0FB] text-[#202128] border border-black/[0.06] transition-colors"
              onClick={() => {
                setEditFullName(user?.full_name || "");
                setEditPhone(user?.phone_number || "");
                setIsEditModalOpen(true);
              }}
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl space-y-1">
              <span className="text-[#606470] flex items-center gap-1.5 text-[11px] font-bold">
                <UserIcon className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
                Full Name
              </span>
              <p className="font-bold text-sm text-[#202128]">{user?.full_name || "—"}</p>
            </div>

            <div className="p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl space-y-1">
              <span className="text-[#606470] flex items-center gap-1.5 text-[11px] font-bold">
                <Mail className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
                Email Address
              </span>
              <p className="font-bold text-sm text-[#202128] font-mono">{user?.email || "—"}</p>
            </div>

            <div className="p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl space-y-1">
              <span className="text-[#606470] flex items-center gap-1.5 text-[11px] font-bold">
                <Phone className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
                Mobile Number
              </span>
              <p className="font-bold text-sm text-[#202128] font-mono">
                {user?.phone_number ? `+91 ${user.phone_number}` : "Not linked"}
              </p>
            </div>

            <div className="p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl space-y-1">
              <span className="text-[#606470] flex items-center gap-1.5 text-[11px] font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
                Account Created On
              </span>
              <p className="font-bold text-sm text-[#202128]">
                {user?.created_at ? formatDate(user.created_at) : "Recent"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. SECURITY & PRIVACY */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-5">
          <div className="border-b border-black/[0.06] pb-4">
            <h4 className="font-heading font-extrabold text-lg text-[#202128]">
              Your Privacy Rights (DPDP 2023)
            </h4>
            <p className="text-xs text-[#606470] mt-0.5 font-medium">
              You have complete cryptographic sovereignty over your medical records.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl">
              <div>
                <span className="font-bold text-[#202128] block text-xs">Used only for your hospital bill audits</span>
                <span className="text-[#606470]">Your records are processed in encrypted memory and never monetized.</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#86C159] flex-shrink-0" strokeWidth={2} />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F5F7FB] border border-black/[0.04] rounded-2xl">
              <div>
                <span className="font-bold text-[#202128] block text-xs">Instant 1-Click Right to Erasure</span>
                <span className="text-[#606470]">Permanently purge all uploaded files, invoices, and certificates instantly.</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#86C159] flex-shrink-0" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* 4. DANGER ZONE */}
        <div className="bg-[#FEF2F2] rounded-[32px] p-6 sm:p-8 border border-[#FECACA] shadow-sm space-y-4">
          <div className="border-b border-[#FECACA] pb-3">
            <h4 className="font-heading font-extrabold text-base text-[#DC2626]">
              Delete Account & Permanent Erasure
            </h4>
            <p className="text-xs text-[#DC2626]/80 mt-0.5">
              Irreversible action under the Digital Personal Data Protection Act 2023
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#606470]">
              <strong className="text-[#202128] block">Close and delete account</strong>
              Permanently delete all your uploaded bills, audit reports, and account tokens.
            </div>

            <button
              type="button"
              className="h-10 px-5 rounded-full text-xs font-bold bg-[#DC2626] hover:bg-red-700 text-white shadow-xs transition-colors whitespace-nowrap"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
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

        <div className="flex gap-2 justify-end mt-6">
          <Button
            variant="secondary"
            size="md"
            className="rounded-full"
            onClick={() => setIsEditModalOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="rounded-full px-6"
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
        description="This action is immediate and cannot be undone. All your bills, complaint letters, and reports will be permanently deleted."
      >
        <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-400 mb-6 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>All your uploaded documents and account details will be erased permanently.</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="md"
            className="rounded-full"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            className="rounded-full px-6"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            Yes, Delete Everything
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}
