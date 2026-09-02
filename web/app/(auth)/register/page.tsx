"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  Check,
  CheckCircle2,
  PhoneCall,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    phone_number: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include at least one capital letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/\d/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    consent: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the privacy terms to continue" }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      consent: false as any,
    },
    mode: "onBlur",
  });

  const passwordVal = watch("password") || "";
  const consentVal = watch("consent");

  // Calculate password strength segments (0-4)
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(passwordVal);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return { text: "Too simple", color: "text-danger" };
      case 2:
        return { text: "Getting better", color: "text-warning" };
      case 3:
        return { text: "Almost there", color: "text-info" };
      case 4:
        return { text: "Strong password", color: "text-success" };
      default:
        return { text: "", color: "" };
    }
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger(["full_name", "email"]);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger("phone_number");
      if (isValid) setStep(3);
    } else if (step === 3) {
      const isValid = await trigger(["password", "confirm_password"]);
      if (isValid) setStep(4);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await api.auth.register({
        email: data.email,
        full_name: data.full_name,
        phone_number: data.phone_number,
        password: data.password,
      });
      setToken(res.access_token);
      setUser(res.user);
      router.replace("/dashboard");
    } catch (err: any) {
      const detail = err?.message || err?.response?.data?.detail;
      setServerError(
        typeof detail === "string" ? detail : "Failed to create account. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-brand-accent/20 selection:text-brand-accent">
      {/* LEFT PANEL (40% width on desktop) */}
      <div className="lg:w-[40%] bg-brand-primary text-white p-8 lg:p-12 flex flex-col justify-between hidden lg:flex">
        {/* Brand */}
        <Logo href="/" showTagline={true} theme="light" size="md" />

        {/* Middle Feature Quote */}
        <div className="my-auto space-y-6 py-12 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-accent-light">
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <p className="text-xl font-heading font-medium text-white/90 leading-relaxed">
            &ldquo;Join thousands of Indian families taking control of their hospital bills with full transparency.&rdquo;
          </p>
        </div>

        {/* Bottom Trust Points */}
        <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>Instant checking against government rates</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>Zero spam · We never sell your personal data</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
            <span>DPDP 2023 compliant encrypted storage</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (60% width on desktop) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        {/* Mobile Header */}
        <div className="w-full max-w-[400px] lg:hidden mb-8 flex items-center justify-between">
          <Logo href="/" showTagline={true} size="sm" />
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          {/* Progress Dots Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s, idx) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      s === step
                        ? "bg-brand-accent text-white shadow-xs"
                        : s < step
                        ? "bg-success text-white"
                        : "bg-bg-secondary text-text-tertiary border border-border-default"
                    }`}
                  >
                    {s < step ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : s}
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        s < step ? "bg-success" : "bg-border-default"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <span className="text-[11px] font-medium text-text-secondary block text-center">
              Step {step} of 4:{" "}
              {step === 1
                ? "Let's get started"
                : step === 2
                ? "Your phone number"
                : step === 3
                ? "Create a password"
                : "Your privacy"}
            </span>
          </div>

          {serverError && (
            <div className="p-3 bg-danger-bg border border-danger/30 rounded-md text-xs text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* STEP 1: Name & Email */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-text-primary">
                    Let&apos;s get started
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Enter your name and email to create your account.
                  </p>
                </div>

                <Input
                  label="Full Name"
                  placeholder="e.g. Rahul Sharma"
                  error={errors.full_name?.message}
                  {...register("full_name")}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  onClick={nextStep}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </div>
            )}

            {/* STEP 2: Phone Number */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-text-primary">
                    What&apos;s your phone number?
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    We use this to send report updates and secure your account.
                  </p>
                </div>

                <Input
                  label="Mobile Number"
                  placeholder="9876543210"
                  leftAddon={<span className="text-xs font-semibold text-text-secondary">+91</span>}
                  hint="We'll send a confirmation code to your email to verify."
                  error={errors.phone_number?.message}
                  {...register("phone_number")}
                />

                <div className="p-3 bg-brand-accent-light rounded-md flex items-start gap-2.5 text-xs text-text-secondary">
                  <PhoneCall className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Your number is private and never shared with hospitals or marketers.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-2/3"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-text-primary">
                    Create a password
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Choose a strong password to protect your health records.
                  </p>
                </div>

                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                  error={errors.password?.message}
                  rightAddon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-tertiary hover:text-text-primary focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  }
                  {...register("password")}
                />

                {/* Password Strength Meter */}
                {passwordVal.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Strength</span>
                      <span className={`font-semibold ${strengthInfo.color}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`rounded-full transition-colors ${
                            strengthScore >= seg
                              ? strengthScore === 1
                                ? "bg-danger"
                                : strengthScore === 2
                                ? "bg-warning"
                                : strengthScore === 3
                                ? "bg-info"
                                : "bg-success"
                              : "bg-border-default"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  error={errors.confirm_password?.message}
                  rightAddon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-text-tertiary hover:text-text-primary focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  }
                  {...register("confirm_password")}
                />

                {/* Requirement Checklist */}
                <div className="p-3 bg-bg-secondary rounded-md space-y-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${passwordVal.length >= 8 ? "text-success" : "text-text-tertiary"}`}
                      strokeWidth={1.5}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/[A-Z]/.test(passwordVal) ? "text-success" : "text-text-tertiary"}`}
                      strokeWidth={1.5}
                    />
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/\d/.test(passwordVal) ? "text-success" : "text-text-tertiary"}`}
                      strokeWidth={1.5}
                    />
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/[^A-Za-z0-9]/.test(passwordVal) ? "text-success" : "text-text-tertiary"}`}
                      strokeWidth={1.5}
                    />
                    <span>One special character (@, #, $, etc.)</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-2/3"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Privacy & Consent */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-text-primary">
                    One last thing — your privacy
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Your health data belongs to you. Here is our simple promise:
                  </p>
                </div>

                <div className="p-4 bg-bg-secondary rounded-md border border-border-subtle max-h-[120px] overflow-y-auto text-xs text-text-secondary leading-relaxed space-y-2">
                  <p>
                    <strong>1. Confidentiality:</strong> Your hospital bills are used exclusively to find overcharges on your behalf.
                  </p>
                  <p>
                    <strong>2. Security:</strong> All records are encrypted under the Digital Personal Data Protection (DPDP) Act 2023.
                  </p>
                  <p>
                    <strong>3. Right to Erasure:</strong> You can permanently delete your entire account and all bills at any time.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <CheckboxPrimitive.Root
                    id="consent-checkbox"
                    checked={consentVal === true}
                    onCheckedChange={(checked) => setValue("consent", checked === true ? true : (false as any))}
                    className="w-[18px] h-[18px] rounded-[4px] border border-border-default bg-white flex items-center justify-center data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent transition-colors flex-shrink-0 mt-0.5"
                  >
                    <CheckboxPrimitive.Indicator>
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                  <label htmlFor="consent-checkbox" className="text-xs text-text-primary font-medium cursor-pointer leading-tight">
                    I agree to let CuraVeris check my bills and I understand my data is protected under the DPDP Act 2023.
                  </label>
                </div>

                {errors.consent && (
                  <p className="text-xs text-danger flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{errors.consent.message}</span>
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-2/3"
                    disabled={!consentVal || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Create Free Account
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-accent font-medium hover:underline focus:outline-none"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
