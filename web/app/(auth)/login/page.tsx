"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your email or mobile number"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LOGIN_MESSAGES = [
  {
    quote: "Trusted by patients and families across India to check hospital bills and recover unfair charges.",
    author: "Patient Community",
    tag: "Patient Protection",
  },
  {
    quote: "Found ₹48,000 in duplicate ICU charges within 5 minutes of uploading our hospital discharge bill.",
    author: "Rajesh M., Bengaluru",
    tag: "Real Patient Story",
  },
  {
    quote: "Every medicine and medical implant is automatically checked against official government price limits.",
    author: "Price Protection",
    tag: "Government Price Caps",
  },
  {
    quote: "Ready-to-send complaint letters and dispute documents prepared for you in minutes.",
    author: "Patient Rights",
    tag: "Ready Complaint Letters",
  },
  {
    quote: "Your hospital bills and information are 100% private and protected.",
    author: "Privacy Protection",
    tag: "100% Confidential",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % LOGIN_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutRemaining > 0) {
      interval = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setErrorMessage(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const res = await api.auth.login(data.username, data.password);
      const userObj = res.user || {
        id: res.user_id || "",
        email: res.email || data.username,
        full_name: res.full_name || data.username.split("@")[0],
        role: res.role || "PATIENT",
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      login(
        {
          access_token: res.access_token,
          refresh_token: res.refresh_token || res.access_token,
        },
        userObj
      );
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.status === 429) {
        setIsLocked(true);
        setLockoutRemaining(60);
        setErrorMessage("Too many attempts. Please wait before trying again.");
      } else {
        setErrorMessage(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F7FB] selection:bg-[#DBF1F4] selection:text-[#202128]">
      {/* LEFT PANEL */}
      <div className="lg:w-[42%] bg-gradient-to-br from-[#DBF1F4]/70 via-[#EDF0FB] to-[#F5F7FB] text-[#202128] p-8 lg:p-14 flex flex-col justify-between hidden lg:flex border-r border-black/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/60 rounded-full blur-3xl pointer-events-none" />

        <Logo href="/" showTagline={true} theme="light" size="md" />

        {/* Feature Quote Carousel */}
        <div className="my-auto space-y-6 py-8 max-w-sm z-10">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#202128] shadow-xs border border-black/[0.04]">
              <Sparkles className="w-5 h-5 text-[#43A8B2]" strokeWidth={2} />
            </div>
            <span className="px-3.5 py-1 bg-white rounded-full text-xs font-bold text-[#202128] border border-black/[0.04] shadow-xs">
              {LOGIN_MESSAGES[activeMessageIndex].tag}
            </span>
          </div>

          <div className="min-h-[110px] flex flex-col justify-center">
            <p
              key={activeMessageIndex}
              className="text-xl font-heading font-bold text-[#202128] leading-snug transition-all duration-500 ease-in-out animate-in fade-in-50"
            >
              &ldquo;{LOGIN_MESSAGES[activeMessageIndex].quote}&rdquo;
            </p>
            <p className="text-xs text-[#606470] mt-3 font-semibold">
              — {LOGIN_MESSAGES[activeMessageIndex].author}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            {LOGIN_MESSAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMessageIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === activeMessageIndex
                    ? "w-7 bg-[#202128]"
                    : "w-1.5 bg-black/20 hover:bg-black/40"
                }`}
                aria-label={`Go to message ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Trust Points */}
        <div className="space-y-3 pt-6 border-t border-black/[0.06] text-xs text-[#606470] font-semibold z-10">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>Government price benchmarks (NPPA, CGHS, DPCO)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>Section 65B tamper-evident legal certificate</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>Digital Personal Data Protection (DPDP) Act 2023 certified</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#F5F7FB] relative">
        <div className="w-full max-w-[420px] lg:hidden mb-8 flex items-center justify-between">
          <Logo href="/" showTagline={true} size="sm" />
        </div>

        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#606470] mt-1.5 font-medium">
              Sign in to your patient portal
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in-50 duration-150 ${
                isLocked
                  ? "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]"
                  : "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="font-bold">{errorMessage}</p>
                {isLocked && lockoutRemaining > 0 && (
                  <p className="mt-1 font-mono text-[11px] opacity-90">
                    Try again in: {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address or phone number"
              placeholder="e.g. rahul@example.com or 9876543210"
              autoComplete="username"
              error={errors.username?.message}
              disabled={isSubmitting || isLocked}
              {...register("username")}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                disabled={isSubmitting || isLocked}
                rightAddon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#606470] hover:text-[#202128] transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                }
                {...register("password")}
              />

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    alert("Password reset link will be sent to your registered email.")
                  }
                  className="text-xs font-bold text-[#43A8B2] hover:text-[#202128] focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 h-12 rounded-full bg-[#202128] hover:bg-black text-white font-bold shadow-md"
              isLoading={isSubmitting}
              disabled={isLocked}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2.2} />
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-black/[0.06] text-center text-xs text-[#606470] font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#202128] font-bold hover:underline focus:outline-none"
            >
              Create an account
            </Link>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#606470]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#43A8B2]" strokeWidth={2} />
            <span>256-bit encrypted · DPDP 2023 compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
