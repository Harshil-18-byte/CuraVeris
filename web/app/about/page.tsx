"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Heart,
  Scale,
  Users,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function AboutPage() {
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
            <Link href="/pricing" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full text-[#202128] bg-white shadow-xs">
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
            <span>OUR MISSION & COMMITMENT</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#202128] leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Restoring statutory transparency to{" "}
            <span className="grassfeld-gradient-text">healthcare billing.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] max-w-2xl mx-auto font-medium">
            CuraVeris was founded on the belief that no patient or family should endure unlawful hospital overcharges during their most vulnerable moments.
          </p>
        </div>
      </section>

      {/* 3. STATUTORY STANDARDS & ADMISSIBILITY */}
      <section className="relative z-10 py-12 bg-[#F5F7FB] border-y border-black/[0.05]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <p className="text-xs font-extrabold text-[#606470] uppercase tracking-widest">
            Statutory Frameworks & Legal Admissibility Benchmarks
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DBF1F4] flex items-center justify-center font-bold text-[#43A8B2] text-xs">
                NPPA
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#606470] block">Price Ceilings</span>
                <span className="text-xs font-extrabold text-[#202128]">DPCO 2013 Statutory Limits</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF0FB] flex items-center justify-center font-bold text-[#202128] text-xs">
                65B
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#606470] block">Legal Proof</span>
                <span className="text-xs font-extrabold text-[#202128]">Section 65B Electronic Seal</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DFF1F3] flex items-center justify-center font-bold text-[#43A8B2] text-xs">
                DPDP
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#606470] block">Data Sovereignty</span>
                <span className="text-xs font-extrabold text-[#202128]">DPDP Act 2023 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES BENTO */}
      <section className="relative z-10 py-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128]">
              Our Core Principles
            </h2>
            <p className="text-sm text-[#606470]">
              Every line of code and audit algorithm is built around patient protection and statutory truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#DFF1F3] rounded-[32px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#43A8B2] shadow-xs">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#202128]">Statutory Rigor</h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                We strictly ground every claim in verifiable gazette notifications from NPPA, DPCO 2013, and CGHS schedules.
              </p>
            </div>

            <div className="bg-[#E7E3FF] rounded-[32px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#5E84E2] shadow-xs">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#202128]">Patient-First Sovereignty</h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                We never monetize medical records, sell patient lead data, or accept hospital kickbacks.
              </p>
            </div>

            <div className="bg-[#DDECFD] rounded-[32px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#43A8B2] shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#202128]">Cryptographic Proof</h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                We produce SHA-256 sealed electronic evidence that stands up in legal and regulatory proceedings.
              </p>
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
