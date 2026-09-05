"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";
import { authApi } from "@/lib/api";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Please provide both email and OTP.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.verifyOtp({ email, otp });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="w-full max-w-md bg-[#111520] border-white/10">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Verify Account</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Enter the 6-digit verification code sent to your registered email.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <InlineError title="Verification Failed" message={error} />
        </div>
      )}

      {success ? (
        <div className="text-center py-6">
          <p className="text-sm font-semibold text-emerald-400">Account verified successfully!</p>
          <p className="text-xs text-neutral-400 mt-1">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              placeholder="123456"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-center tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Verify & Proceed
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
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-xs">Loading verification form...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}

