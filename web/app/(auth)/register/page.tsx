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
import { getErrorMessage } from "@/lib/errors";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    phone_number: z
      .string()
      .min(10, "Please enter a valid mobile number"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    consent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      consent: true,
    },
    mode: "onBlur",
  });

  const passwordVal = watch("password") || "";
  const consentVal = watch("consent");



  // Calculate password strength segments (0-4)
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(passwordVal);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return { text: "Fair", color: "text-[#D97706]" };
      case 2:
        return { text: "Good", color: "text-[#43A8B2]" };
      case 3:
      case 4:
        return { text: "Strong", color: "text-[#86C159]" };
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
      login(
        {
          access_token: res.access_token,
          refresh_token: res.refresh_token || res.access_token,
        },
        res.user
      );
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F7FB] selection:bg-[#DBF1F4] selection:text-[#202128]">
      {/* LEFT PANEL (Soft Gradient Panel) */}
      <div className="lg:w-[40%] bg-gradient-to-br from-[#DBF1F4]/70 via-[#EDF0FB] to-[#F5F7FB] text-[#202128] p-8 lg:p-12 flex flex-col justify-between hidden lg:flex border-r border-black/[0.06] relative overflow-hidden">
        {/* Brand */}
        <Logo href="/" showTagline={true} theme="light" size="md" />

        {/* Middle Feature Quote */}
        <div className="my-auto space-y-6 py-12 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#202128] shadow-xs border border-black/[0.04]">
            <Sparkles className="w-6 h-6 text-[#43A8B2]" strokeWidth={2} />
          </div>
          <p className="text-xl font-heading font-bold text-[#202128] leading-relaxed">
            &ldquo;Join thousands of Indian families taking control of their hospital bills with full transparency.&rdquo;
          </p>
        </div>

        {/* Bottom Trust Points */}
        <div className="space-y-3 pt-6 border-t border-black/[0.06] text-xs text-[#606470] font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>Instant checking against government rates</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>Zero spam · We never sell your personal data</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" strokeWidth={2} />
            <span>DPDP 2023 compliant encrypted storage</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Clean White Form Card) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#F5F7FB]">
        {/* Mobile Header */}
        <div className="w-full max-w-[420px] lg:hidden mb-8 flex items-center justify-between">
          <Logo href="/" showTagline={true} size="sm" />
        </div>

        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[32px] border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-6">
          {/* Progress Dots Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s, idx) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      s === step
                        ? "bg-[#202128] text-white shadow-xs"
                        : s < step
                        ? "bg-[#86C159] text-white"
                        : "bg-[#EDF0FB] text-[#606470]"
                    }`}
                  >
                    {s < step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : s}
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                        s < step ? "bg-[#86C159]" : "bg-[#EDF0FB]"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <span className="text-[11px] font-bold text-[#606470] block text-center">
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
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-2xl text-xs text-[#DC2626] flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* STEP 1: Name & Email */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#202128]">
                    Let&apos;s get started
                  </h2>
                  <p className="text-sm text-[#606470] mt-1 font-medium">
                    We&apos;ll use these details to set up your account.
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
                  className="w-full mt-2 rounded-full bg-[#202128] hover:bg-black text-white font-bold py-3.5 shadow-md"
                  onClick={nextStep}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                </Button>
              </div>
            )}

            {/* STEP 2: Phone Number */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#202128]">
                    What&apos;s your phone number?
                  </h2>
                  <p className="text-sm text-[#606470] mt-1 font-medium">
                    We&apos;ll send you a one-time code to confirm this is your number.
                  </p>
                </div>

                <Input
                  label="Mobile Number"
                  placeholder="9876543210"
                  leftAddon={<span className="text-xs font-bold text-[#606470]">+91</span>}
                  hint="We found this number or enter your active number."
                  error={errors.phone_number?.message}
                  {...register("phone_number")}
                />

                <div className="p-3.5 bg-[#DBF1F4]/40 border border-[#79C5CD]/30 rounded-2xl flex items-start gap-2.5 text-xs text-[#202128] font-medium">
                  <PhoneCall className="w-4 h-4 text-[#43A8B2] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span>Your number is private and never shared with hospitals or anyone else.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3 rounded-full font-bold"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-2/3 rounded-full bg-[#202128] hover:bg-black text-white font-bold"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#202128]">
                    Create a password
                  </h2>
                  <p className="text-sm text-[#606470] mt-1 font-medium">
                    Choose a password to keep your account safe.
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
                      className="text-[#606470] hover:text-[#202128] focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                    </button>
                  }
                  {...register("password")}
                />

                {/* Password Strength Meter */}
                {passwordVal.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#606470] font-medium">Strength</span>
                      <span className={`font-bold ${strengthInfo.color}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`rounded-full transition-colors ${
                            strengthScore >= seg
                              ? strengthScore === 1
                                ? "bg-[#DC2626]"
                                : strengthScore === 2
                                ? "bg-[#D97706]"
                                : strengthScore === 3
                                ? "bg-[#43A8B2]"
                                : "bg-[#86C159]"
                              : "bg-[#EDF0FB]"
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
                      className="text-[#606470] hover:text-[#202128] focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                    </button>
                  }
                  {...register("confirm_password")}
                />

                {/* Requirement Checklist */}
                <div className="p-3.5 bg-[#F5F7FB] rounded-2xl space-y-1.5 text-xs text-[#606470] font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${passwordVal.length >= 8 ? "text-[#86C159]" : "text-[#606470]"}`}
                      strokeWidth={2}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/[A-Z]/.test(passwordVal) ? "text-[#86C159]" : "text-[#606470]"}`}
                      strokeWidth={2}
                    />
                    <span>One capital letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/\d/.test(passwordVal) ? "text-[#86C159]" : "text-[#606470]"}`}
                      strokeWidth={2}
                    />
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${/[^A-Za-z0-9]/.test(passwordVal) ? "text-[#86C159]" : "text-[#606470]"}`}
                      strokeWidth={2}
                    />
                    <span>One special character (@, #, $, etc.)</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3 rounded-full font-bold"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-2/3 rounded-full bg-[#202128] hover:bg-black text-white font-bold"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Privacy & Consent */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#202128]">
                    One last thing — your privacy
                  </h2>
                  <p className="text-sm text-[#606470] mt-1 font-medium leading-relaxed">
                    CuraVeris uses your hospital bill information only to check for overcharges on your behalf. We keep your data secure and never sell it to anyone. You can ask us to delete your data at any time.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <CheckboxPrimitive.Root
                    id="consent-checkbox"
                    checked={consentVal === true}
                    onCheckedChange={(checked) => setValue("consent", checked === true ? true : (false as any))}
                    className="w-5 h-5 rounded-md border border-black/[0.15] bg-[#F5F7FB] flex items-center justify-center data-[state=checked]:bg-[#202128] data-[state=checked]:border-[#202128] transition-colors flex-shrink-0 mt-0.5"
                  >
                    <CheckboxPrimitive.Indicator>
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                  <label htmlFor="consent-checkbox" className="text-xs text-[#202128] font-semibold cursor-pointer leading-tight">
                    I understand how CuraVeris uses my information and I agree.
                  </label>
                </div>

                {errors.consent && (
                  <p className="text-xs text-[#DC2626] flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Please agree to continue.</span>
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="w-1/3 rounded-full font-bold"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-2/3 rounded-full bg-[#202128] hover:bg-black text-white font-bold"
                    disabled={!consentVal || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Start Using CuraVeris
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-black/[0.06] text-center text-xs text-[#606470] font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#202128] font-bold hover:underline focus:outline-none"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
