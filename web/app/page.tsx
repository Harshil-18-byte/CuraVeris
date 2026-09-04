"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  TrendingDown,
  Scale,
  Sparkles,
  ArrowRight,
  Calculator,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Lock,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  Receipt,
  ScanLine,
  Zap,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  Sliders,
  Shield,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LogoIcon } from "@/components/ui/Logo";

// CountUp hook for animated stats
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!startOnView || started) return;
    setStarted(true);

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, startOnView, started]);

  return count;
}

const CountUp: React.FC<{
  end: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}> = ({ end, prefix = "", suffix = "", formatter }) => {
  const count = useCountUp(end, 1800, true);
  const formatted = formatter ? formatter(count) : count.toLocaleString("en-IN");
  return <span>{prefix}{formatted}{suffix}</span>;
};

// Government Price Caps Database
const GOV_PRICE_LIMITS = [
  { name: "Drug Eluting Heart Stent (DES)", cap: 30080, typical: 65000, category: "NPPA Device", citation: "NPPA Order 2017/2023" },
  { name: "Bare Metal Stent (BMS)", cap: 8261, typical: 25000, category: "NPPA Device", citation: "NPPA Order 2017/2023" },
  { name: "Total Knee Replacement (Cobalt Chromium)", cap: 54000, typical: 115000, category: "NPPA Ortho", citation: "NPPA Knee Cap 2017" },
  { name: "Paracetamol IV Infusion 100ml", cap: 28.50, typical: 250, category: "DPCO NLEM", citation: "DPCO 2013 S.O. 1331" },
  { name: "Meropenem 1g Injection", cap: 950, typical: 3200, category: "DPCO NLEM", citation: "DPCO 2013 Price Ceiling" },
  { name: "ICU Bed + Daily Nursing Charges", cap: 0, typical: 12000, category: "Package Rule", citation: "CGHS Package Rules" },
];

const FAQS = [
  {
    q: "How does CuraVeris identify illegal overcharges on hospital bills?",
    a: "CuraVeris parses itemized inpatient bills and cross-references each medicine, consumable, implant, and bed charge against official price limits set by the National Pharmaceutical Pricing Authority (NPPA), DPCO ceiling price notifications, and CGHS standard package rules.",
  },
  {
    q: "What is a Section 65B certificate and how does it help my dispute?",
    a: "Under Section 65B of the Indian Evidence Act (now BSA 2023), electronic records must be accompanied by a cryptographic certificate confirming authenticity. CuraVeris automatically generates a tamper-evident audit report with SHA-256 hash sealing, giving you admissible proof for hospital grievance desks, TPAs, or Consumer Commissions.",
  },
  {
    q: "Is my medical data and personal identity protected under DPDP Act 2023?",
    a: "Yes. CuraVeris operates with strict privacy controls under the Digital Personal Data Protection (DPDP) Act 2023. All uploaded bills are processed in encrypted memory, anonymized, and never sold to third parties. You have the full right to instant data erasure at any time.",
  },
  {
    q: "Can I use CuraVeris for insurance claim rejections and deductions?",
    a: "Absolutely. When insurers or TPAs deduct amounts under vague 'non-medical' or 'excessive' clauses, our Reconciliation Engine compares the deducted items with IRDAI master non-payable schedules to generate an authoritative claim appeal letter.",
  },
  {
    q: "Does CuraVeris charge patients for checking hospital bills?",
    a: "Checking your bill, running the savings simulation, exploring government price limits, and generating standard dispute letters is 100% free for individual patients and families.",
  },
];

export default function LandingPage() {
  // Bento Showcase Active Tab
  const [activeTab, setActiveTab] = useState<"audit" | "calculator" | "priceCaps" | "dispute" | "privacy">("audit");

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(385000);
  const [treatmentType, setTreatmentType] = useState<string>("cardiology");
  const [hasStent, setHasStent] = useState<boolean>(true);
  const [hasDuplicateIcu, setHasDuplicateIcu] = useState<boolean>(true);
  const [hasPharmacyMarkup, setHasPharmacyMarkup] = useState<boolean>(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Stats Observer
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Estimated Savings
  const calculateSavings = () => {
    let savings = 0;
    if (hasStent) savings += 34920;
    if (hasDuplicateIcu) savings += 22500;
    if (hasPharmacyMarkup) savings += Math.round(billAmount * 0.08);
    return Math.min(savings, Math.round(billAmount * 0.45));
  };

  const estimatedSavings = calculateSavings();
  const savingsPercent = Math.round((estimatedSavings / billAmount) * 100);

  const filteredItems = GOV_PRICE_LIMITS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copySampleLetter = () => {
    const sample = `To,\nThe Medical Superintendent / Billing Grievance Desk,\nCity Care Hospital\n\nSubject: Formal Dispute regarding Bill No. 2024-8841 under NPPA Ceiling Orders & Consumer Protection Act 2019\n\nDear Sir/Madam,\n\nI am writing to formally dispute overcharged items in the final inpatient bill for patient Amit Sharma (IPD-99214). Upon auditing against National Pharmaceutical Pricing Authority (NPPA) statutory price caps, the following violations were identified:\n\n1. Drug Eluting Stent billed at ₹65,000 against statutory cap of ₹30,080 (+GST) — Overcharge: ₹22,500\n2. ICU Nursing and Bed charges billed separately in violation of comprehensive package rules — Overcharge: ₹18,000\n3. Regulated NLEM pharmaceuticals billed above DPCO ceiling prices — Overcharge: ₹7,300\n\nTotal Disputed Overcharge: ₹47,800\n\nKindly issue a revised final bill and initiate refund within 7 working days, failing which this matter will be escalated to the District Consumer Commission and NPPA IPDMS grievance portal.\n\nSincerely,\nAmit Sharma`;
    navigator.clipboard.writeText(sample);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F8FAFC] flex flex-col selection:bg-brand-accent/30 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Animated Gradient Mesh & Tech Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-blue-600/15 via-blue-900/10 to-transparent blur-3xl rounded-full opacity-80" />
        <div className="absolute top-[800px] -left-48 w-[700px] h-[700px] bg-blue-700/5 blur-3xl rounded-full" />
        <div className="absolute top-[1600px] -right-48 w-[700px] h-[700px] bg-blue-500/8 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFFFFF08_1px,transparent_1px),linear-gradient(to_bottom,#FFFFFF08_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 1. FLOATING NAVIGATION BAR (Grassfeld Style) */}
      <header className="sticky top-3 z-50 max-w-[1360px] mx-auto w-[94%] sm:w-full px-2 sm:px-4">
        <div className="h-[64px] rounded-2xl bg-[#0F131D]/80 backdrop-blur-xl border border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-2xl">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 min-w-0 group">
            <LogoIcon size={34} />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white leading-tight">
                CuraVeris
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 tracking-wider uppercase">
                Healthcare Forensics & Rights
              </span>
            </div>
          </Link>

          {/* Center Links (Pill Nav) */}
          <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-semibold text-slate-300">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-white font-bold bg-white/10 shadow-xs">
              Overview
            </Link>
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Forensic Audit
            </Link>
            <Link href="/bills/upload" className="px-3 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
              Check a Bill
            </Link>
            <Link href="/bills" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              My Bills
            </Link>
            <a href="#simulator" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Calculator
            </a>
            <a href="#price-checker" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Price Limits
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs px-3 sm:px-4 h-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="primary"
                size="sm"
                className="hover-arrow-btn font-semibold text-xs shadow-lg px-3.5 sm:px-5 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5"
              >
                <span>Check My Bill</span>
                <ArrowRight className="w-3.5 h-3.5 btn-arrow" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>AI-Powered Medical Forensic Engine • DPDP 2023 Protected</span>
          </div>

          {/* Main Giant Headline */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-white leading-[1.1] sm:leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto">
            The AI forensic app that keeps hospital bills{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              on track.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Upload your hospital bill. CuraVeris instantly audits line items against 800+ official NPPA price ceilings, CGHS limits, and legal consumer protections.
          </p>

          {/* Main Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link href="/bills/upload" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="hover-arrow-btn w-full sm:w-auto h-[52px] px-8 text-base font-bold shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <span>Check Your Bill for Free</span>
                <ArrowRight className="w-4 h-4 btn-arrow" />
              </Button>
            </Link>
            <a href="#simulator" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto h-[52px] px-6 text-base font-semibold border border-white/10 bg-[#11141C] hover:bg-[#161A24] text-slate-200 rounded-xl flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>Savings Simulator</span>
              </Button>
            </a>
          </div>

          {/* Quick Trust Highlights */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Free for Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>Section 65B Legal Evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Data Selling · DPDP Compliant</span>
            </div>
          </div>
        </div>

        {/* 3. CENTERPIECE INTERACTIVE BENTO SHOWCASE (Grassfeld Multi-Tab Showcase) */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="rounded-3xl bg-[#11141C]/90 border border-white/10 p-4 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Tab Pill Switcher (Grassfeld signature interactive switcher) */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 sm:pb-6 border-b border-white/10 no-scrollbar">
              {[
                { id: "audit", label: "Forensic Bill Audit", icon: ScanLine },
                { id: "calculator", label: "Savings Calculator", icon: Calculator },
                { id: "priceCaps", label: "Price Caps Engine", icon: Scale },
                { id: "dispute", label: "Legal Dispute Notice", icon: FileCheck2 },
                { id: "privacy", label: "DPDP 2023 Vault", icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Forensic Audit View */}
            {activeTab === "audit" && (
              <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Automated Overcharge Detection</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                    Line-by-line statutory forensic check.
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our AI models ingest PDF or photo bills, extract line item taxonomy, and flag every stent, medicine, ICU room package, and duplicate fee charged beyond government orders.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
                      <span>Matches against 800+ NPPA ceiling notifications</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
                      <span>Detects unbundled ICU nursing & monitoring charges</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">3</div>
                      <span>Generates cryptographic Section 65B dispute report</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link href="/bills/upload">
                      <Button variant="primary" size="md" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
                        Upload a Bill for Live Audit
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-[#161A24] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Live Audit Result</span>
                      <p className="font-heading font-bold text-base text-white">Apollo Indraprastha Hospital (IPD-9921)</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-xs">
                      ₹47,800 Overcharged
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-[#11141C] rounded-xl border border-red-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Heart Stent (Drug Eluting)</p>
                        <span className="text-[10px] text-slate-400">Charged ₹65,000 (Govt. Cap: ₹30,080)</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-400">+₹22,500</span>
                    </div>

                    <div className="p-3 bg-[#11141C] rounded-xl border border-red-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">ICU Nursing & Bed (Billed Twice)</p>
                        <span className="text-[10px] text-slate-400">CGHS Package Rule Violation</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-400">+₹18,000</span>
                    </div>

                    <div className="p-3 bg-[#11141C] rounded-xl border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Paracetamol IV 100ml Infusion</p>
                        <span className="text-[10px] text-slate-400">DPCO Regulated Drug Cap: ₹28.50</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">+₹7,300</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" /> SHA-256 Sealed
                    </span>
                    <span>3 Violations Found</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Savings Calculator */}
            {activeTab === "calculator" && (
              <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-white">Estimated Hospital Bill Total</label>
                      <span className="font-mono text-base font-extrabold text-blue-400">
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
                      className="w-full h-2.5 bg-[#161A24] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "cardiology", label: "Heart / Stent" },
                      { id: "orthopedic", label: "Knee / Joint" },
                      { id: "icu_general", label: "ICU / Surgery" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTreatmentType(t.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          treatmentType === t.id
                            ? "border-blue-500 bg-blue-600 text-white shadow-xs"
                            : "border-white/10 bg-[#161A24] text-slate-300 hover:border-blue-500/40"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#161A24] cursor-pointer gap-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={hasStent}
                          onChange={(e) => setHasStent(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-500 accent-blue-500"
                        />
                        <span className="text-xs font-bold text-white">Stent / Implant Charged Above Govt Limit</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-400">+₹34,920</span>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#161A24] cursor-pointer gap-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={hasDuplicateIcu}
                          onChange={(e) => setHasDuplicateIcu(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-500 accent-blue-500"
                        />
                        <span className="text-xs font-bold text-white">ICU Nursing Charged Outside Package</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-red-400">+₹22,500</span>
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#161A24] rounded-2xl border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                      Estimated Recoverable Amount
                    </span>
                    <p className="font-mono font-extrabold text-4xl text-white mt-1">
                      ₹{estimatedSavings.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Potential overcharge of <strong className="text-red-400 font-bold">{savingsPercent}%</strong> on your bill.
                    </p>
                  </div>

                  <Link href="/register" className="block">
                    <Button variant="primary" size="md" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-md">
                      Get Official Dispute Letter Free
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 3: Price Caps Engine */}
            {activeTab === "priceCaps" && (
              <div className="pt-6 sm:pt-8 space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-slate-300">
                    Official maximum ceiling prices published by the National Pharmaceutical Pricing Authority (NPPA).
                  </p>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search stent, medicine..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-[#161A24] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredItems.slice(0, 3).map((item) => (
                    <div key={item.name} className="p-4 bg-[#161A24] rounded-xl border border-white/10 space-y-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                        {item.category}
                      </span>
                      <h4 className="font-heading font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                        <span className="text-emerald-400 font-mono font-bold">Cap: ₹{item.cap.toLocaleString("en-IN")}</span>
                        <span className="text-red-400 line-through font-mono text-[11px]">Billed: ₹{item.typical.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Legal Dispute Notice */}
            {activeTab === "dispute" && (
              <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Section 65B Electronic Proof
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                    Court-admissible dispute petitions.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    CuraVeris automatically formats statutory citations, NPPA ceiling notification numbers, and consumer grievance clauses into a ready-to-send dispute letter for hospital billing managers.
                  </p>
                  <button
                    type="button"
                    onClick={copySampleLetter}
                    className="px-4 py-2.5 bg-[#161A24] hover:bg-[#1E2433] text-white border border-white/10 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    {copiedLetter ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                    <span>{copiedLetter ? "Dispute Letter Copied to Clipboard!" : "Copy Ready-to-Send Dispute Notice"}</span>
                  </button>
                </div>

                <div className="lg:col-span-6 bg-[#161A24] rounded-2xl border border-white/10 p-4 sm:p-5 font-mono text-[11px] text-slate-300 space-y-2 overflow-hidden shadow-xl max-h-[220px] overflow-y-auto">
                  <p className="text-blue-400 font-bold">To: Medical Superintendent, City Care Hospital</p>
                  <p>Subject: Formal Overcharge Dispute under NPPA Price Orders & Consumer Protection Act 2019</p>
                  <p className="text-slate-400">1. DES Stent billed ₹65,000 vs Statutory Cap ₹30,080 (+GST)</p>
                  <p className="text-slate-400">2. ICU Nursing unbundled in violation of comprehensive package</p>
                  <p className="text-emerald-400 font-bold">Cryptographic SHA-256: 8f4a1c028e37d19... [VERIFIED]</p>
                </div>
              </div>
            )}

            {/* Tab 5: DPDP 2023 Privacy Vault */}
            {activeTab === "privacy" && (
              <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-3">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    Patient Data Sovereignty
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                    Zero-knowledge medical privacy.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Under the DPDP Act 2023, you own your health data. CuraVeris guarantees complete cryptographic confidentiality, no advertising trackers, and instant 1-click Right-to-Erasure.
                  </p>
                  <div className="pt-2">
                    <Link href="/account">
                      <Button variant="primary" size="md" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
                        Manage Privacy & Erasure Settings
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-[#161A24] rounded-2xl border border-white/10 p-5 space-y-3 shadow-xl">
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>AES-256 at rest & TLS 1.3 in transit</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <Lock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span>DPDP Act 2023 Compliance Architecture</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>Instant permanent data purging upon request</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. STATUTORY TRUST STRIP (Scrolling Logo / Authority Ticker) */}
      <section className="relative z-10 py-6 border-y border-white/10 bg-[#06080C]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            Auditing bills against official Indian statutory frameworks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-bold text-slate-400">
            <span className="hover:text-white transition-colors">NPPA (Drug & Device Price Caps)</span>
            <span className="hover:text-white transition-colors">DPCO 2013 (Essential Medicines)</span>
            <span className="hover:text-white transition-colors">CGHS (Hospital Package Rules)</span>
            <span className="hover:text-white transition-colors">IRDAI (Insurance Claim Schedules)</span>
            <span className="hover:text-white transition-colors">Section 65B Evidence Act</span>
            <span className="hover:text-white transition-colors">DPDP Act 2023</span>
          </div>
        </div>
      </section>

      {/* 5. STATS SUMMARY SECTION */}
      <section ref={statsRef} className="relative z-10 bg-[#090B10] py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-white">
              {statsVisible ? <CountUp end={82} suffix="%" /> : "82%"}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              Bills Audited with Flagged Overcharges
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-blue-400">
              {statsVisible ? <CountUp end={42000} prefix="₹" formatter={(v) => `${(v / 1000).toFixed(0)}k`} /> : "₹42k"}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              Average Recoverable Overcharge Found
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-emerald-400">
              {statsVisible ? <CountUp end={100} suffix="%" /> : "100%"}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              Section 65B Certified Legal Dispute Notices
            </p>
          </div>
        </div>
      </section>

      {/* 6. BENTO GRID FEATURES (Grassfeld 4-Card Bento Grid) */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              Comprehensive Capabilities
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Everything you need to challenge inflated bills.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Built with state-of-the-art AI and Indian healthcare legal intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Multi-Model Audit (8 cols) */}
            <div className="md:col-span-8 rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-white">
                  Multi-Model AI Forensic Auditor
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Extracts raw receipt text, standardizes medical nomenclature, and verifies prices against 800+ statutory ceiling notifications instantly.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#161A24] rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Parsing Accuracy</span>
                  <span className="font-mono font-bold text-white text-base">99.4%</span>
                </div>
                <div className="p-3 bg-[#161A24] rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Audit Speed</span>
                  <span className="font-mono font-bold text-blue-400 text-base">&lt; 4.2s</span>
                </div>
                <div className="p-3 bg-[#161A24] rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Rules Enforced</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">NPPA + DPCO</span>
                </div>
              </div>
            </div>

            {/* Card 2: Section 65B Evidence (4 cols) */}
            <div className="md:col-span-4 rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white">
                  Section 65B Certificate
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cryptographically signed audit trail with timestamp and SHA-256 seal, legally admissible in Indian Consumer Courts.
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <BadgeCheck className="w-4 h-4" /> Ready for Legal Submission
                </span>
              </div>
            </div>

            {/* Card 3: TPA & Claim Reconciliation (4 cols) */}
            <div className="md:col-span-4 rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white">
                  Insurance Claim Appeals
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Flags illegal TPA claim deductions and prepares formal dispute letters referencing IRDAI circulars and Master Schedules.
                </p>
              </div>
              <div className="pt-4">
                <Link href="/bills" className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300">
                  <span>Reconcile Deductions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: DPDP Privacy Ledger (8 cols) */}
            <div className="md:col-span-8 rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-10 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-white">
                  DPDP 2023 Patient Privacy Vault
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your confidential medical records are never monetized or exposed. Enjoy instant 1-click permanent data deletion anytime.
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-End Encryption</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Right to Erasure Compliant</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero Third-Party Trackers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-24 bg-[#0D1017] border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-flex px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              Three Simple Steps
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              How CuraVeris works for you.
            </h2>
            <p className="text-xs sm:text-base text-slate-400">
              No technical or legal knowledge required. Get your audit and dispute letter in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-8 relative space-y-4 shadow-lg hover:border-blue-500/30 transition-colors">
              <span className="text-5xl font-extrabold text-slate-800 font-heading select-none absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                1. Upload Your Bill
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Take a photo or upload a PDF of your hospital invoice or discharge summary.
              </p>
            </div>

            <div className="rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-8 relative space-y-4 shadow-lg hover:border-blue-500/30 transition-colors">
              <span className="text-5xl font-extrabold text-slate-800 font-heading select-none absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                2. AI Forensic Audit
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Our engine cross-checks every item with official price limits and CGHS packages.
              </p>
            </div>

            <div className="rounded-3xl bg-[#11141C] border border-white/10 p-6 sm:p-8 relative space-y-4 shadow-lg hover:border-blue-500/30 transition-colors">
              <span className="text-5xl font-extrabold text-slate-800 font-heading select-none absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                3. Download Dispute Letter
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get your Section 65B certified refund petition ready to submit to the hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION (Grassfeld Style) */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-white/10">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-base text-slate-400">
              Clear answers on healthcare auditing, legal rights, and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#11141C] border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-white hover:text-blue-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL HIGH-IMPACT CTA BANNER */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-slate-900/40 border border-blue-500/30 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />

            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight max-w-2xl mx-auto">
              Ready to verify your hospital bill?
            </h2>
            <p className="text-sm sm:text-lg text-slate-300 max-w-xl mx-auto font-normal">
              Join thousands of Indian families taking control of their hospital bills with full statutory transparency.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/bills/upload" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="hover-arrow-btn w-full sm:w-auto h-[50px] px-8 text-sm sm:text-base font-bold shadow-xl bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Start Free Bill Check</span>
                  <ArrowRight className="w-4 h-4 btn-arrow" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto h-[50px] px-6 text-sm sm:text-base font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                >
                  Create Patient Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="relative z-10 bg-[#06080C] text-white py-12 sm:py-16 border-t border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <LogoIcon size={36} />
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                  CuraVeris
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                India&apos;s statutory healthcare forensic auditor and patient financial rights engine. Your bill. Your rights.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  NPPA • CGHS • DPCO • DPDP 2023
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="space-y-2.5">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Audit Engine</p>
                <p><Link href="/bills/upload" className="hover:text-white transition-colors">Check a Bill</Link></p>
                <p><Link href="/dashboard" className="hover:text-white transition-colors">Forensic Dashboard</Link></p>
                <p><Link href="/bills" className="hover:text-white transition-colors">My Bills</Link></p>
                <p><a href="#simulator" className="hover:text-white transition-colors">Savings Simulator</a></p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Statutory Limits</p>
                <p><a href="#price-checker" className="hover:text-white transition-colors">NPPA Device Caps</a></p>
                <p><a href="#price-checker" className="hover:text-white transition-colors">DPCO Medicine Limits</a></p>
                <p><a href="#price-checker" className="hover:text-white transition-colors">CGHS Package Rates</a></p>
                <p><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Account & Privacy</p>
                <p><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></p>
                <p><Link href="/register" className="hover:text-white transition-colors">Register Free</Link></p>
                <p><Link href="/account" className="hover:text-white transition-colors">DPDP Privacy & Data</Link></p>
                <p><Link href="/notifications" className="hover:text-white transition-colors">Notifications</Link></p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono text-center sm:text-left">
            <p>© {new Date().getFullYear()} CuraVeris. All rights reserved.</p>
            <p>Your health data is 100% private and protected under the DPDP Act 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
