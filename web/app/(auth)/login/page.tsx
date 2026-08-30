"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email_or_phone: z.string().min(3, "Please enter a valid email address or phone number."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_or_phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLockedMinutes(null);

    try {
      const res = await api.auth.login(data);
      loginToStore(
        {
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        },
        {
          id: res.user_id,
          email: res.email,
          full_name: res.full_name,
          role: res.role as any,
          phone_verified: false,
          email_verified: true,
          is_active: true,
          dpdp_consent_given: true,
          created_at: new Date().toISOString(),
        }
      );
      router.push("/dashboard");
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const detail = err?.message || err?.response?.data?.detail;

      if (status === 423 && typeof detail === "object" && detail?.retry_after_seconds) {
        setLockedMinutes(Math.ceil(detail.retry_after_seconds / 60));
      } else if (status === 401) {
        setErrorMessage("Invalid email/phone or password. Please verify your credentials.");
      } else {
        setErrorMessage(
          typeof detail === "string"
            ? detail
            : "Unable to connect to authentication server. Please check your connection and retry."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-primary p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-heading font-bold text-xl">
              C
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight">CuraVeris</span>
          </div>

          <h2 className="font-heading font-bold text-3xl leading-snug tracking-tight mb-4">
            Automated Statutory Healthcare Billing Verification
          </h2>

          <p className="text-sm text-primary-surface/90 font-body leading-relaxed mb-8">
            Securing patient financial transparency across India with real-time statutory gazette compliance and cryptographic Section 65B dispute records.
          </p>

          <div className="space-y-4 pt-6 border-t border-primary-light/40">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>CGHS, NPPA, DPCO & IRDAI gazette rules engine</span>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Tamper-evident Merkle tree Section 65B certification</span>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Full compliance with Digital Personal Data Protection Act 2023</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-primary-surface/80 pt-8 border-t border-primary-light/40">
          <p>© 2026 CuraVeris. All rights reserved.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h1 className="font-heading font-bold text-3xl text-neutral-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-neutral-600 mt-1.5 font-body">
              Sign in to your CuraVeris account to audit and manage hospital bills.
            </p>
          </div>

          {/* Account Lockout Banner */}
          {lockedMinutes && (
            <div className="p-4 bg-warning-surface border border-warning/30 rounded-card flex items-start gap-3 text-warning text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Account Temporarily Locked</p>
                <p className="text-xs mt-0.5">
                  Too many unsuccessful login attempts. Please retry in {lockedMinutes} minute{lockedMinutes > 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-danger-surface border border-danger/30 rounded-card flex items-start gap-3 text-danger text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address or Phone Number"
              placeholder="Enter your registered email or phone"
              error={errors.email_or_phone?.message}
              {...register("email_or_phone")}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your account password"
                error={errors.password?.message}
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-primary transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register("password")}
              />

              <div className="flex justify-end pt-1">
                <Link
                  href="/register"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-6 border-t border-neutral-300 text-center text-sm text-neutral-600">
            Don’t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
