"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lock,
  FileCheck2,
  Zap,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

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
            <Link href="/features" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="px-4 py-2 rounded-full text-[#202128] bg-white shadow-xs">
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
      <section className="relative z-10 pt-32 sm:pt-40 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#43A8B2]" />
            <span>FAIR, TRANSPARENT PRICING FOR PATIENTS & FAMILIES</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#202128] leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Transparent protection for every{" "}
            <span className="grassfeld-gradient-text">patient budget.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] max-w-xl mx-auto font-medium">
            100% free for individual patient checks. Upgrade for multi-member family sharing, dedicated advocate dispute filing, and legal escrow.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-[#EDF0FB] p-1.5 rounded-full inline-flex items-center gap-1 border border-black/[0.04]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-white text-[#202128] shadow-sm" : "text-[#606470] hover:text-[#202128]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly" ? "bg-[#202128] text-white shadow-sm" : "text-[#606470] hover:text-[#202128]"
                }`}
              >
                <span>Yearly</span>
                <span className="bg-[#86C159] text-[#202128] text-[10px] font-extrabold px-2 py-0.5 rounded-full">Save 25%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-TIER PRICING CARDS WITH 3D CROWNS */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Card 1: Free Patient Tier */}
            <div className="bg-[#F5F7FB] rounded-[36px] p-8 sm:p-10 border border-black/[0.06] flex flex-col justify-between space-y-8 hover:shadow-lg transition-all">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-xs">
                  <img src="/assets/scraped/icon_silver_crown.png" alt="Free Tier" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-2xl text-[#202128]">Patient Free</h3>
                  <p className="text-xs text-[#606470] mt-1">For individual patients checking an inpatient hospital bill.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-extrabold text-4xl text-[#202128]">₹0</span>
                  <span className="text-xs text-[#606470] font-bold">/ forever free</span>
                </div>
                <ul className="space-y-3 pt-2 text-xs text-[#202128] font-semibold">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Instant OCR bill parsing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>NPPA Price Cap checking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Basic overcharge breakdown</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Standard PDF report export</span>
                  </li>
                </ul>
              </div>

              <Link href="/bills/upload" className="w-full">
                <button className="w-full h-12 rounded-full font-bold text-xs bg-white hover:bg-black hover:text-white text-[#202128] border border-black/[0.08] shadow-xs transition-colors">
                  Start Free Audit
                </button>
              </Link>
            </div>

            {/* Card 2: Family Shield (Highlighted) */}
            <div className="bg-[#DFF1F3] rounded-[36px] p-8 sm:p-10 border-2 border-[#43A8B2] flex flex-col justify-between space-y-8 shadow-[0_16px_40px_rgba(67,168,178,0.15)] relative scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#202128] text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-full tracking-wider shadow-xs">
                MOST POPULAR
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-xs">
                  <img src="/assets/scraped/icon_gold_crown.avif" alt="Family Shield" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-2xl text-[#202128]">Family Shield</h3>
                  <p className="text-xs text-[#606470] mt-1">Complete protection and dispute generation for the entire household.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-extrabold text-4xl text-[#202128]">
                    {billingCycle === "yearly" ? "₹499" : "₹699"}
                  </span>
                  <span className="text-xs text-[#606470] font-bold">/ year (up to 5 members)</span>
                </div>
                <ul className="space-y-3 pt-2 text-xs text-[#202128] font-semibold">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                    <span>Everything in Patient Free</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                    <span>Section 65B SHA-256 certified dispute notices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                    <span>TPA Insurance Claim Reconciler</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                    <span>Multi-member family vault sharing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
                    <span>24/7 Priority Advocate AI assistance</span>
                  </li>
                </ul>
              </div>

              <Link href="/register" className="w-full">
                <button className="w-full h-12 rounded-full font-bold text-xs bg-[#202128] hover:bg-black text-white shadow-md transition-transform hover:scale-[1.02]">
                  Upgrade to Family Shield
                </button>
              </Link>
            </div>

            {/* Card 3: Corporate & Legal Desk */}
            <div className="bg-[#F5F7FB] rounded-[36px] p-8 sm:p-10 border border-black/[0.06] flex flex-col justify-between space-y-8 hover:shadow-lg transition-all">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-xs">
                  <img src="/assets/scraped/icon_business_crown.avif" alt="Corporate" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-2xl text-[#202128]">Legal & Corporate</h3>
                  <p className="text-xs text-[#606470] mt-1">For employee wellness programs, lawyers, and patient advocacy groups.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-extrabold text-4xl text-[#202128]">
                    {billingCycle === "yearly" ? "₹2,499" : "₹3,199"}
                  </span>
                  <span className="text-xs text-[#606470] font-bold">/ corporate seat</span>
                </div>
                <ul className="space-y-3 pt-2 text-xs text-[#202128] font-semibold">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Unlimited batch bill auditing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Direct API & Webhook integration</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Consumer court petition auto-filing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#86C159] flex-shrink-0" />
                    <span>Dedicated forensic legal advisor</span>
                  </li>
                </ul>
              </div>

              <Link href="/contact" className="w-full">
                <button className="w-full h-12 rounded-full font-bold text-xs bg-white hover:bg-black hover:text-white text-[#202128] border border-black/[0.08] shadow-xs transition-colors">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
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
