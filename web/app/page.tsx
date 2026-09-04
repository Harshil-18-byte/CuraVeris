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
  ChevronDown,
  ChevronRight,
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
  Globe,
  MessageSquare,
  Smartphone,
  Laptop,
  HelpCircle,
  Play,
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

const REGULATORY_BODIES = [
  { name: "NPPA", title: "National Pharmaceutical Pricing Authority", desc: "Drug & Implant Price Ceilings" },
  { name: "DPCO 2013", title: "Drugs Prices Control Order", desc: "Essential Medicines List" },
  { name: "CGHS", title: "Central Government Health Scheme", desc: "Standardized Hospital Packages" },
  { name: "IRDAI", title: "Insurance Regulatory & Dev Authority", desc: "Non-Payable Item Schedules" },
  { name: "Section 65B", title: "Indian Evidence Act / BSA 2023", desc: "Cryptographic Legal Proof" },
  { name: "DPDP Act 2023", title: "Digital Personal Data Protection", desc: "Patient Data Sovereignty" },
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
  const [expandedAiIndex, setExpandedAiIndex] = useState<number>(0);

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
    <div className="min-h-screen bg-[#F5F7FB] text-[#202128] flex flex-col selection:bg-[#DBF1F4] selection:text-[#202128] relative overflow-x-hidden font-sans">
      {/* 1. FLOATING NAVIGATION BAR (Grassfeld Exact Spec) */}
      <header className="sticky top-4 z-50 max-w-[1280px] mx-auto w-[94%] sm:w-full px-2 sm:px-4">
        <div className="h-[66px] rounded-full bg-white/90 backdrop-blur-2xl border border-black/[0.06] px-5 sm:px-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          {/* Brand Logo */}
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

          {/* Center Links (Pill Nav with #EDF0FB Track) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#EDF0FB] border border-black/[0.03] text-xs font-bold text-[#606470]">
            <Link href="/" className="px-4 py-2 rounded-full text-[#202128] bg-white shadow-xs">
              Overview
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Forensic Audit
            </Link>
            <Link href="/bills/upload" className="px-4 py-2 rounded-full text-[#43A8B2] hover:text-[#202128] hover:bg-white/60 transition-colors">
              Check a Bill
            </Link>
            <a href="#simulator" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Savings Simulator
            </a>
            <a href="#price-checker" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Price Caps
            </a>
            <a href="#security" className="px-4 py-2 rounded-full hover:text-[#202128] hover:bg-white/60 transition-colors">
              Security
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/login">
              <button
                type="button"
                className="font-bold text-xs px-4 py-2 text-[#202128] hover:bg-black/[0.04] rounded-full transition-colors"
              >
                Sign In
              </button>
            </Link>
            <Link href="/register">
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

      {/* 2. HERO SECTION WITH GRASSFELD MULTICOLOR GRADIENT */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Top Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
            <span>THE STATUTORY FORENSIC APP FOR YOUR HOSPITAL BILLS</span>
          </div>

          {/* Main Giant Headline with Grassfeld Gradient */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[72px] text-[#202128] leading-[1.08] sm:leading-[1.04] tracking-[-0.035em] max-w-4xl mx-auto">
            The AI forensic app that keeps hospital bills{" "}
            <span className="grassfeld-gradient-text">
              on track.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] leading-relaxed max-w-2xl mx-auto font-medium">
            Upload your hospital bill. CuraVeris instantly audits line items against 800+ official NPPA price ceilings, CGHS package rules, and legal consumer protections.
          </p>

          {/* Hero CTAs: Dark Obsidian Pill & White Outline Pill */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link href="/bills/upload" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto h-[54px] px-8 text-sm sm:text-base font-bold shadow-[0_8px_24px_rgba(32,33,40,0.18)] bg-[#202128] hover:bg-black text-white rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Check Your Bill for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#simulator" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto h-[54px] px-7 text-sm sm:text-base font-bold border border-black/[0.08] bg-white hover:bg-[#F5F7FB] text-[#202128] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Calculator className="w-4 h-4 text-[#43A8B2]" />
                <span>Savings Simulator</span>
              </button>
            </a>
          </div>

          {/* Quick Trust Highlights */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#606470] font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#43A8B2]" />
              <span>100% Free for Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#43A8B2]" />
              <span>Section 65B Legal Evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#43A8B2]" />
              <span>Zero Data Selling · DPDP Compliant</span>
            </div>
          </div>
        </div>

        {/* 3. CENTERPIECE INTERACTIVE TAB SHOWCASE (Grassfeld Multi-Tab Bento Container) */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grassfeld-hero-card p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
            {/* Tab Pill Switcher Track */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-6 border-b border-black/[0.06] no-scrollbar">
              <div className="p-1.5 rounded-full bg-[#EDF0FB] border border-black/[0.03] inline-flex items-center gap-1.5">
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
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-[#DBF1F4] text-[#202128] shadow-sm"
                          : "text-[#606470] hover:text-[#202128] hover:bg-white/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#202128]" : "text-[#606470]"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 1: Forensic Audit View */}
            {activeTab === "audit" && (
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-bold border border-[#FECACA]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Automated Overcharge Detection</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                    Line-by-line statutory forensic check.
                  </h3>
                  <p className="text-sm text-[#606470] leading-relaxed">
                    Our AI models ingest PDF or photo bills, extract line item taxonomy, and flag every stent, medicine, ICU room package, and duplicate fee charged beyond government orders.
                  </p>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                      <div className="w-6 h-6 rounded-full bg-[#DBF1F4] text-[#202128] flex items-center justify-center font-bold text-xs">1</div>
                      <span>Matches against 800+ NPPA ceiling notifications</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                      <div className="w-6 h-6 rounded-full bg-[#DBF1F4] text-[#202128] flex items-center justify-center font-bold text-xs">2</div>
                      <span>Detects unbundled ICU nursing & monitoring charges</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                      <div className="w-6 h-6 rounded-full bg-[#DBF1F4] text-[#202128] flex items-center justify-center font-bold text-xs">3</div>
                      <span>Generates cryptographic Section 65B dispute report</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link href="/bills/upload">
                      <button
                        type="button"
                        className="bg-[#202128] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all hover:scale-[1.02]"
                      >
                        Upload a Bill for Live Audit
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-4">
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#606470]">Live Audit Result</span>
                      <p className="font-heading font-bold text-base text-[#202128]">Apollo Indraprastha Hospital (IPD-9921)</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-extrabold text-xs">
                      ₹47,800 Overcharged
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-[#FEE2E2] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#202128]">Heart Stent (Drug Eluting)</p>
                        <span className="text-[10px] text-[#606470]">Charged ₹65,000 (Govt. Cap: ₹30,080)</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#DC2626]">+₹22,500</span>
                    </div>

                    <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-[#FEE2E2] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#202128]">ICU Nursing & Bed (Billed Twice)</p>
                        <span className="text-[10px] text-[#606470]">CGHS Package Rule Violation</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#DC2626]">+₹18,000</span>
                    </div>

                    <div className="p-3.5 bg-[#F5F7FB] rounded-2xl border border-[#FEF3C7] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#202128]">Paracetamol IV 100ml Infusion</p>
                        <span className="text-[10px] text-[#606470]">DPCO Regulated Drug Cap: ₹28.50</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#D97706]">+₹7,300</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#606470]">
                    <span className="flex items-center gap-1.5 text-[#43A8B2] font-bold">
                      <ShieldCheck className="w-4 h-4" /> SHA-256 Sealed
                    </span>
                    <span className="font-bold">3 Violations Flagged</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Savings Calculator */}
            {activeTab === "calculator" && (
              <div id="simulator" className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-[#202128]">Estimated Hospital Bill Total</label>
                      <span className="font-mono text-base font-extrabold text-[#202128]">
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
                      className="w-full h-2.5 bg-[#EDF0FB] rounded-full appearance-none cursor-pointer accent-[#202128]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "cardiology", label: "Heart / Stent" },
                      { id: "orthopedic", label: "Knee / Joint" },
                      { id: "icu_general", label: "ICU / Surgery" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTreatmentType(t.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                          treatmentType === t.id
                            ? "border-[#202128] bg-[#202128] text-white shadow-sm"
                            : "border-black/[0.06] bg-white text-[#202128] hover:bg-[#F5F7FB]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] bg-white cursor-pointer gap-2 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={hasStent}
                          onChange={(e) => setHasStent(e.target.checked)}
                          className="w-4 h-4 rounded text-[#202128] accent-[#202128]"
                        />
                        <span className="text-xs font-bold text-[#202128]">Stent / Implant Charged Above Govt Limit</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#DC2626]">+₹34,920</span>
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] bg-white cursor-pointer gap-2 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={hasDuplicateIcu}
                          onChange={(e) => setHasDuplicateIcu(e.target.checked)}
                          className="w-4 h-4 rounded text-[#202128] accent-[#202128]"
                        />
                        <span className="text-xs font-bold text-[#202128]">ICU Nursing Charged Outside Package</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#DC2626]">+₹22,500</span>
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-3xl border border-black/[0.06] p-7 flex flex-col justify-between space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div>
                    <span className="text-xs font-bold text-[#43A8B2] uppercase tracking-wider block">
                      Estimated Recoverable Amount
                    </span>
                    <p className="font-mono font-extrabold text-4xl text-[#202128] mt-1">
                      ₹{estimatedSavings.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#606470] mt-1.5">
                      Potential overcharge of <strong className="text-[#DC2626] font-bold">{savingsPercent}%</strong> on your bill.
                    </p>
                  </div>

                  <Link href="/register" className="block">
                    <button
                      type="button"
                      className="w-full bg-[#202128] hover:bg-black text-white font-bold text-xs py-3.5 rounded-full shadow-md transition-all hover:scale-[1.02]"
                    >
                      Get Official Dispute Letter Free
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 3: Price Caps Engine */}
            {activeTab === "priceCaps" && (
              <div id="price-checker" className="pt-8 space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-[#606470]">
                    Official maximum ceiling prices published by the National Pharmaceutical Pricing Authority (NPPA).
                  </p>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#606470] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search stent, medicine..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-3.5 bg-white rounded-full border border-black/[0.08] text-xs text-[#202128] placeholder:text-[#606470] outline-none focus:border-[#43A8B2] shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredItems.slice(0, 3).map((item) => (
                    <div key={item.name} className="p-5 bg-white rounded-3xl border border-black/[0.06] space-y-3 shadow-xs">
                      <span className="px-2.5 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-[10px] font-bold uppercase">
                        {item.category}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-[#202128] line-clamp-1">{item.name}</h4>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-black/[0.05]">
                        <span className="text-[#43A8B2] font-mono font-bold">Cap: ₹{item.cap.toLocaleString("en-IN")}</span>
                        <span className="text-[#DC2626] line-through font-mono text-[11px]">Billed: ₹{item.typical.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Legal Dispute Notice */}
            {activeTab === "dispute" && (
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
                    Section 65B Electronic Proof
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                    Court-admissible dispute petitions.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                    CuraVeris automatically formats statutory citations, NPPA ceiling notification numbers, and consumer grievance clauses into a ready-to-send dispute letter for hospital billing managers.
                  </p>
                  <button
                    type="button"
                    onClick={copySampleLetter}
                    className="px-5 py-3 bg-[#202128] hover:bg-black text-white rounded-full text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-2 shadow-md"
                  >
                    {copiedLetter ? <Check className="w-4 h-4 text-[#86C159]" /> : <Copy className="w-4 h-4 text-[#DBF1F4]" />}
                    <span>{copiedLetter ? "Dispute Letter Copied to Clipboard!" : "Copy Ready-to-Send Dispute Notice"}</span>
                  </button>
                </div>

                <div className="lg:col-span-6 bg-white rounded-3xl border border-black/[0.06] p-5 sm:p-6 font-mono text-[11px] text-[#202128] space-y-2.5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] max-h-[220px] overflow-y-auto">
                  <p className="text-[#43A8B2] font-bold">To: Medical Superintendent, City Care Hospital</p>
                  <p>Subject: Formal Overcharge Dispute under NPPA Price Orders & Consumer Protection Act 2019</p>
                  <p className="text-[#606470]">1. DES Stent billed ₹65,000 vs Statutory Cap ₹30,080 (+GST)</p>
                  <p className="text-[#606470]">2. ICU Nursing unbundled in violation of comprehensive package</p>
                  <p className="text-[#43A8B2] font-bold">Cryptographic SHA-256: 8f4a1c028e37d19... [VERIFIED]</p>
                </div>
              </div>
            )}

            {/* Tab 5: DPDP 2023 Privacy Vault */}
            {activeTab === "privacy" && (
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
                    Patient Data Sovereignty
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                    Zero-knowledge medical privacy.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                    Under the DPDP Act 2023, you own your health data. CuraVeris guarantees complete cryptographic confidentiality, no advertising trackers, and instant 1-click Right-to-Erasure.
                  </p>
                  <div className="pt-2">
                    <Link href="/account">
                      <button
                        type="button"
                        className="bg-[#202128] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all hover:scale-[1.02]"
                      >
                        Manage Privacy & Erasure Settings
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-3xl border border-black/[0.06] p-6 space-y-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                    <ShieldCheck className="w-5 h-5 text-[#43A8B2] flex-shrink-0" />
                    <span>AES-256 at rest & TLS 1.3 in transit</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                    <Lock className="w-5 h-5 text-[#43A8B2] flex-shrink-0" />
                    <span>DPDP Act 2023 Compliance Architecture</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#202128] font-bold">
                    <Zap className="w-5 h-5 text-[#86C159] flex-shrink-0" />
                    <span>Instant permanent data purging upon request</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. STATUTORY MARQUEE CAROUSEL (Infinite Scroll Grassfeld Animation) */}
      <section className="relative z-10 py-7 border-y border-black/[0.05] bg-white overflow-hidden">
        <p className="text-center text-[11px] font-extrabold text-[#606470] uppercase tracking-widest mb-4">
          Auditing bills against official Indian statutory frameworks & price ceilings
        </p>
        <div className="flex overflow-hidden select-none">
          <div className="animate-marquee flex items-center gap-8 text-xs font-extrabold text-[#202128]">
            {[...REGULATORY_BODIES, ...REGULATORY_BODIES].map((body, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-4 py-2 bg-[#F5F7FB] border border-black/[0.04] rounded-full flex-shrink-0 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#43A8B2]" />
                <span className="font-bold text-[#202128]">{body.name}</span>
                <span className="text-[#606470] font-medium text-[11px]">({body.desc})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STATS SUMMARY SECTION */}
      <section ref={statsRef} className="relative z-10 bg-[#F5F7FB] py-14 sm:py-20 border-b border-black/[0.05]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]">
          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-[#202128]">
              {statsVisible ? <CountUp end={82} suffix="%" /> : "82%"}
            </p>
            <p className="text-xs sm:text-sm text-[#606470] mt-2 font-bold">
              Bills Audited with Flagged Overcharges
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-[#43A8B2]">
              {statsVisible ? <CountUp end={42000} prefix="₹" formatter={(v) => `${(v / 1000).toFixed(0)}k`} /> : "₹42k"}
            </p>
            <p className="text-xs sm:text-sm text-[#606470] mt-2 font-bold">
              Average Recoverable Overcharge Found
            </p>
          </div>

          <div className="pt-4 sm:pt-0">
            <p className="font-heading font-extrabold text-4xl sm:text-5xl text-[#86C159]">
              {statsVisible ? <CountUp end={100} suffix="%" /> : "100%"}
            </p>
            <p className="text-xs sm:text-sm text-[#606470] mt-2 font-bold">
              Section 65B Certified Legal Dispute Notices
            </p>
          </div>
        </div>
      </section>

      {/* 6. BENTO GRID — "Organize your hospital bill defense" (4 Pastel Bento Cards) */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex px-4 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
              Complete Patient Financial Protection
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128] tracking-tight">
              Organize your hospital bill defense with clarity.
            </h2>
            <p className="text-sm sm:text-base text-[#606470] font-medium">
              Built with state-of-the-art AI forensics and official Indian statutory guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mint Pastel Bento */}
            <div className="bg-[#DFF1F3] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-2xl bg-white text-[#202128] flex items-center justify-center font-bold text-sm shadow-xs">
                  <ScanLine className="w-5 h-5 text-[#43A8B2]" />
                </span>
                <Link href="/bills/upload" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Audit itemized bills
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Automatic line item extraction for medicines, implants, bed rent, and OT fees against NPPA ceiling notifications.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Recent Verified</span>
                <p className="font-bold text-xs text-[#202128]">DES Stent • ₹34,920 Saved</p>
              </div>
            </div>

            {/* Card 2: Soft Lavender Pastel Bento */}
            <div className="bg-[#E7E3FF] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-2xl bg-white text-[#202128] flex items-center justify-center font-bold text-sm shadow-xs">
                  <FileCheck2 className="w-5 h-5 text-[#5E84E2]" />
                </span>
                <Link href="/bills/upload" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Section 65B Notice
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Cryptographically sealed electronic proof admissible in District & State Consumer Commissions.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Status</span>
                <p className="font-bold text-xs text-[#202128]">SHA-256 Hash Certified</p>
              </div>
            </div>

            {/* Card 3: Ice Blue Pastel Bento */}
            <div className="bg-[#DDECFD] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-2xl bg-white text-[#202128] flex items-center justify-center font-bold text-sm shadow-xs">
                  <FileSpreadsheet className="w-5 h-5 text-[#43A8B2]" />
                </span>
                <Link href="/bills" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  TPA Claim Appeal
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Challenge arbitrary non-medical deductions using IRDAI circulars and standard non-payable item master lists.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Reconciled</span>
                <p className="font-bold text-xs text-[#202128]">₹18,500 Recovered</p>
              </div>
            </div>

            {/* Card 4: Sky Blue Pastel Bento */}
            <div className="bg-[#DDECFD] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-2xl bg-white text-[#202128] flex items-center justify-center font-bold text-sm shadow-xs">
                  <Lock className="w-5 h-5 text-[#43A8B2]" />
                </span>
                <Link href="/account" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  DPDP 2023 Vault
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Zero third-party monetization. Instant 1-click permanent data erasure with patient cryptographic sovereignty.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Privacy Rating</span>
                <p className="font-bold text-xs text-[#202128]">100% Confidential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CURAVERIS INTELLIGENCE SECTION (Grassfeld Intelligence Style) */}
      <section className="relative z-10 py-16 sm:py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#202128] tracking-tight">
              CuraVeris Intelligence
            </h2>
            <p className="text-sm sm:text-lg text-[#606470] max-w-xl mx-auto">
              Automate statutory bill analysis and predict overcharge disputes before paying the hospital cashier.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left AI Frame Preview */}
            <div className="lg:col-span-6 bg-[#F5F7FB] rounded-[36px] p-6 sm:p-10 border border-black/[0.06] shadow-inner space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#43A8B2]">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Forensic Verdict</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#202128] leading-snug">
                  &ldquo;This inpatient bill includes an unbundled ICU nursing charge of ₹18,000 which is legally included under CGHS package limits.&rdquo;
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04] text-[#606470]">
                  <span>Confidence: 99.4%</span>
                  <span className="text-[#DC2626] font-bold font-mono">Dispute Value: ₹18,000</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#86C159]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statutory Citation Generated</span>
                </div>
                <p className="text-xs text-[#606470] font-mono">
                  NPPA Order S.O. 1331(E) & Consumer Protection Act 2019 Sec. 2(47)
                </p>
              </div>
            </div>

            {/* Right Interactive Feature List */}
            <div className="lg:col-span-6 space-y-4">
              {[
                {
                  title: "Predict illegal overcharges before paying",
                  desc: "Upload estimate bills during hospitalization to negotiate corrections before final discharge.",
                },
                {
                  title: "Statutory device & drug price checks",
                  desc: "Instantly compare cardiac stents, knee implants, and IV infusions against NPPA government caps.",
                },
                {
                  title: "Unbundled ICU package detection",
                  desc: "Flag duplicate nursing, monitoring, and sanitization charges billed outside room packages.",
                },
                {
                  title: "Section 65B Electronic Proof Generation",
                  desc: "Generate timestamped, SHA-256 sealed petitions ready for legal grievance desks.",
                },
              ].map((item, idx) => {
                const isOpen = expandedAiIndex === idx;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F5F7FB] border border-black/[0.06] transition-all cursor-pointer"
                    onClick={() => setExpandedAiIndex(isOpen ? -1 : idx)}
                  >
                    <div className="flex items-center justify-between font-bold text-sm sm:text-base text-[#202128]">
                      <span>{item.title}</span>
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-extrabold shadow-xs">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="text-xs sm:text-sm text-[#606470] mt-2 pt-2 border-t border-black/[0.04] leading-relaxed animate-in fade-in duration-200">
                        {item.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8. DARK OBSIDIAN AI CHAT BANNER ("Don't search. Just ask") */}
      <section className="relative z-10 py-12 sm:py-20 bg-[#F5F7FB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#18191C] text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
            {/* Top-right glowing radial teal gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#43A8B2]/15 blur-3xl rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left text */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#79C5CD] text-xs font-bold border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Patient Legal Assistant</span>
                </div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                  Don&apos;t search. Just ask.
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-md">
                  Meet CuraVeris Intelligence: your personal in-app AI assistant ready to answer hospital billing rules, price caps, and patient legal rights.
                </p>
                <div className="pt-2">
                  <Link href="/register">
                    <button
                      type="button"
                      className="bg-white hover:bg-neutral-100 text-[#202128] font-extrabold text-xs px-7 py-3.5 rounded-full shadow-lg transition-all hover:scale-[1.02]"
                    >
                      Get Started Free
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Speech Prompt Bubbles */}
              <div className="lg:col-span-6 space-y-3">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-white flex items-center justify-between shadow-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <span>&ldquo;Can the hospital charge for gloves and syringes in ICU?&rdquo;</span>
                  <ChevronRight className="w-4 h-4 text-[#79C5CD]" />
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-white flex items-center justify-between shadow-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <span>&ldquo;What is the NPPA statutory price cap for a DES stent?&rdquo;</span>
                  <ChevronRight className="w-4 h-4 text-[#79C5CD]" />
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-white flex items-center justify-between shadow-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <span>&ldquo;How do I file a grievance with the NPPA IPDMS portal?&rdquo;</span>
                  <ChevronRight className="w-4 h-4 text-[#79C5CD]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECURITY & COMPLIANCE ("Is CuraVeris safe to use?") */}
      <section id="security" className="relative z-10 py-16 sm:py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128] tracking-tight">
              Is CuraVeris safe to use?
            </h2>
            <p className="text-sm sm:text-base text-[#606470] max-w-xl mx-auto">
              We operate with zero-knowledge health privacy architecture under Indian statutory laws.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-[#F5F7FB] border border-black/[0.06] p-8 sm:p-10 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#202128] shadow-xs flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#43A8B2]" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-[#202128]">
                DPDP Act 2023 Compliant
              </h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                Your medical bills and health data belong exclusively to you. We never sell, monetize, or license your records to insurance companies or third parties. 1-click permanent data erasure is built into every account.
              </p>
            </div>

            <div className="rounded-[32px] bg-[#F5F7FB] border border-black/[0.06] p-8 sm:p-10 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#202128] shadow-xs flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#43A8B2]" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-[#202128]">
                Bank-Grade AES-256 Encryption
              </h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                All uploaded documents are encrypted in-transit via TLS 1.3 and at rest with AES-256 encryption. Every generated audit report carries a SHA-256 cryptographic hash under Section 65B of the Indian Evidence Act.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. REAL STORIES / TESTIMONIALS (Grassfeld Ice Blue Container) */}
      <section className="relative z-10 py-16 sm:py-24 bg-[#F5F7FB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#DDECFD] rounded-[36px] p-8 sm:p-14 space-y-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#43A8B2] uppercase tracking-wider">
                Real Patient Recoveries
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128] tracking-tight">
                Real stories. Real financial progress.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-1 text-[#D97706]">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-sm text-[#202128] font-medium leading-relaxed">
                  &ldquo;Found ₹48,000 in duplicate ICU charges within 5 minutes of uploading our hospital discharge bill. The dispute letter got us an immediate refund.&rdquo;
                </p>
                <div className="pt-2 border-t border-black/[0.04]">
                  <p className="font-bold text-xs text-[#202128]">Rajesh M., 42 yo</p>
                  <p className="text-[10px] text-[#606470]">Bengaluru • Cardiac Inpatient</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-1 text-[#D97706]">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-sm text-[#202128] font-medium leading-relaxed">
                  &ldquo;The hospital billed ₹65,000 for a stent capped at ₹30,080 by NPPA. CuraVeris cited the exact government gazette notification and saved us ₹34,920.&rdquo;
                </p>
                <div className="pt-2 border-t border-black/[0.04]">
                  <p className="font-bold text-xs text-[#202128]">Pooja K., 36 yo</p>
                  <p className="text-[10px] text-[#606470]">Delhi NCR • Cardiology Audit</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-1 text-[#D97706]">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-sm text-[#202128] font-medium leading-relaxed">
                  &ldquo;Our insurance TPA rejected ₹28,000 under &apos;non-payable&apos; consumables. The CuraVeris appeal notice reversed the rejection in 10 days.&rdquo;
                </p>
                <div className="pt-2 border-t border-black/[0.04]">
                  <p className="font-bold text-xs text-[#202128]">Vikram S., 51 yo</p>
                  <p className="text-[10px] text-[#606470]">Mumbai • Orthopedic Surgery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION SECTION (Grassfeld Style) */}
      <section className="relative z-10 py-16 sm:py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#202128] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-base text-[#606470]">
              Clear answers on healthcare auditing, legal rights, and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#F5F7FB] border border-black/[0.06] overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-[#202128] hover:text-[#43A8B2] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#606470] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#202128]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#606470] leading-relaxed border-t border-black/[0.04] pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL HIGH-IMPACT CTA BANNER (Grassfeld Pastel Gradient Banner) */}
      <section className="relative z-10 py-12 sm:py-20 bg-[#F5F7FB]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grassfeld-hero-card p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#202128] tracking-tight max-w-2xl mx-auto">
              Ready to verify your hospital bill?
            </h2>
            <p className="text-sm sm:text-lg text-[#606470] max-w-xl mx-auto font-medium">
              Join thousands of Indian families taking control of their hospital bills with full statutory transparency.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/bills/upload" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto h-[52px] px-8 text-sm sm:text-base font-bold shadow-lg bg-[#202128] hover:bg-black text-white rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Start Free Bill Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto h-[52px] px-7 text-sm sm:text-base font-bold border border-black/[0.08] bg-white hover:bg-[#F5F7FB] text-[#202128] rounded-full shadow-xs transition-all hover:scale-[1.02]"
                >
                  Create Patient Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13. OBSIDIAN FOOTER (Grassfeld Exact Dark Footer) */}
      <footer className="relative z-10 bg-[#1B1C20] text-white py-12 sm:py-16 border-t border-black/[0.06]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <LogoIcon size={36} />
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                  CuraVeris
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
                India&apos;s statutory healthcare forensic auditor and patient financial rights engine. Your bill. Your rights.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  NPPA • CGHS • DPCO • DPDP 2023
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-neutral-400">
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
                <p><a href="#security" className="hover:text-white transition-colors">Security & DPDP</a></p>
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono text-center sm:text-left">
            <p>© {new Date().getFullYear()} CuraVeris. All rights reserved.</p>
            <p>Your health data is 100% private and protected under the DPDP Act 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
