"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  TrendingDown,
  FileText,
  Lock,
  Scale,
  Sparkles,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col selection:bg-brand-accent/20 selection:text-brand-accent">
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-brand-accent flex items-center justify-center text-white font-heading font-bold text-base shadow-xs">
              C
            </div>
            <span className="font-heading font-bold text-xl text-text-primary tracking-tight">
              CuraVeris
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Check My Bill Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (55%) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent-light rounded-full text-brand-accent text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Razorpay Hack 2025 · Healthcare Finance</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[52px] text-text-primary leading-[1.1] tracking-[-0.04em]">
              Was your hospital bill too high?
            </h1>

            <p className="text-lg text-text-secondary leading-[1.6] max-w-[460px] font-normal">
              We check every charge against government-approved prices. Find overcharges, generate complaint letters, and understand your financial risk — in minutes.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-[52px] px-8 text-base">
                  Check My Bill Free
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto h-[52px] text-base">
                  See how it works
                </Button>
              </a>
            </div>

            {/* Trust Signals */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={1.5} />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={1.5} />
                <span>No technical knowledge needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={1.5} />
                <span>Results in 5–10 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column (45%) — Product UI Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-xl shadow-xl border border-border-default p-6 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-300">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-text-tertiary tracking-wider block">
                    Bill Check Summary
                  </span>
                  <p className="font-heading font-bold text-base text-text-primary mt-0.5">
                    Apollo Hospitals
                  </p>
                </div>
                <Badge variant="danger" size="sm" isPulsing>
                  High Concern
                </Badge>
              </div>

              {/* Overcharge Highlight Banner */}
              <div className="my-5 p-4 rounded-lg bg-danger-bg border border-danger/20">
                <span className="text-xs font-medium text-danger block">Possible Extra Charges Found</span>
                <p className="font-mono font-bold text-3xl text-danger mt-1">
                  ₹47,800
                </p>
                <span className="text-xs text-text-secondary mt-1 block">
                  3 items billed above government caps
                </span>
              </div>

              {/* 3 Sample Finding Rows */}
              <div className="space-y-2.5">
                <div className="p-3 bg-bg-secondary rounded-md flex items-center justify-between border-l-[3px] border-l-danger">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Coronary Stent (DES)</p>
                    <span className="text-[11px] text-text-tertiary">NPPA ceiling limit ₹30,080</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹22,500</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-md flex items-center justify-between border-l-[3px] border-l-danger">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">ICU Monitoring (Double)</p>
                    <span className="text-[11px] text-text-tertiary">Duplicate charge on Day 3</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹18,000</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-md flex items-center justify-between border-l-[3px] border-l-warning">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Paracetamol IV 100ml</p>
                    <span className="text-[11px] text-text-tertiary">DPCO price list limit</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-warning">+₹7,300</span>
                </div>
              </div>

              {/* Mockup Action Button */}
              <div className="mt-5 pt-3 border-t border-border-subtle">
                <div className="h-10 bg-brand-accent text-white rounded-md flex items-center justify-center font-medium text-xs shadow-xs">
                  Create Complaint Letter →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BAR (ANIMATED COUNT-UP) */}
      <section ref={statsRef} className="bg-bg-secondary py-10 border-y border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border-default">
          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-bold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={82} suffix="%" /> : "82%"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              of hospital bills in India contain overcharges
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-bold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={42000} prefix="₹" formatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /> : "₹42k"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              average overcharge found per audited bill
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-bold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={100} suffix="%" /> : "100%"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              free, confidential & DPDP 2023 protected
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="inline-flex px-3 py-1 bg-brand-accent-light rounded-full text-brand-accent text-xs font-semibold">
              How it works
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary tracking-tight">
              Three simple steps to fair billing
            </h2>
            <p className="text-base text-text-secondary">
              You do not need legal or financial expertise. We do the heavy lifting.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card padding="lg" className="relative space-y-4">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary pt-2">
                Upload your bill
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Take a photo or upload a PDF of your hospital bill. Our system reads every medicine, stent, ICU day, and lab test.
              </p>
            </Card>

            {/* Step 2 */}
            <Card padding="lg" className="relative space-y-4">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <Scale className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary pt-2">
                We check the prices
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Every item is compared against official government price lists (NPPA, CGHS, PM-JAY, DPCO) and checked for double billing.
              </p>
            </Card>

            {/* Step 3 */}
            <Card padding="lg" className="relative space-y-4">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-text-primary pt-2">
                Download your letter
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Get a plain-English dispute letter and Section 65B legal certificate ready to submit to the hospital, insurer, or consumer forum.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. GOVERNMENT FRAMEWORKS SECTION */}
      <section className="bg-bg-secondary py-16 lg:py-20 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
              We check your bill against 6 official frameworks
            </h2>
            <p className="text-sm text-text-secondary">
              Every finding quotes the exact government rule or ceiling order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">NPPA Medical Device Caps</h4>
                <p className="text-xs text-text-secondary mt-0.5">Ceiling prices on stents, orthopedic knee implants, and oxygen</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">DPCO Essential Medicines (NLEM)</h4>
                <p className="text-xs text-text-secondary mt-0.5">Price controls on over 800+ scheduled life-saving drugs</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">CGHS / PM-JAY Package Rates</h4>
                <p className="text-xs text-text-secondary mt-0.5">Standardised benchmark rates across tier-1, tier-2, and tier-3 cities</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Section 65B Electronic Proof</h4>
                <p className="text-xs text-text-secondary mt-0.5">Tamper-evident Merkle tree cryptographic certification (BSA 2023)</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Consumer Protection Act 2019</h4>
                <p className="text-xs text-text-secondary mt-0.5">Statutory protection against unfair trade practices and overbilling</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-md bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">DPDP Act 2023 Privacy</h4>
                <p className="text-xs text-text-secondary mt-0.5">Encrypted health data processing with full right to erasure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-brand-primary text-white py-12 mt-auto">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-brand-accent text-white flex items-center justify-center font-heading font-bold text-sm">
                  C
                </div>
                <span className="font-heading font-bold text-lg text-white">CuraVeris</span>
              </div>
              <p className="text-xs text-white/60">
                India&apos;s automated medical billing verification engine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-white/60">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Free Account
              </Link>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} CuraVeris. All rights reserved.</p>
            <p>Processed in compliance with Digital Personal Data Protection (DPDP) Act 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
