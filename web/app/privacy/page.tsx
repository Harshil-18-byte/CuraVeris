"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Database,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#202128] font-sans antialiased selection:bg-[#DBF1F4] selection:text-[#202128]">
      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="sticky top-4 z-50 max-w-[1280px] mx-auto w-[94%] sm:w-full px-2 sm:px-4">
        <div className="h-[66px] rounded-full bg-white/90 backdrop-blur-2xl border border-black/[0.06] px-5 sm:px-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <Link href="/" className="flex items-center gap-3 min-w-0 group">
            <LogoIcon size={34} />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#202128] leading-tight">
                CuraVeris
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-[#43A8B2] tracking-wider uppercase">
                Healthcare Forensics
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#EDF0FB] border border-black/[0.03] text-xs font-bold text-[#606470]">
            <Link href="/" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Overview
            </Link>
            <Link href="/features" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              About
            </Link>
            <Link href="/security" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Security
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/login">
              <button
                type="button"
                className="font-bold text-xs px-4 py-2 text-[#202128] hover:bg-black/[0.04] rounded-full transition-colors"
              >
                Sign In
              </button>
            </Link>
            <Link href="/bills/upload">
              <button
                type="button"
                className="font-bold text-xs shadow-md px-5 py-2.5 bg-[#202128] hover:bg-black text-white rounded-full flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <span>Check My Bill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-12">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#43A8B2]" />
            <span>DPDP ACT 2023 PRIVACY FRAMEWORK</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[56px] text-[#202128] leading-[1.1] tracking-tight">
            Privacy Policy & Data Sovereignty
          </h1>

          <p className="text-sm sm:text-lg text-[#606470] max-w-2xl mx-auto font-medium">
            How CuraVeris protects patient health information, encrypts inpatient medical records, and guarantees strict compliance under the Digital Personal Data Protection Act 2023.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-[#606470] pt-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#43A8B2]" />
              Last Updated: March 2026
            </span>
            <span>•</span>
            <span className="font-bold text-[#86C159]">Statutorily Audited</span>
          </div>
        </div>
      </section>

      {/* 3. POLICY CONTENT CARD */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Key Principles Bento Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#DFF1F3] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <EyeOff className="w-6 h-6 text-[#43A8B2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">Zero Data Selling</h3>
              <p className="text-xs text-[#606470] leading-relaxed">We never sell, broker, or monetize patient hospital bills or identities.</p>
            </div>
            <div className="bg-[#E7E3FF] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <Lock className="w-6 h-6 text-[#5E84E2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">AES-256 GCM</h3>
              <p className="text-xs text-[#606470] leading-relaxed">Medical files encrypted at rest with dedicated envelope keys.</p>
            </div>
            <div className="bg-[#DDECFD] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <UserCheck className="w-6 h-6 text-[#43A8B2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">Instant Erasure</h3>
              <p className="text-xs text-[#606470] leading-relaxed">1-click permanent purging of all bills, findings, and certificates.</p>
            </div>
          </div>

          <div className="bg-white rounded-[36px] p-8 sm:p-12 border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-8 text-xs sm:text-sm text-[#606470] leading-relaxed">
            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                1. Purpose of Data Processing
              </h2>
              <p>
                CuraVeris (&ldquo;CuraVeris Technologies Inc.&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) collects and processes patient-provided hospital invoices solely for the purpose of statutory auditing, NPPA price ceiling compliance verification, Section 65B electronic certificate generation, and TPA insurance claim disallowance reconciliation.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                2. Information We Collect
              </h2>
              <p>
                When you use our services, we process the following categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-[#202128]">Account Information:</strong> Full name, verified mobile number, and email address used for portal authentication.</li>
                <li><strong className="text-[#202128]">Hospital Billing Records:</strong> Uploaded invoice scans, itemized line items (medicines, implants, room packages, doctor fees), hospital name, and discharge dates.</li>
                <li><strong className="text-[#202128]">Forensic Audit Metadata:</strong> Cryptographic SHA-256 hash digests, dispute petition drafts, and insurance deduction appeal records.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                3. Zero Third-Party Monetization Guarantee
              </h2>
              <p>
                We do not sell, rent, or lease patient health information to pharmaceutical manufacturers, insurance companies, hospitals, or advertising networks. Your documents are used exclusively to protect your legal and financial rights as a healthcare consumer.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                4. Rights Under Digital Personal Data Protection (DPDP) Act 2023
              </h2>
              <p>
                As a data principal under Indian law, you possess the following statutory rights:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                  <strong className="text-[#202128] block text-xs">Right to Access & Summary</strong>
                  <span className="text-[11px]">View all processed bills and audit findings directly in your portal.</span>
                </div>
                <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                  <strong className="text-[#202128] block text-xs">Right to Correction & Erasure</strong>
                  <span className="text-[11px]">Instantly correct errors or permanently delete all uploaded records.</span>
                </div>
                <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                  <strong className="text-[#202128] block text-xs">Right to Grievance Redressal</strong>
                  <span className="text-[11px]">Direct escalation to our Data Protection Officer at dpo@curaveris.org.</span>
                </div>
                <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-black/[0.04]">
                  <strong className="text-[#202128] block text-xs">Right to Nominate</strong>
                  <span className="text-[11px]">Designate a family member to manage healthcare dispute records.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                5. Data Protection Officer (DPO) Contact
              </h2>
              <p>
                For questions regarding this policy or to exercise your rights under DPDP 2023:
              </p>
              <div className="p-4 bg-[#F5F7FB] rounded-2xl border border-black/[0.04] space-y-1 text-xs">
                <p><strong className="text-[#202128]">Data Protection Officer:</strong> Legal & Privacy Directorate, CuraVeris</p>
                <p><strong className="text-[#202128]">Email:</strong> dpo@curaveris.org</p>
                <p><strong className="text-[#202128]">Jurisdiction:</strong> New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="relative z-10 bg-[#1B1C20] text-white py-12 sm:py-16 border-t border-black/[0.06]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoIcon size={32} />
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Cura<span className="text-[#43A8B2]">Veris</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-white/70">
              <Link href="/features" className="hover:text-white">Features</Link>
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/privacy" className="text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/data-policy" className="hover:text-white">Data Policy</Link>
              <Link href="/compliance" className="hover:text-white">Statutory Compliance</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/40">
            © {new Date().getFullYear()} CuraVeris Technologies Inc. All rights reserved. Your health data is 100% private and protected under the DPDP Act 2023.
          </p>
        </div>
      </footer>
    </div>
  );
}
