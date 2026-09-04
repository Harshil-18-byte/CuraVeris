"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function TermsOfServicePage() {
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
            <Scale className="w-4 h-4 text-[#43A8B2]" />
            <span>CONSUMER PROTECTION & STATUTORY AUDIT TERMS</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[56px] text-[#202128] leading-[1.1] tracking-tight">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-lg text-[#606470] max-w-2xl mx-auto font-medium">
            Please read these terms carefully before using the CuraVeris statutory healthcare forensic auditing platform.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-[#606470] pt-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#43A8B2]" />
              Effective Date: March 2026
            </span>
            <span>•</span>
            <span className="font-bold text-[#86C159]">Governing Law: India</span>
          </div>
        </div>
      </section>

      {/* 3. TERMS CONTENT */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white rounded-[36px] p-8 sm:p-12 border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-8 text-xs sm:text-sm text-[#606470] leading-relaxed">
            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, uploading hospital invoices, or accessing the CuraVeris platform, you agree to be bound by these Terms of Service, our Privacy Policy, and our Data Sovereignty Policy.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                2. Nature of Forensic Audit Services
              </h2>
              <p>
                CuraVeris provides automated itemized bill extraction, comparative analysis against official government price notifications (NPPA, DPCO 2013, CGHS, and IRDAI schedules), and Section 65B electronic certificate generation. Our reports and dispute drafts serve as informational forensic evidence to assist patients in negotiating with hospital grievance desks, TPAs, and filing complaints with statutory authorities.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                3. User Obligations & Accuracy of Records
              </h2>
              <p>
                You represent and warrant that all hospital bills, invoices, and payment receipts uploaded to CuraVeris are genuine documents relating to your treatment or that of a family member who has authorized you to act on their behalf.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                4. Section 65B Cryptographic Certificates
              </h2>
              <p>
                Certificates generated under Section 65B of the Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam (BSA) 2023 certify the digital authenticity and hash integrity of electronic audit logs produced during the automated comparison against government gazette data.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                5. Limitation of Liability
              </h2>
              <p>
                CuraVeris does not guarantee specific monetary refund amounts from private healthcare providers or insurers, as final claim adjudications remain subject to hospital management decisions, insurance ombudsman rulings, or Consumer Commission orders.
              </p>
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
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-white">Terms of Service</Link>
              <Link href="/data-policy" className="hover:text-white">Data Policy</Link>
              <Link href="/compliance" className="hover:text-white">Statutory Compliance</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/40">
            © {new Date().getFullYear()} CuraVeris Technologies Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
