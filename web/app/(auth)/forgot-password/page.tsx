"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestPasswordReset(email);
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Could not process password reset request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return;

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card padding="lg" className="w-full max-w-md bg-[#111520] border-white/10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {step === "request"
              ? "Enter your email address and we will send you a reset code."
              : "Enter the code and your new password."}
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <InlineError title="Action Failed" message={error} />
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-white">Password Reset Complete</p>
              <p className="text-xs text-neutral-400 mt-1">
                You can now log in with your updated credentials.
              </p>
            </div>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : step === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Reset Code (OTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-center tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Update Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <Link
            href="/login"
            className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
