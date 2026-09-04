"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Send,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hospitalName: "",
    billAmount: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <Link href="/about" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              About
            </Link>
            <Link href="/security" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Security
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full text-[#202128] bg-white shadow-xs">
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
            <span>PATIENT ADVOCACY & DISPUTE GRIEVANCE DESK</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#202128] leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Get in touch with our{" "}
            <span className="grassfeld-gradient-text">forensic advocates.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] max-w-2xl mx-auto font-medium">
            Need urgent assistance disputing a hospital invoice or insurance claim deduction? Our team is standing by to help you exercise your legal rights.
          </p>
        </div>
      </section>

      {/* 3. CONTACT FORM & DESK DETAILS */}
      <section className="relative z-10 pb-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Bento */}
            <div className="lg:col-span-5 bg-[#F5F7FB] rounded-[36px] p-8 border border-black/[0.06] space-y-6">
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-2xl text-[#202128]">Dispute Support Desk</h3>
                <p className="text-xs sm:text-sm text-[#606470]">
                  Available Monday – Saturday, 9:00 AM to 7:00 PM IST for urgent patient escalation.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-black/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-[#DFF1F3] flex items-center justify-center text-[#43A8B2]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#606470] block">Email Support</span>
                    <span className="font-bold text-xs text-[#202128]">grievance@curaveris.org</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-black/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-[#E7E3FF] flex items-center justify-center text-[#5E84E2]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#606470] block">Regulatory Desk</span>
                    <span className="font-bold text-xs text-[#202128]">NPPA & Consumer Portal Liaison</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-black/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-[#DDECFD] flex items-center justify-center text-[#43A8B2]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#606470] block">Privacy & Security</span>
                    <span className="font-bold text-xs text-[#202128]">dpo@curaveris.org</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <div className="lg:col-span-7 bg-white rounded-[36px] p-8 sm:p-10 border border-black/[0.06] shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#DFF1F3] text-[#43A8B2] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-[#202128]">Grievance Request Received</h3>
                  <p className="text-sm text-[#606470] max-w-md mx-auto">
                    Our medical billing advocate team has received your details and will review the case against NPPA price ceilings within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-extrabold text-2xl text-[#202128] mb-6">Send a Case Inquiry</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#202128] block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Mr. / Ms. ..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-[#F5F7FB] border border-black/[0.06] focus:outline-none focus:border-[#43A8B2]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#202128] block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-[#F5F7FB] border border-black/[0.06] focus:outline-none focus:border-[#43A8B2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#202128] block mb-1.5">Hospital Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Fortis / Apollo / Max"
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-[#F5F7FB] border border-black/[0.06] focus:outline-none focus:border-[#43A8B2]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#202128] block mb-1.5">Total Inpatient Bill (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2,45,000"
                        value={formData.billAmount}
                        onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-[#F5F7FB] border border-black/[0.06] focus:outline-none focus:border-[#43A8B2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#202128] block mb-1.5">Dispute Details & Line Items</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe what charges seemed abnormal (e.g. stent price beyond cap, duplicate nursing fees, non-payable deductions)..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-4 text-xs rounded-xl bg-[#F5F7FB] border border-black/[0.06] focus:outline-none focus:border-[#43A8B2]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-full font-bold text-xs bg-[#202128] hover:bg-black text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
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
