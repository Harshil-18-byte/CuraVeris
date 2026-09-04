"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  FileCheck2,
  Scale,
  Sparkles,
  ArrowRight,
  Calculator,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Receipt,
  ScanLine,
  Zap,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  Shield,
  Building2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LogoIcon } from "@/components/ui/Logo";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<"audit" | "caps" | "dispute" | "reconcile" | "vault">("audit");

  return (
    <div className="min-h-screen bg-white text-[#202128] font-sans antialiased overflow-x-hidden selection:bg-[#43A8B2]/20 selection:text-[#202128]">
      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="h-[66px] rounded-full bg-[#EDF0FB]/90 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-[#202128] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <LogoIcon size={20} />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-[#202128]">
              Cura<span className="text-[#43A8B2]">Veris</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-[#606470]">
            <Link href="/features" className="px-4 py-2 rounded-full text-[#202128] bg-white shadow-xs">
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
      <section className="relative z-10 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#43A8B2]" />
            <span>POWERFUL FORENSIC FEATURES FOR EVERY PATIENT</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-[#202128] leading-[1.08] tracking-[-0.035em] max-w-4xl mx-auto">
            Everything you need to audit, verify, and dispute{" "}
            <span className="grassfeld-gradient-text">hospital bills.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] max-w-2xl mx-auto font-medium">
            Explore our state-of-the-art suite of statutory audit algorithms, legal notice generators, and patient privacy vaults.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/bills/upload">
              <button className="h-[52px] px-8 text-sm font-bold shadow-lg bg-[#202128] hover:bg-black text-white rounded-full flex items-center gap-2 transition-all hover:scale-[1.02]">
                <span>Upload Bill to Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="h-[52px] px-8 text-sm font-bold border border-black/[0.08] bg-white hover:bg-[#F5F7FB] text-[#202128] rounded-full shadow-xs flex items-center gap-2 transition-all">
                <span>View Free Patient Plans</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 3D FEATURE GRID */}
      <section className="relative z-10 py-12 bg-[#F5F7FB] border-y border-black/[0.05]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#DFF1F3] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_analytics_3d.avif" alt="Audit" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Automated OCR & Forensic Parsing
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Extracts every itemized medicine, stent, syringe, doctor consultation, and nursing line item with sub-millimeter precision.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#43A8B2]">
                <span>NPPA Cross-Referenced</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#E7E3FF] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_bomb_3d.png" alt="Price Caps" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Statutory Price Cap Enforcement
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Real-time database of 800+ DPCO ceiling prices, cardiac stent caps, and orthopedic knee replacement maximum rates.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#5E84E2]">
                <span>Section 3 DPCO Compliant</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#DDECFD] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_folder_3d.png" alt="Section 65B" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Section 65B Certified Legal Notices
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Generates court-admissible electronic dispute petitions with SHA-256 cryptographic hashes for hospital grievance desks.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#43A8B2]">
                <span>Legally Admissible Proof</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#DFF1F3] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_piggy_3d.webp" alt="TPA Reconciler" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  TPA Insurance Claim Reconciler
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Identifies erroneous deductions made by third-party administrators (TPAs) against IRDAI master non-payable schedules.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#86C159]">
                <span>IRDAI Schedule Aligned</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#E7E3FF] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_magic_3d.png" alt="Advocate AI" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  CuraVeris Advocate AI Intelligence
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Ask any medical billing question in plain English. Get instant statutory citations, dispute guidelines, and refund calculations.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#5E84E2]">
                <span>24/7 Forensic Assistant</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-sm space-y-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#DDECFD] flex items-center justify-center p-2.5 shadow-xs">
                <img src="/assets/scraped/icon_share_3d.png" alt="DPDP Vault" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  DPDP 2023 Patient Privacy Vault
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Full zero-knowledge encryption, zero monetization of medical records, and 1-click permanent data erasure anytime.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#43A8B2]">
                <span>DPDP 2023 Certified</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM DEVICE DEMO */}
      <section className="relative z-10 py-16 sm:py-24 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128]">
              Seamless across desktop and mobile
            </h2>
            <p className="text-sm text-[#606470]">
              Snap bills on your smartphone during hospital discharge, or perform comprehensive forensic analysis on desktop.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-[#F5F7FB] rounded-[36px] p-8 border border-black/[0.06] text-center space-y-4">
              <div className="max-w-md mx-auto">
                <img src="/assets/scraped/device_computer_model.avif" alt="Desktop Navigator" className="w-full h-auto object-contain" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-[#202128]">CuraVeris Navigator for Desktop</h3>
              <p className="text-xs text-[#606470]">Detailed CSV exports, hospital comparison charts, and bulk petition filing.</p>
            </div>

            <div className="bg-[#F5F7FB] rounded-[36px] p-8 border border-black/[0.06] text-center space-y-4">
              <div className="max-w-xs mx-auto">
                <img src="/assets/scraped/device_mobile_model.avif" alt="Mobile Scanner" className="w-full h-auto object-contain" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-[#202128]">CuraVeris Mobile Scanner</h3>
              <p className="text-xs text-[#606470]">Instant OCR camera capture with 5-second overcharge warning alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="relative z-10 bg-[#1B1C20] text-white pt-16 pb-12 border-t border-white/10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-12 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white text-[#202128] flex items-center justify-center font-bold">
                <LogoIcon size={20} />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Cura<span className="text-[#43A8B2]">Veris</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-xs font-bold text-white/70">
              <Link href="/features" className="hover:text-white">Features</Link>
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/security" className="hover:text-white">Security</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/40">
            © 2026 CuraVeris Technologies Inc. All rights reserved. Statutory compliance partner under NPPA, DPCO 2013, and DPDP Act 2023.
          </p>
        </div>
      </footer>
    </div>
  );
}
