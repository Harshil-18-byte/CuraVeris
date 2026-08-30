"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ShieldCheck, ArrowRight, ArrowLeft, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone_number: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Must contain at least one lowercase letter.")
      .regex(/\d/, "Must contain at least one number.")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character."),
    confirm_password: z.string(),
    dpdp_consent: z.boolean().refine((val: boolean) => val === true, "DPDP consent is required."),
  })
  .refine((data: { password?: string; confirm_password?: string }) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state: { login: any }) => state.login);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dpdp_consent: false,
    },
    mode: "onChange",
  });

  const watchedPassword = watch("password") || "";

  // Password requirement checklist checks
  const passReqs = {
    length: watchedPassword.length >= 8,
    upper: /[A-Z]/.test(watchedPassword),
    lower: /[a-z]/.test(watchedPassword),
    number: /\d/.test(watchedPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword),
  };

  const strengthCount = Object.values(passReqs).filter(Boolean).length;

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(["full_name", "email"]);
    } else if (currentStep === 2) {
      isValid = true; // Phone is optional
    } else if (currentStep === 3) {
      isValid = await trigger(["password", "confirm_password"]);
    }

    if (isValid) {
      setCurrentStep((prev: number) => prev + 1);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api.auth.register({
        email: data.email,
        phone_number: data.phone_number || undefined,
        password: data.password,
        full_name: data.full_name,
        dpdp_consent: data.dpdp_consent,
      });
      setRegisteredEmail(data.email);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredEmail || otpCode.length !== 6) return;

    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await api.auth.verifyOtp({
        email: registeredEmail,
        otp: otpCode,
        purpose: "verify_email",
      });
      loginToStore({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      }, {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role as any,
        phone_verified: false,
        email_verified: true,
        is_active: true,
        dpdp_consent_given: true,
        created_at: new Date().toISOString(),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setOtpError(err?.response?.data?.detail || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between py-12 px-6">
      <div className="max-w-xl w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-bold text-xl">
              C
            </div>
            <span className="font-heading font-bold text-2xl text-neutral-900 tracking-tight">
              CuraVeris
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-neutral-900">
            Create Your Patient Account
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-body">
            Get instant access to automated hospital bill audits & legal dispute generation.
          </p>
        </div>

        {/* OTP Modal / Screen if email registered */}
        {registeredEmail ? (
          <Card padding="lg" className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-surface border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-heading font-bold text-xl text-neutral-900">
                Verify Your Email
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-neutral-900">{registeredEmail}</span>
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-danger-surface border border-danger/20 rounded-button text-xs text-danger">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full h-12 text-center font-mono font-bold text-2xl tracking-[0.5em] border border-neutral-300 rounded-button focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isVerifyingOtp}
                disabled={otpCode.length !== 6}
              >
                Verify & Enter Dashboard
              </Button>
            </form>
          </Card>
        ) : (
          /* Multi-Step Registration Card */
          <Card padding="lg" className="space-y-6">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between relative pb-4 border-b border-neutral-300">
              {[1, 2, 3, 4].map((step) => {
                const isDone = currentStep > step;
                const isCurrent = currentStep === step;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone
                          ? "bg-success text-white"
                          : isCurrent
                          ? "bg-primary text-white"
                          : "bg-white border border-neutral-300 text-neutral-600"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className="text-xs font-medium text-neutral-600 hidden sm:inline">
                      {step === 1 && "Personal"}
                      {step === 2 && "Phone"}
                      {step === 3 && "Security"}
                      {step === 4 && "Consent"}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in-0 duration-200">
                  <h3 className="font-heading font-bold text-base text-neutral-900">
                    Step 1: Your Personal Information
                  </h3>
                  <Input
                    label="Full Name (as per ID)"
                    placeholder="Enter your full name"
                    error={errors.full_name?.message}
                    {...register("full_name")}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    error={errors.email?.message}
                    hint="We will send verification codes and audit certificates here."
                    {...register("email")}
                  />
                </div>
              )}

              {/* Step 2: Phone Number */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in-0 duration-200">
                  <h3 className="font-heading font-bold text-base text-neutral-900">
                    Step 2: Mobile Contact (Optional)
                  </h3>
                  <Input
                    label="Mobile Phone Number"
                    placeholder="10-digit mobile number"
                    leftAddon={<span className="font-semibold text-neutral-600 text-xs">+91</span>}
                    error={errors.phone_number?.message}
                    hint="We will send one-time verification codes to your email address."
                    {...register("phone_number")}
                  />
                </div>
              )}

              {/* Step 3: Password & Security */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in-0 duration-200">
                  <h3 className="font-heading font-bold text-base text-neutral-900">
                    Step 3: Account Password
                  </h3>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  {/* Password Strength Meter */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className={`rounded-full transition-colors ${
                            idx <= strengthCount
                              ? strengthCount >= 4
                                ? "bg-success"
                                : strengthCount >= 2
                                ? "bg-warning"
                                : "bg-danger"
                              : "bg-neutral-300"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 pt-2">
                      <span className={passReqs.length ? "text-success font-semibold" : ""}>
                        • 8+ characters
                      </span>
                      <span className={passReqs.upper ? "text-success font-semibold" : ""}>
                        • Uppercase letter
                      </span>
                      <span className={passReqs.lower ? "text-success font-semibold" : ""}>
                        • Lowercase letter
                      </span>
                      <span className={passReqs.number ? "text-success font-semibold" : ""}>
                        • At least 1 digit
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-type your password"
                    error={errors.confirm_password?.message}
                    {...register("confirm_password")}
                  />
                </div>
              )}

              {/* Step 4: Privacy Consent */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in-0 duration-200">
                  <h3 className="font-heading font-bold text-base text-neutral-900">
                    Step 4: Statutory Privacy & DPDP Consent
                  </h3>

                  <div className="max-h-32 overflow-y-auto p-3 bg-neutral-50 border border-neutral-300 rounded-card text-xs text-neutral-600 font-body leading-relaxed">
                    Under the Digital Personal Data Protection (DPDP) Act 2023, CuraVeris processes your uploaded hospital invoice documents solely for automated itemization, rate checking against official government statutory price gazettes (CGHS/NPPA/DPCO), and generating Section 65B dispute certificates. Your health and financial records are cryptographically hashed and never sold.
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      {...register("dpdp_consent")}
                    />
                    <span className="text-xs text-neutral-900 font-medium">
                      I expressly consent to the processing of medical billing documents in accordance with the DPDP Act 2023.
                    </span>
                  </label>
                  {errors.dpdp_consent && (
                    <span className="text-xs text-danger block">{errors.dpdp_consent.message}</span>
                  )}
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-300">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button type="button" size="md" onClick={handleNextStep}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" size="md" isLoading={isSubmitting}>
                    Complete Registration
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}

        <div className="text-center text-xs text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
