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
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your email or mobile number"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Countdown timer for lockout
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
      setToken(res.access_token);
      setUser(res.user);
      router.replace("/dashboard");
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const detail = err?.message || err?.response?.data?.detail;

      if (status === 429 || (typeof detail === "string" && detail.includes("locked"))) {
        setIsLocked(true);
        setLockoutRemaining(15 * 60); // 15 minutes
        setErrorMessage("Your account is locked for 15 minutes for your security.");
      } else if (status === 401 || (typeof detail === "string" && detail.includes("Incorrect"))) {
        setErrorMessage("Incorrect email or password. Please try again.");
      } else {
        setErrorMessage(
          typeof detail === "string"
            ? detail
            : "Could not sign in. Please check your internet connection."
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-brand-accent/20 selection:text-brand-accent">
      {/* LEFT PANEL (40% width on desktop) */}
      <div className="lg:w-[40%] bg-brand-primary text-white p-8 lg:p-12 flex flex-col justify-between hidden lg:flex">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-brand-accent flex items-center justify-center text-white font-heading font-bold text-base shadow-xs">
            C
          </div>
          <span className="font-heading font-bold text-xl text-white tracking-tight">
            CuraVeris
          </span>
        </Link>

        {/* Middle Feature Quote */}
        <div className="my-auto space-y-6 py-12 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-accent-light">
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-heading font-medium text-white/90 leading-relaxed">
            &ldquo;Trusted by patients and families across India to audit medical bills and recover unfair charges.&rdquo;
          </p>
        </div>

        {/* Bottom Trust Points */}
        <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>Government price benchmarks (NPPA, CGHS, DPCO)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>Section 65B tamper-evident legal certificate</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>Digital Personal Data Protection (DPDP) Act 2023 certified</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (60% width on desktop) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        {/* Mobile Header */}
        <div className="w-full max-w-[380px] lg:hidden mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-accent text-white flex items-center justify-center font-heading font-bold text-sm">
              C
            </div>
            <span className="font-heading font-bold text-lg text-text-primary">CuraVeris</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px] space-y-6">
          {/* Header */}
          <div>
            <h2 className="font-heading font-bold text-2xl sm:text-[28px] text-text-primary tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-text-secondary mt-1 font-normal">
              Sign in to your account
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className={`p-3.5 rounded-md border flex items-start gap-2.5 text-xs animate-in fade-in-50 duration-150 ${
                isLocked
                  ? "bg-danger-bg border-danger/30 text-danger"
                  : "bg-warning-bg border-warning/30 text-[#92400E]"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium">{errorMessage}</p>
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
              error={errors.username?.message}
              disabled={isSubmitting || isLocked}
              {...register("username")}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                error={errors.password?.message}
                disabled={isSubmitting || isLocked}
                rightAddon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-tertiary hover:text-text-primary transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                }
                {...register("password")}
              />

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your email.")}
                  className="text-xs font-medium text-brand-accent hover:underline focus:outline-none"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
              disabled={isLocked}
            >
              Sign In
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-brand-accent font-medium hover:underline focus:outline-none"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
