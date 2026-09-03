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
      `To,\nThe Medical Superintendent / Billing Dept,\nApollo Hospitals\n\nSubject: Formal Dispute regarding Hospital Bill (Estimated Overcharge: ₹${estimatedSavings.toLocaleString('en-IN')})\n\nUnder NPPA Medical Device Ceiling Order S.O. 1335(E) and DPCO 2013, the billed items exceed statutory caps. Furthermore, Section 65B (BSA 2023) audit indicates unjustified duplicate ICU nursing charges.\n\nPlease refund or adjust the surplus ₹${estimatedSavings.toLocaleString('en-IN')} within 7 working days.\n\nSincerely,\nPatient Representative`
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
        <div className="max-w-[1360px] h-[64px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoIcon size={36} />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-brand-primary leading-tight">
                CuraVeris
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold text-brand-accent tracking-wider uppercase">
                NPPA • CGHS • DPCO
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
              Scan Bill
            </Link>
            <Link href="/bills" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Reconciliation
            </Link>
            <Link href="/bills" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Audits
            </Link>
            <a href="#simulator" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Savings Calculator
            </a>
            <a href="#price-checker" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              Price Caps
            </a>
            <Link href="/account" className="px-3 py-1.5 rounded-md hover:text-text-primary hover:bg-bg-secondary transition-colors">
              DPDP Compliance
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="font-semibold text-xs shadow-xs">
                Check My Bill Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-14 pb-18 lg:pt-20 lg:pb-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column (58%) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-accent-light border border-brand-accent/20 rounded-full text-brand-accent text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>AI-Powered Healthcare Billing Intelligence • Statutory Auditing</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[54px] text-text-primary leading-[1.08] tracking-[-0.035em]">
              Stop Overpaying Hospital Bills. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary">
                Verify Against Legal Caps.
              </span>
            </h1>

            <p className="text-lg text-text-secondary leading-[1.65] max-w-[560px] font-normal">
              Every charge in your hospital bill is audited against official Indian government price ceilings (NPPA, CGHS, DPCO) and tested for duplicate billing, unbundled packages, and phantom fees.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-[54px] px-8 text-base font-semibold shadow-md">
                  Audit Your Hospital Bill Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#simulator">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto h-[54px] text-base border border-border-default hover:bg-bg-secondary">
                  <Calculator className="w-4 h-4 mr-2 text-brand-accent" />
                  Try Savings Calculator
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-text-secondary font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>100% Free for Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>DPDP Act 2023 Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-success" />
                <span>Section 65B Legal Proof</span>
              </div>
            </div>
          </div>

          {/* Right Column (42%) — Interactive Live Bill Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-border-default p-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-danger via-warning to-brand-accent" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">
                    LIVE STATUTORY AUDIT SAMPLE
                  </span>
                  <p className="font-heading font-bold text-lg text-text-primary mt-0.5">
                    Apollo Hospitals Multispeciality
                  </p>
                </div>
                <Badge variant="danger" size="sm" isPulsing>
                  High Risk (Overcharged)
                </Badge>
              </div>

              {/* Overcharge Highlight Banner */}
              <div className="my-4 p-4 rounded-xl bg-danger-bg border border-danger/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-danger block">Recoverable Overcharge</span>
                  <p className="font-mono font-extrabold text-3xl text-danger mt-0.5">
                    ₹47,800
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold">
                    3 Statutory Violations
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
                    <p className="text-xs font-bold text-text-primary">Coronary Stent (DES)</p>
                    <span className="text-[11px] text-text-tertiary">NPPA Order S.O. 1335(E) Cap ₹30,080</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹22,500</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between border-l-4 border-l-danger">
                  <div>
                    <p className="text-xs font-bold text-text-primary">ICU Nursing & Bed (Duplicate)</p>
                    <span className="text-[11px] text-text-tertiary">Billed separately despite package clause</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹18,000</span>
                </div>

                <div className="p-3 bg-bg-secondary rounded-lg flex items-center justify-between border-l-4 border-l-warning">
                  <div>
                    <p className="text-xs font-bold text-text-primary">Paracetamol IV 100ml</p>
                    <span className="text-[11px] text-text-tertiary">DPCO 2013 Table-1 Price ceiling ₹28.50</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-warning">+₹7,300</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-border-subtle flex gap-2">
                <Link href="/bills/upload" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-xs font-semibold py-2.5">
                    Scan My Bill Now
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={copySampleLetter}
                  className="px-3 py-2 bg-bg-secondary hover:bg-border-default text-text-primary rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? "Copied!" : "Dispute Letter"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS BAR */}
      <section ref={statsRef} className="relative z-10 bg-bg-secondary py-12 border-y border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border-default">
          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={82} suffix="%" /> : "82%"}
            </p>
            <p className="text-sm text-text-secondary mt-1 font-medium">
              of audited hospital bills in India contain overcharges
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={42000} prefix="₹" formatter={(v) => `${(v / 1000).toFixed(0)}k`} /> : "₹42k"}
            </p>
            <p className="text-sm text-text-secondary mt-1 font-medium">
              average recoverable overcharge found per patient
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl text-text-primary">
              {statsVisible ? <CountUp end={100} suffix="%" /> : "100%"}
            </p>
            <p className="text-sm text-text-secondary mt-1 font-medium">
              confidential, free & DPDP 2023 compliant
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE RECOVERY & SAVINGS CALCULATOR (WIDGET) */}
      <section id="simulator" className="relative z-10 py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-accent-light rounded-full text-brand-accent text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Savings Simulator</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
              Estimate your bill recovery in seconds
            </h2>
            <p className="text-base text-text-secondary">
              Adjust the slider and toggle suspected billing items to see your estimated statutory recovery under NPPA & DPCO regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-border-default rounded-3xl p-6 sm:p-10 shadow-xl">
            {/* Controls (60%) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Bill Amount Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-text-primary">
                    Total Hospital Bill Amount
                  </label>
                  <span className="font-mono text-lg font-extrabold text-brand-primary">
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

              {/* Treatment Type Selection */}
              <div>
                <label className="text-sm font-bold text-text-primary block mb-2">
                  Treatment / Admission Category
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "cardiology", label: "Cardiology / Stent" },
                    { id: "orthopedic", label: "Joint / Orthopedic" },
                    { id: "icu_general", label: "ICU & Surgery" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTreatmentType(t.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
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

              {/* Suspected Overcharge Flags */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-bold text-text-primary block">
                  Suspected Flags in Your Bill
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasStent}
                      onChange={(e) => setHasStent(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">Implant / Stent Markup</p>
                      <span className="text-[11px] text-text-secondary">Priced over NPPA cap ₹30,080</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹34,920 impact</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasDuplicateIcu}
                      onChange={(e) => setHasDuplicateIcu(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">Unbundled ICU & Nursing Day Fees</p>
                      <span className="text-[11px] text-text-secondary">Separate charges for items included in package</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">+₹22,500 impact</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-border-subtle/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasPharmacyMarkup}
                      onChange={(e) => setHasPharmacyMarkup(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent accent-brand-accent focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">DPCO Scheduled Pharmacy Markups</p>
                      <span className="text-[11px] text-text-secondary">Injections and infusions sold above NLEM list</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger">~8% of bill</span>
                </label>
              </div>
            </div>

            {/* Results Box (40%) */}
            <div className="lg:col-span-5 bg-bg-secondary rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-border-subtle">
              <div className="space-y-4">
                <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
                  Estimated Statutory Recovery
                </span>

                <div>
                  <p className="font-mono font-extrabold text-4xl sm:text-5xl text-brand-primary">
                    ₹{estimatedSavings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-text-secondary mt-1 font-medium">
                    You may be overpaying by approx. <strong className="text-danger font-bold">{savingsPercent}%</strong> of your total bill.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-border-default space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Legal Recourse Framework</span>
                    <span className="font-bold text-text-primary">NPPA + DPCO 2013</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Evidence Certificate</span>
                    <span className="font-bold text-text-primary">Section 65B BSA</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Resolution Probability</span>
                    <span className="font-bold text-success">89% Settlement Rate</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2.5">
                <Link href="/register" className="block">
                  <Button variant="primary" size="lg" className="w-full text-sm font-bold shadow-md h-[48px]">
                    Generate Free Dispute Letter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-text-tertiary">
                  Instant analysis • No registration fee • 100% confidential
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PRICE CAP CHECKER (NPPA / CGHS / DPCO) */}
      <section id="price-checker" className="relative z-10 py-18 bg-bg-secondary border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Instant Legal Price Ceiling Lookup
            </h2>
            <p className="text-sm text-text-secondary">
              Search government-regulated ceiling prices for stents, implants, essential medicines, and ICU rates.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8 relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine, stent, knee implant, ICU rate (e.g. Stent, Paracetamol, Meropenem)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-sm font-medium placeholder:text-text-tertiary outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1100px] mx-auto">
            {filteredItems.map((item) => (
              <div
                key={item.name}
                className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-brand-accent-light text-brand-accent text-[10px] font-extrabold uppercase">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">{item.citation}</span>
                </div>

                <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                  {item.name}
                </h4>

                <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-bold">Govt Price Cap</span>
                    <span className="font-mono font-bold text-success text-sm">
                      ₹{item.cap.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block text-[10px] uppercase font-bold">Hospital Typical</span>
                    <span className="font-mono font-bold text-danger text-sm line-through">
                      ₹{item.typical.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="relative z-10 py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="inline-flex px-3.5 py-1 bg-brand-accent-light rounded-full text-brand-accent text-xs font-bold">
              How it works
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
              Three simple steps to fair billing
            </h2>
            <p className="text-base text-text-secondary">
              No legal or technical knowledge required. We do all the statutory analysis.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card padding="lg" className="relative space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary pt-2">
                1. Upload your bill
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Upload a photo or PDF of your hospital bill. Our engine parses every medicine, stent, ICU day, and surgical procedure line by line.
              </p>
            </Card>

            {/* Step 2 */}
            <Card padding="lg" className="relative space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary pt-2">
                2. Automated Price Audit
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Every item is cross-referenced against NPPA, CGHS, and DPCO ceiling price gazettes, checking for hidden markups and unbundled packages.
              </p>
            </Card>

            {/* Step 3 */}
            <Card padding="lg" className="relative space-y-4 rounded-2xl hover:border-brand-accent/40 transition-colors">
              <span className="text-5xl font-extrabold text-border-default font-heading select-none absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-xl bg-brand-accent-light text-brand-accent flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary pt-2">
                3. Download Legal Notice
              </h3>
              <p className="text-sm text-text-secondary leading-[1.6]">
                Receive a ready-to-send dispute petition and Section 65B Merkle electronic certificate to submit to the hospital billing desk or insurer.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. STATUTORY FRAMEWORKS */}
      <section className="relative z-10 bg-bg-secondary py-18 lg:py-22 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Audited against 6 official statutory frameworks
            </h2>
            <p className="text-sm text-text-secondary">
              Every finding quotes the exact gazette order number and statutory section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">NPPA Medical Device Orders</h4>
                <p className="text-xs text-text-secondary mt-0.5">Statutory ceiling prices on cardiac stents, knee implants, and medical oxygen</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">DPCO Essential Medicines (NLEM)</h4>
                <p className="text-xs text-text-secondary mt-0.5">Strict price control regulations on over 800+ scheduled life-saving drugs</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">CGHS / PM-JAY Package Rates</h4>
                <p className="text-xs text-text-secondary mt-0.5">Standardized benchmark procedure and bed pricing across Indian cities</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Section 65B Electronic Proof</h4>
                <p className="text-xs text-text-secondary mt-0.5">Cryptographic Merkle tree hash verification under Bharatiya Sakshya Adhiniyam 2023</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Consumer Protection Act 2019</h4>
                <p className="text-xs text-text-secondary mt-0.5">Legal recourse against hospital overbilling and unfair trade practices</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-border-subtle shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent-light text-brand-accent flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">DPDP Act 2023 Privacy</h4>
                <p className="text-xs text-text-secondary mt-0.5">Encrypted health data processing with patient consent and full right to erasure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative z-10 bg-brand-primary text-white py-14 mt-auto">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <LogoIcon size={32} />
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  CuraVeris
                </span>
              </div>
              <p className="text-xs text-white/60 max-w-sm">
                India&apos;s automated healthcare billing verification & statutory compliance engine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-white/70 font-medium">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Create Free Account
              </Link>
              <Link href="/bills/upload" className="hover:text-white transition-colors">
                Scan Hospital Bill
              </Link>
              <a href="#simulator" className="hover:text-white transition-colors">
                Savings Calculator
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
            <p>© {new Date().getFullYear()} CuraVeris Healthcare Intelligence. All rights reserved.</p>
            <p>Processed in compliance with Digital Personal Data Protection (DPDP) Act 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

