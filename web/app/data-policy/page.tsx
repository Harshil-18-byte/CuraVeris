"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  Layers,
  Key,
  Trash2,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function DataPolicyPage() {
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
            <Database className="w-4 h-4 text-[#43A8B2]" />
            <span>DATA ENCRYPTION & PATIENT SOVEREIGNTY ARCHITECTURE</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[56px] text-[#202128] leading-[1.1] tracking-tight">
            Data Policy & Cryptographic Vault
          </h1>

          <p className="text-sm sm:text-lg text-[#606470] max-w-2xl mx-auto font-medium">
            How your hospital records are encrypted, processed in ephemeral memory, and permanently erasable upon patient demand.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-[#606470] pt-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#43A8B2]" />
              Updated: March 2026
            </span>
            <span>•</span>
            <span className="font-bold text-[#43A8B2]">Zero-Knowledge Vault</span>
          </div>
        </div>
      </section>

      {/* 3. DATA POLICY PILLARS */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#DFF1F3] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <Key className="w-6 h-6 text-[#43A8B2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">Envelope Encryption</h3>
              <p className="text-xs text-[#606470] leading-relaxed">Unique AES-256 data keys per patient record.</p>
            </div>
            <div className="bg-[#E7E3FF] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <Zap className="w-6 h-6 text-[#5E84E2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">Ephemeral Ingestion</h3>
              <p className="text-xs text-[#606470] leading-relaxed">OCR memory purged immediately after audit extraction.</p>
            </div>
            <div className="bg-[#DDECFD] rounded-3xl p-6 space-y-2 border border-black/[0.04]">
              <Trash2 className="w-6 h-6 text-[#43A8B2]" />
              <h3 className="font-heading font-extrabold text-base text-[#202128]">Permanent Purge</h3>
              <p className="text-xs text-[#606470] leading-relaxed">Cryptographic wipe of all backups on erasure request.</p>
            </div>
          </div>

          <div className="bg-white rounded-[36px] p-8 sm:p-12 border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-8 text-xs sm:text-sm text-[#606470] leading-relaxed">
            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                1. Patient Data Sovereignty
              </h2>
              <p>
                In accordance with Section 6 of the DPDP Act 2023, CuraVeris treats all medical documents as the exclusive personal property of the patient. We act solely as a Data Fiduciary executing automated statutory compliance audits on your explicit instructions.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                2. Storage & Cryptographic Standards
              </h2>
              <p>
                All patient records, line-item audits, and dispute notices adhere to the following technical safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-[#202128]">Data at Rest:</strong> Encrypted using AES-256 GCM with envelope key wrapping.</li>
                <li><strong className="text-[#202128]">Data in Transit:</strong> TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS).</li>
                <li><strong className="text-[#202128]">Integrity Verification:</strong> SHA-256 cryptographic digests generated for Section 65B dispute certificates.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-heading font-extrabold text-xl text-[#202128]">
                3. Retention & Instant Right-to-Erasure
              </h2>
              <p>
                You have the absolute right to purge your data at any time. When you click &ldquo;Delete Account&rdquo; in your account settings, our systems execute an irreversible cryptographic wipe across primary databases and backup archives within 60 seconds.
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
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/data-policy" className="text-white">Data Policy</Link>
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
