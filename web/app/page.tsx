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
  FileSearch,
  Calculator,
  Search,
  Copy,
  Check,
  Zap,
  Activity,
  Sliders,
  ChevronRight,
  Receipt,
  LayoutDashboard,
  FileSpreadsheet,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { LogoIcon } from "@/components/ui/Logo";

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Interactive Live Calculator State
  const [billAmount, setBillAmount] = useState<number>(350000);
  const [treatmentType, setTreatmentType] = useState<string>("cardiology");
  const [hasStent, setHasStent] = useState<boolean>(true);
  const [hasDuplicateIcu, setHasDuplicateIcu] = useState<boolean>(true);
  const [hasPharmacyMarkup, setHasPharmacyMarkup] = useState<boolean>(true);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  // Quick Price Cap Search State
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sampleItems = [
    { name: "Coronary DES Stent (Drug Eluting)", category: "NPPA Device", cap: 30080, typical: 65000, citation: "NPPA Order S.O. 1335(E)" },
    { name: "Total Knee Implant (Cobalt Chromium)", category: "NPPA Ortho", cap: 54000, typical: 115000, citation: "NPPA Order S.O. 2668(E)" },
    { name: "Paracetamol IV Infusion 100ml", category: "DPCO NLEM", cap: 28.5, typical: 180, citation: "DPCO 2013 Table-1" },
    { name: "ICU Bed & Monitoring (Per Day Tier-1)", category: "CGHS Package", cap: 5400, typical: 18000, citation: "CGHS Revised Rates 2023" },
    { name: "Meropenem 1g Injection", category: "DPCO NLEM", cap: 420, typical: 1450, citation: "NPPA Ceiling Notification 2024" },
  ];

  const filteredItems = sampleItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computed Savings
  const calculateEstimatedSavings = () => {
    let savings = 0;
    if (hasStent) savings += 34920;
    if (hasDuplicateIcu) savings += 22500;
    if (hasPharmacyMarkup) savings += Math.round(billAmount * 0.08);
    return Math.min(savings, Math.round(billAmount * 0.45));
  };

  const estimatedSavings = calculateEstimatedSavings();
  const savingsPercent = Math.round((estimatedSavings / billAmount) * 100);

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

  const copySampleLetter = () => {
    navigator.clipboard.writeText(
      `To,\nThe Medical Superintendent / Billing Department,\nApollo Hospitals\n\nSubject: Formal Complaint regarding Hospital Bill (Estimated Extra Charge: ₹${estimatedSavings.toLocaleString('en-IN')})\n\nAccording to government price caps for medical devices and medicines, the billed items exceed the allowed limits. Furthermore, duplicate ICU and nursing charges were applied.\n\nPlease refund or adjust the surplus ₹${estimatedSavings.toLocaleString('en-IN')} within 7 working days.\n\nSincerely,\nPatient Representative`
    );
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col selection:bg-brand-accent/20 selection:text-brand-accent relative overflow-x-hidden font-sans">
      {/* Background Animated Gradient Mesh & Tech Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-br from-brand-accent/10 via-brand-primary/5 to-transparent blur-3xl rounded-full opacity-70" />
        <div className="absolute top-[600px] -left-40 w-[600px] h-[600px] bg-brand-primary/5 blur-3xl rounded-full" />
        <div className="absolute top-[1200px] -right-40 w-[600px] h-[600px] bg-brand-accent/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-xs">
        <div className="max-w-[1360px] h-[60px] sm:h-[64px] mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <LogoIcon size={32} />
            <div className="flex flex-col truncate">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-brand-primary leading-tight truncate">
                CuraVeris
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold text-brand-accent tracking-wider uppercase">
                Government Price Caps & Rules
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-text-secondary">
            <Link href="/" className="px-3 py-1.5 rounded-md text-brand-primary font-bold bg-bg-secondary">
              Overview
            </Link>
            <Link href="/dashboard" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Dashboard
            </Link>
            <Link href="/bills/upload" className="px-3 py-1.5 rounded-md text-brand-accent bg-brand-accent-light hover:bg-brand-accent/20 transition-colors">
              Check a Bill
            </Link>
            <Link href="/bills" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              My Bills
            </Link>
            <a href="#simulator" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Savings Calculator
            </a>
            <a href="#price-checker" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Government Price Limits
            </a>
            <Link href="/account" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Privacy & Data
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs px-2.5 sm:px-3 h-8 sm:h-9">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="font-semibold text-xs shadow-xs px-3 sm:px-4 h-8 sm:h-9">
                <span className="hidden sm:inline">Check My Bill for Free</span>
                <span className="sm:hidden">Free Check</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-12 sm:pb-18 lg:pt-20 lg:pb-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-brand-accent-light border border-brand-accent/20 rounded-full text-brand-accent text-[11px] sm:text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
              <span>Free Patient Bill Check • Protect Your Family</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-text-primary leading-[1.12] sm:leading-[1.08] tracking-[-0.03em]">
              Was Your Hospital Bill <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary">
                Too High?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-[1.6] sm:leading-[1.65] max-w-[560px] font-normal">
              We check your hospital bill line by line against government-approved prices. If they charged you too much, we find it — and help you fight back.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-[48px] sm:h-[54px] px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-md">
                  Check My Bill for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#simulator">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto h-[48px] sm:h-[54px] text-sm sm:text-base border border-border-default hover:bg-bg-secondary">
                  <Calculator className="w-4 h-4 mr-2 text-brand-accent" />
                  Try Savings Calculator
                </Button>
              </a>
            </div>

            <p className="text-xs text-text-tertiary">
              Free to use · Takes about 5–10 minutes · No technical knowledge needed
            </p>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-text-secondary font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>100% Free for Patients</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                <span>Your Data is Private & Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>Ready Complaint Letters</span>
              </div>
            </div>
          </div>

          {/* Right Column — Interactive Sample Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-border-default p-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-danger via-warning to-brand-accent" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">
                    SAMPLE BILL CHECK
                  </span>
                  <p className="font-heading font-bold text-lg text-text-primary mt-0.5">
                    City Care Hospital
                  </p>
                </div>
                <Badge variant="danger" size="sm" isPulsing>
                  High Concern
                </Badge>
              </div>

              {/* Overcharge Highlight Banner */}
              <div className="my-4 p-4 rounded-xl bg-danger-bg border border-danger/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-danger block">You may have been overcharged</span>
                  <p className="font-mono font-extrabold text-3xl text-danger mt-0.5">
                    ₹47,800
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold">
                    3 Overcharges Found
                  </span>
                  <span className="text-[11px] text-text-secondary block mt-1">
                    Bill Total: ₹3,85,000
                  </span>
                </div>
              </div>

              {/* Finding Items */}
              <div className="space-y-2.5">
                <div className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between border-l-4 border-l-danger">
                  <div>
                    <p className="text-xs font-bold text-text-primary">Heart Stent (Drug Eluting)</p>
                    <span className="text-[11px] text-text-tertiary">Charged above government price cap (₹30,080)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹22,500</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between border-l-4 border-l-danger">
                  <div>
                    <p className="text-xs font-bold text-text-primary">ICU Nursing & Bed (Charged Twice)</p>
                    <span className="text-[11px] text-text-tertiary">This was already included in the room package</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹18,000</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between border-l-4 border-l-warning">
                  <div>
                    <p className="text-xs font-bold text-text-primary">Paracetamol IV 100ml</p>
                    <span className="text-[11px] text-text-tertiary">Government price limit is ₹28.50</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-warning">+₹7,300</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-border-subtle flex gap-2">
                <Link href="/bills/upload" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-xs font-semibold py-2.5">
                    Check My Bill for Free
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={copySampleLetter}
                  className="px-3 py-2 bg-bg-secondary hover:bg-border-default text-text-primary rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? "Copied!" : "Sample Letter"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BAR */}
      <section ref={statsRef} className="relative z-10 bg-bg-secondary py-8 sm:py-12 border-y border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border-default">
          <div className="pt-3 sm:pt-0">
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary">
              {statsVisible ? <CountUp end={82} suffix="%" /> : "82%"}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              Bills Checked that contained extra charges
            </p>
          </div>

          <div className="pt-3 sm:pt-0">
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary">
              {statsVisible ? <CountUp end={42000} prefix="₹" formatter={(v) => `${(v / 1000).toFixed(0)}k`} /> : "₹42k"}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              Extra Charges Found per patient on average
            </p>
          </div>

          <div className="pt-3 sm:pt-0">
            <p className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary">
              {statsVisible ? <CountUp end={100} suffix="%" /> : "100%"}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-medium">
              Complaint Letters Created and ready to send
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE RECOVERY & SAVINGS CALCULATOR */}
      <section id="simulator" className="relative z-10 py-12 sm:py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3 mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-brand-accent-light rounded-full text-brand-accent text-[11px] sm:text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Savings Calculator</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-text-primary tracking-tight">
              See what you could save in seconds
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Adjust the slider and choose items on your bill to see potential extra charges based on government price limits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch bg-white border border-border-default rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-bold text-text-primary">
                    Total amount on the bill
                  </label>
                  <span className="font-mono text-base sm:text-lg font-extrabold text-brand-primary">
                    ₹{billAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1500000"
                  step="10000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-[11px] text-text-tertiary mt-1 font-mono">
                  <span>₹50,000</span>
                  <span>₹7,50,000</span>
                  <span>₹15,00,000</span>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-text-primary block mb-2">
                  Type of Treatment / Hospital Stay
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    { id: "cardiology", label: "Heart / Stent" },
                    { id: "orthopedic", label: "Knee / Joint" },
                    { id: "icu_general", label: "ICU & Surgery" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTreatmentType(t.id)}
                      className={`p-2 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all text-center ${
                        treatmentType === t.id
                           ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                          : "border-border-default bg-bg-secondary text-text-primary hover:border-brand-accent/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                <label className="text-xs sm:text-sm font-bold text-text-primary block">
                  Items to check on your bill
                </label>

                <label className="flex items-start sm:items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer gap-2">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={hasStent}
                      onChange={(e) => setHasStent(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0 mt-0.5 sm:mt-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">Stent / Implant Charged Above Price Limit</p>
                      <span className="text-[11px] text-text-secondary block">Government limit is ₹30,080</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger whitespace-nowrap">+₹34,920 extra</span>
                </label>

                <label className="flex items-start sm:items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer gap-2">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={hasDuplicateIcu}
                      onChange={(e) => setHasDuplicateIcu(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0 mt-0.5 sm:mt-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">ICU Nursing & Daily Charges Billed Separately</p>
                      <span className="text-[11px] text-text-secondary block">Included in room package</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger whitespace-nowrap">+₹22,500 extra</span>
                </label>

                <label className="flex items-start sm:items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer gap-2">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={hasPharmacyMarkup}
                      onChange={(e) => setHasPharmacyMarkup(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0 mt-0.5 sm:mt-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">Medicines Priced Above Government Cap</p>
                      <span className="text-[11px] text-text-secondary block">Sold above maximum regulated price</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger whitespace-nowrap">~8% of bill</span>
                </label>
              </div>
            </div>

            {/* Results Box */}
            <div className="lg:col-span-5 bg-bg-secondary rounded-2xl p-4 sm:p-8 flex flex-col justify-between border border-border-subtle mt-4 lg:mt-0">
              <div className="space-y-4">
                <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
                  Possible Extra Charges
                </span>

                <div>
                  <p className="font-mono font-extrabold text-3xl sm:text-5xl text-brand-primary">
                    ₹{estimatedSavings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-text-secondary mt-1 font-medium">
                    You may have been overcharged by approx. <strong className="text-danger font-bold">{savingsPercent}%</strong> of your total bill.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-border-default space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Rules Used</span>
                    <span className="font-bold text-text-primary">Government Price Limits</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>What We Provide</span>
                    <span className="font-bold text-text-primary">Ready Complaint Letter</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Outcome</span>
                    <span className="font-bold text-success">High Chance of Refund</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 sm:pt-6 space-y-2.5">
                <Link href="/register" className="block">
                  <Button variant="primary" size="lg" className="w-full text-sm font-bold shadow-md h-[46px] sm:h-[48px]">
                    Check My Bill for Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-text-tertiary">
                  Takes 5 minutes · No payment needed · 100% private
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GOVERNMENT PRICE LIMITS LOOKUP */}
      <section id="price-checker" className="relative z-10 py-12 sm:py-18 bg-bg-secondary border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8 sm:mb-10">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Look Up Government Price Caps
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Search official government-approved prices for stents, knee implants, common medicines, and hospital beds.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine, stent, knee implant, bed rate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white rounded-xl border border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-xs sm:text-sm font-medium placeholder:text-text-tertiary outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-w-[1100px] mx-auto">
            {filteredItems.map((item) => (
              <div
                key={item.name}
                className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow space-y-2.5 sm:space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-accent-light text-brand-accent text-[10px] font-extrabold uppercase">
                    {item.category === "NPPA Device" ? "Medical Device Cap" : item.category === "NPPA Ortho" ? "Joint Implant Cap" : item.category === "DPCO NLEM" ? "Medicine Price Cap" : "Government Rate"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono truncate">{item.citation}</span>
                </div>

                <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                  {item.name}
                </h4>

                <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-bold">Government Cap</span>
                    <span className="font-mono font-bold text-success text-xs sm:text-sm">
                      ₹{item.cap.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-bold">Typical Hospital Charge</span>
                    <span className="font-mono font-bold text-danger text-xs sm:text-sm line-through">
                      ₹{item.typical.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 py-12 sm:py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex px-3.5 py-1 bg-brand-accent-light rounded-full text-brand-accent text-xs font-bold">
              How It Works
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-text-primary tracking-tight">
              Three simple steps to check your bill
            </h2>
            <p className="text-xs sm:text-base text-text-secondary">
              No technical or medical knowledge needed. We do all the checking for you.
            </p>
          </div>

          <div className="mt-8 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Step 1 */}
            <Card padding="lg" className="relative space-y-3 sm:space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors p-4 sm:p-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-border-default font-heading select-none absolute top-4 sm:top-6 right-4 sm:right-6">
                01
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-text-primary pt-1 sm:pt-2">
                1. Send Us Your Bill
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-[1.6]">
                Take a photo or upload a PDF. Any format works.
              </p>
            </Card>

            {/* Step 2 */}
            <Card padding="lg" className="relative space-y-3 sm:space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors p-4 sm:p-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-border-default font-heading select-none absolute top-4 sm:top-6 right-4 sm:right-6">
                02
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-text-primary pt-1 sm:pt-2">
                2. We Check Every Charge
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-[1.6]">
                Our system compares each item to the government&apos;s approved price list.
              </p>
            </Card>

            {/* Step 3 */}
            <Card padding="lg" className="relative space-y-3 sm:space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors p-4 sm:p-6">
              <span className="text-4xl sm:text-5xl font-extrabold text-border-default font-heading select-none absolute top-4 sm:top-6 right-4 sm:right-6">
                03
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-text-primary pt-1 sm:pt-2">
                3. Get Your Results
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-[1.6]">
                See exactly what was overcharged and what you can do about it.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. WE CHECK YOUR BILL AGAINST */}
      <section className="relative z-10 bg-bg-secondary py-12 sm:py-18 lg:py-22 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8 sm:mb-12">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              We check your bill against:
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Official government rules and consumer protection guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Medical device price caps</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Government limits on stents, implants, and lenses</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Medicine price caps</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Government limits on drug prices</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Central Government Health Scheme (CGHS)</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Official government procedure rates and hospital bed limits</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">Insurance non-payable rules</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Items insurers are not allowed to charge you for</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">GST rules</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Which hospital services are tax-exempt</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3 sm:gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">PM-JAY package rates</h4>
                <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Limits for government health insurance beneficiaries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative z-10 bg-brand-primary text-white py-10 sm:py-14 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <LogoIcon size={32} />
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  CuraVeris
                </span>
              </div>
              <p className="text-xs text-white/60 max-w-sm">
                Helping patients and families in India check hospital bills against government price limits.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/70 font-medium">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Free Account
              </Link>
              <Link href="/bills/upload" className="hover:text-white transition-colors">
                Check a Bill
              </Link>
              <a href="#simulator" className="hover:text-white transition-colors">
                Savings Calculator
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-white/40 font-mono text-center sm:text-left">
            <p>© {new Date().getFullYear()} CuraVeris. All rights reserved.</p>
            <p>Your health data is 100% private and protected.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

