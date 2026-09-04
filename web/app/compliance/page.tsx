"use client";

import React from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function StatutoryCompliancePage() {
  const complianceFrameworks = [
    {
      authority: "National Pharmaceutical Pricing Authority (NPPA)",
      act: "Essential Commodities Act, 1955 / DPCO 2013",
      scope: "Cardiac Stents, Orthopedic Knee Implants, NLEM Schedule I Medicines",
      provisions: "Ceiling price orders issued under Para 4, 6, and 19. Prohibits hospitals and distributors from selling above gazette maximum rates.",
    },
    {
      authority: "Central Government Health Scheme (CGHS)",
      act: "Ministry of Health & Family Welfare Standard Package Orders",
      scope: "ICU Bed Rates, Nursing Charges, Operating Theatre Bundling",
      provisions: "Mandates that ICU package rates include 24-hour nursing, monitoring, and standard room consumable items without separate line-item unbundling.",
    },
    {
      authority: "Insurance Regulatory and Development Authority of India (IRDAI)",
      act: "Health Insurance Regulations & Master Circulars",
      scope: "Non-Payable Deductions & TPA Proportionate Deductions",
      provisions: "Annexure I non-payable item schedules. Restricts insurers and TPAs from arbitrary disallowances on necessary inpatient medical items.",
    },
    {
      authority: "Bharatiya Sakshya Adhiniyam, 2023 / Section 65B Evidence Act",
      act: "Electronic Evidence Admissibility Framework",
      scope: "Tamper-Evident SHA-256 Dispute Certificates",
      provisions: "Statutory certification verifying that automated digital bill audit logs and gazette rate comparisons are authentic and court-admissible.",
    },
    {
      authority: "Digital Personal Data Protection Act (DPDP), 2023",
      act: "Ministry of Electronics and Information Technology (MeitY)",
      scope: "Zero-Knowledge Encryption & Patient Data Sovereignty",
      provisions: "Grants patients absolute ownership of medical data, mandatory encryption at rest, and 1-click permanent right-to-erasure.",
    },
  ];

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
            <span>STATUTORY COMPLIANCE ARCHITECTURE</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[56px] text-[#202128] leading-[1.1] tracking-tight">
            Indian Statutory Healthcare Frameworks
          </h1>

          <p className="text-sm sm:text-lg text-[#606470] max-w-2xl mx-auto font-medium">
            How CuraVeris grounds every forensic hospital bill audit in gazette notifications, government price orders, and legal admissibility standards.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-[#606470] pt-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#43A8B2]" />
              Regulatory Version: 2026.2
            </span>
            <span>•</span>
            <span className="font-bold text-[#86C159]">800+ Active Price Caps</span>
          </div>
        </div>
      </section>

      {/* 3. COMPLIANCE FRAMEWORKS LIST */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {complianceFrameworks.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.04] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#43A8B2] uppercase tracking-wider block">
                    {item.act}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl text-[#202128] mt-0.5">
                    {item.authority}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFF1F3] text-[#202128] text-xs font-bold w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#43A8B2]" />
                  Active Enforcement
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                <div className="sm:col-span-4 p-3.5 bg-[#F5F7FB] rounded-2xl">
                  <strong className="text-[#202128] block mb-1">Audited Scope:</strong>
                  <span className="text-[#606470]">{item.scope}</span>
                </div>
                <div className="sm:col-span-8 p-3.5 bg-[#F5F7FB] rounded-2xl">
                  <strong className="text-[#202128] block mb-1">Statutory Mandate:</strong>
                  <span className="text-[#606470]">{item.provisions}</span>
                </div>
              </div>
            </div>
          ))}
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
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/data-policy" className="hover:text-white">Data Policy</Link>
              <Link href="/compliance" className="text-white">Statutory Compliance</Link>
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
