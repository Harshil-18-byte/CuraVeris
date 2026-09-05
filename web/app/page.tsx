"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Volume2,
  X,
  Users,
  Building2,
  TrendingUp,
  Award,
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
  {
    q: "What can I do with CuraVeris Navigator on desktop?",
    a: "CuraVeris Navigator provides deep line-by-line inspection, historical bill comparisons, CSV/PDF report exports, and one-click submission to the National Consumer Helpline and NPPA IPDMS grievance portal.",
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
  // Top Banner state
  const [showBanner, setShowBanner] = useState(true);

  // Tab Showcase Active Module
  const [activeModule, setActiveModule] = useState<
    "audit" | "simulator" | "priceCaps" | "petitions" | "insurance" | "vault" | "consumer"
  >("audit");

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(385000);
  const [treatmentType, setTreatmentType] = useState<string>("cardiology");
  const [hasStent, setHasStent] = useState<boolean>(true);
  const [hasDuplicateIcu, setHasDuplicateIcu] = useState<boolean>(true);
  const [hasPharmacyMarkup, setHasPharmacyMarkup] = useState<boolean>(true);

  // Search & Accordion State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [expandedAiIndex, setExpandedAiIndex] = useState<number>(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

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
      {/* 1. FLOATING NAVIGATION BAR */}
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/demo">
              <button
                type="button"
                className="font-bold text-xs px-3.5 py-2 text-[#43A8B2] hover:bg-[#DBF1F4]/40 border border-[#79C5CD]/40 rounded-full transition-all flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>See It In Action</span>
              </button>
            </Link>
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

      {/* 2. HERO SECTION WITH 3D CLAY/GLASS MOCKUP */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Top Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-[#43A8B2] flex-shrink-0" />
            <span>THE STATUTORY FORENSIC APP FOR YOUR HOSPITAL BILLS</span>
          </div>

          {/* Main Giant Headline with CuraVeris Gradient */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-[72px] text-[#202128] leading-[1.08] sm:leading-[1.04] tracking-[-0.035em] max-w-4xl mx-auto">
            The AI forensic app that keeps hospital bills{" "}
            <span className="curaveris-gradient-text">
              on track.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[#606470] leading-relaxed max-w-2xl mx-auto font-medium">
            Gain full statutory transparency over your inpatient bills with automated itemized auditing, NPPA price cap compliance, and AI-powered dispute generation.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            <Link href="/demo" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto h-[54px] px-7 text-sm sm:text-base font-bold shadow-[0_8px_24px_rgba(67,168,178,0.25)] bg-[#43A8B2] hover:bg-[#38919a] text-white rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Try With a Sample Bill</span>
              </button>
            </Link>
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
                className="w-full sm:w-auto h-[54px] px-6 text-sm sm:text-base font-bold border border-black/[0.08] bg-white hover:bg-[#F5F7FB] text-[#202128] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Calculator className="w-4 h-4 text-[#43A8B2]" />
                <span>Simulator</span>
              </button>
            </a>
          </div>

          {/* Interactive AI Chat Prompt Motion Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-[#606470] mr-1">Ask CuraVeris:</span>
            {[
              "Is my DES stent price capped?",
              "Why was ICU nursing charged twice?",
              "How to challenge TPA deductions?",
            ].map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const el = document.getElementById("ai-chat-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-[#202128] hover:bg-[#DBF1F4] hover:border-[#79C5CD]/40 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#43A8B2]" />
                <span>&ldquo;{query}&rdquo;</span>
              </button>
            ))}
          </div>

          {/* 3D Visual Hero Presentation */}
          <div className="pt-8 max-w-[1000px] mx-auto relative group">
            <div className="relative rounded-[36px] overflow-hidden border border-black/[0.06] shadow-[0_24px_70px_rgba(0,0,0,0.08)] bg-white">
              <Image
                src="/assets/hero_curaveris_mockup.jpg"
                alt="CuraVeris Hospital Bill Audit 3D Interface"
                width={1200}
                height={675}
                priority
                className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Floating Verified Pill Badge Top-Right */}
            <div className="hidden sm:flex absolute -top-5 -right-5 bg-white/95 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] items-center gap-3 animate-float">
              <div className="w-10 h-10 rounded-xl bg-[#DBF1F4] flex items-center justify-center text-[#202128]">
                <ShieldCheck className="w-5 h-5 text-[#43A8B2]" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#606470] uppercase block">Audit Certified</span>
                <p className="font-extrabold text-xs text-[#202128]">NPPA Price Cap Applied</p>
              </div>
            </div>

            {/* Floating Recovered Pill Badge Bottom-Left */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] items-center gap-3 animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                <AlertTriangle className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#606470] uppercase block">Flagged Extra Fee</span>
                <p className="font-extrabold text-xs text-[#DC2626]">+₹47,800 Overcharged</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2.5 WHAT SERVICES WE PROVIDE (Comprehensive Forensic Services Grid) */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DBF1F4] border border-[#79C5CD]/30 text-[#202128] text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-[#43A8B2]" />
              <span>WHAT SERVICES WE PROVIDE</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#202128] tracking-tight">
              Full-Spectrum Hospital Bill Protection
            </h2>
            <p className="text-sm sm:text-base text-[#606470] font-medium">
              We provide six specialized forensic services designed to audit, dispute, and recover unfair hospital charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#DFF1F3] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_analytics_3d.avif" alt="OCR Audit" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  1. Inpatient Bill Forensic Audit
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Deep OCR ingestion of multi-page hospital invoices. We extract, categorize, and cross-examine every medicine, implant, consumable, and doctor charge.
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#43A8B2]">
                <span>Instant Overcharge Detection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E7E3FF] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_bomb_3d.png" alt="Price Caps" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  2. NPPA & DPCO Price Ceiling Check
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Automatic comparison against 800+ official statutory price caps for cardiac stents, knee implants, and National List of Essential Medicines (NLEM).
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#5E84E2]">
                <span>Govt Gazette Compliance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#DDECFD] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_folder_3d.png" alt="Section 65B" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  3. Section 65B Dispute Petitions
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Auto-generates tamper-evident electronic dispute notices certified with cryptographic SHA-256 digests, admissible before Consumer Courts.
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#43A8B2]">
                <span>Legally Admissible Proof</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#DFF1F3] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_piggy_3d.webp" alt="TPA Reconciler" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  4. IRDAI Insurance Claim Reconciler
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Dispute unfair TPA claim deductions. We match disallowed items against the IRDAI Master Non-Payables Schedule to prepare formal appeals.
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#86C159]">
                <span>Reconcile Deductions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 5 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E7E3FF] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_magic_3d.png" alt="Advocate AI" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  5. CuraVeris Advocate AI Assistant
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  24/7 intelligent patient advocate. Ask questions about your bill, understand medical billing codes, and get instant guidance on grievance filings.
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#5E84E2]">
                <span>24/7 Forensic Assistant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 6 */}
            <div className="bg-white rounded-[32px] p-8 border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#DDECFD] p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_share_3d.png" alt="DPDP Vault" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  6. DPDP 2023 Patient Privacy Vault
                </h3>
                <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                  Complete patient data sovereignty under the DPDP Act 2023. Zero monetization, bank-grade encryption at rest, and instant 1-click data purging.
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#43A8B2]">
                <span>100% Zero-Knowledge Privacy</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE 7-MODULE SHOWCASE (Managing your hospital bill defense starts with CuraVeris) */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128] tracking-tight">
              Managing your hospital bill defense starts with CuraVeris
            </h2>
            <p className="text-sm sm:text-base text-[#606470]">
              Connect inpatient invoices, audit pharmaceutical markups, dispute unbundled ICU charges, and protect your financial rights with ease.
            </p>
          </div>

          <div className="curaveris-hero-card p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
            {/* 7 Tab Pills */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-6 border-b border-black/[0.06] no-scrollbar">
              <div className="p-1.5 rounded-full bg-[#EDF0FB] border border-black/[0.03] inline-flex items-center gap-1.5">
                {[
                  { id: "audit", label: "Forensic Audit", icon: ScanLine },
                  { id: "simulator", label: "Savings Calculator", icon: Calculator },
                  { id: "priceCaps", label: "Price Caps", icon: Scale },
                  { id: "petitions", label: "Section 65B Notice", icon: FileCheck2 },
                  { id: "insurance", label: "TPA Reconciler", icon: FileSpreadsheet },
                  { id: "vault", label: "DPDP Vault", icon: Lock },
                  { id: "consumer", label: "Grievance Portal", icon: Building2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeModule === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModule(tab.id as any)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
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
            {activeModule === "audit" && (
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
            {activeModule === "simulator" && (
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
            {activeModule === "priceCaps" && (
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
            {activeModule === "petitions" && (
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

            {/* Tab 5: TPA & Insurance Reconciler */}
            {activeModule === "insurance" && (
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#E7E3FF] text-[#202128] text-xs font-bold border border-[#5E84E2]/30">
                    IRDAI Non-Payable Master Schedule
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                    Insurance claim appeal engine.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                    When TPAs deduct claims under vague &apos;non-medical&apos; or &apos;proportionate&apos; deductions, our reconciler compares each deduction against IRDAI circulars and generates an authoritative appeal letter.
                  </p>
                  <div className="pt-2">
                    <Link href="/bills">
                      <button
                        type="button"
                        className="bg-[#202128] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all hover:scale-[1.02]"
                      >
                        Reconcile Deductions Free
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-3xl border border-black/[0.06] p-6 space-y-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="p-3 bg-[#F5F7FB] rounded-2xl flex justify-between items-center text-xs">
                    <span className="font-bold text-[#202128]">TPA Deduction Disputed</span>
                    <span className="font-mono font-bold text-[#DC2626]">₹28,500</span>
                  </div>
                  <div className="p-3 bg-[#F5F7FB] rounded-2xl flex justify-between items-center text-xs">
                    <span className="font-bold text-[#202128]">IRDAI Ground Cited</span>
                    <span className="font-bold text-[#43A8B2]">Standard Annexure I</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: DPDP Vault */}
            {activeModule === "vault" && (
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

            {/* Tab 7: Consumer Grievance Portal */}
            {activeModule === "consumer" && (
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3.5 py-1 rounded-full bg-[#DDECFD] text-[#202128] text-xs font-bold border border-[#43A8B2]/30">
                    Consumer Protection Act 2019
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                    Formal escalation to statutory desks.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                    If the hospital billing desk fails to issue a refund within 7 working days, CuraVeris auto-populates complaint forms for the National Consumer Helpline and NPPA IPDMS.
                  </p>
                </div>

                <div className="lg:col-span-6 bg-white rounded-3xl border border-black/[0.06] p-6 space-y-3 shadow-xs">
                  <p className="text-xs font-bold text-[#202128]">Connected Regulatory Grievance Desks:</p>
                  <div className="space-y-2 text-xs text-[#606470]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#86C159]" />
                      <span>National Pharmaceutical Pricing Authority (IPDMS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#86C159]" />
                      <span>National Consumer Helpline (NCH Portal)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. STATUTORY MARQUEE CAROUSEL (Infinite Scroll Animation) */}
      <section className="relative z-10 py-7 border-y border-black/[0.05] bg-white overflow-hidden">
        <p className="text-center text-[11px] font-extrabold text-[#606470] uppercase tracking-widest mb-4">
          Audited statutory limits: 800+ Official Price Caps & Package Rules
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

      {/* 6. COLLABORATIVE FAMILY BENTO GRID — "Organize your hospital bill defense" */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex px-4 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
              Complete Patient Financial Protection
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#202128] tracking-tight">
              Organize your family&apos;s healthcare defense together.
            </h2>
            <p className="text-sm sm:text-base text-[#606470] font-medium">
              Effortlessly verify family medical bills, coordinate dispute notices with relatives, and ensure fair treatment together as a team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mint Pastel Bento */}
            <div className="bg-[#DFF1F3] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_share_3d.png" alt="Share" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <Link href="/bills/upload" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Share bill audits
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Collaborate on hospital bill verification with family members, caregivers, and medical advisors in real time.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Family Sharing</span>
                <p className="font-bold text-xs text-[#202128]">Active • 3 Family Members</p>
              </div>
            </div>

            {/* Card 2: Soft Lavender Pastel Bento */}
            <div className="bg-[#E7E3FF] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_folder_3d.png" alt="Petition" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <Link href="/bills/upload" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Joint dispute petition
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Co-sign Section 65B electronic dispute notices with patient authorization for immediate submission.
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
                <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_graph_3d.png" alt="Benchmark" width={48} height={48} className="w-full h-full object-contain" />
                </div>
                <Link href="/bills" className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#202128] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Benchmark rates
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Compare hospital charges against regional benchmarks and CGHS standardized package pricing.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#606470] block">Benchmark</span>
                <p className="font-bold text-xs text-[#202128]">₹18,500 Typical Savings</p>
              </div>
            </div>

            {/* Card 4: Sky Blue Pastel Bento */}
            <div className="bg-[#DDECFD] rounded-[32px] p-7 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:scale-[1.01] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xs">
                  <Image src="/assets/scraped/icon_piggy_3d.webp" alt="DPDP Vault" width={48} height={48} className="w-full h-full object-contain" />
                </div>
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

      {/* 7. CURAVERIS INTELLIGENCE SECTION (With 3D Visual Art) */}
      <section className="relative z-10 py-16 sm:py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex px-4 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#43A8B2]" />
              CURAVERIS INTELLIGENCE
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#202128] tracking-tight">
              Meet CuraVeris Intelligence
            </h2>
            <p className="text-sm sm:text-lg text-[#606470] max-w-xl mx-auto">
              Stop searching, stop guessing, and stop manual line-by-line verification. CuraVeris Intelligence analyzes your medical bills to detect illegal markups, automate legal petitions, and provide actionable evidence whenever you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left AI Frame Preview with 3D Image */}
            <div className="lg:col-span-6 bg-[#F5F7FB] rounded-[36px] p-6 sm:p-8 border border-black/[0.06] shadow-sm space-y-4">
              <div className="rounded-3xl overflow-hidden border border-black/[0.06] shadow-md bg-white">
                <Image
                  src="/assets/curaveris_ai_intelligence.jpg"
                  alt="CuraVeris AI Intelligence Digital Healthcare Advocate"
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#86C159]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statutory Citation Generated</span>
                </div>
                <p className="text-xs text-[#606470] font-mono">
                  NPPA Order S.O. 1331(E) & Consumer Protection Act 2019 Sec. 2(47)
                </p>
              </div>
            </div>

            {/* Right Interactive 5-Feature Breakdown */}
            <div className="lg:col-span-6 space-y-4">
              {[
                {
                  title: "1. Overcharge probability prediction",
                  desc: "AI predicts high-risk line items and overcharge probabilities before you pay the hospital billing counter.",
                },
                {
                  title: "2. ICU package unbundling detection",
                  desc: "Automatically flags duplicate nursing, sanitization, and equipment monitor fees billed outside standard package rates.",
                },
                {
                  title: "3. Statutory device & drug price checks",
                  desc: "Instantly verifies cardiac stents, knee implants, and IV infusions against active NPPA and DPCO ceiling gazettes.",
                },
                {
                  title: "4. Financial distress risk analysis",
                  desc: "Calculates realistic out-of-pocket impact and recommends pre-discharge dispute strategies.",
                },
                {
                  title: "5. Intelligent File Import",
                  desc: "State-of-the-art optical parser for PDFs, smartphone photos, and scanned paper hospital invoices.",
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

      {/* 8. DESKTOP & PLATFORM SHOWCASE ("Take the lead") */}
      <section className="relative z-10 py-16 sm:py-24 bg-[#F5F7FB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex px-4 py-1 rounded-full bg-[#DBF1F4] text-[#202128] text-xs font-bold border border-[#79C5CD]/30">
              Universal Platform
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#202128] tracking-tight">
              Take the lead with CuraVeris Navigator.
            </h2>
            <p className="text-sm sm:text-lg text-[#606470] max-w-xl mx-auto">
              Powerful browser tools and mobile apps designed to keep hospital billing transparent across all your devices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 rounded-[36px] overflow-hidden border border-black/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white">
              <Image
                src="/assets/curaveris_desktop_navigator.jpg"
                alt="CuraVeris Desktop Forensic Navigator Dashboard"
                width={1200}
                height={675}
                className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-white rounded-3xl border border-black/[0.06] shadow-xs space-y-2">
                <span className="w-10 h-10 rounded-2xl bg-[#DBF1F4] text-[#202128] flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5 text-[#43A8B2]" />
                </span>
                <h3 className="font-heading font-bold text-xl text-[#202128]">
                  Web Navigator
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Deep line-by-line inspection, statutory comparisons, and batch export of dispute petitions.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-black/[0.06] shadow-xs space-y-2">
                <span className="w-10 h-10 rounded-2xl bg-[#EDF0FB] text-[#202128] flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5 text-[#5E84E2]" />
                </span>
                <h3 className="font-heading font-bold text-xl text-[#202128]">
                  Mobile Scanning App
                </h3>
                <p className="text-xs text-[#606470] leading-relaxed">
                  Snap a photo of the bill at the hospital counter for instant price cap verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DARK OBSIDIAN AI CHAT BANNER ("Don't search. Just ask") */}
      <section id="ai-chat-section" className="relative z-10 py-12 sm:py-20 bg-white border-t border-black/[0.05]">
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
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-white flex items-center justify-between shadow-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <span>&ldquo;What are my legal rights if the hospital refuses to correct the bill?&rdquo;</span>
                  <ChevronRight className="w-4 h-4 text-[#79C5CD]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECURITY & COMPLIANCE ("Is CuraVeris safe to use?") */}
      <section id="security" className="relative z-10 py-16 sm:py-24 bg-[#F5F7FB]">
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
            <div className="rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#DBF1F4] text-[#202128] shadow-xs flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#43A8B2]" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-[#202128]">
                DPDP Act 2023 Compliant
              </h3>
              <p className="text-xs sm:text-sm text-[#606470] leading-relaxed">
                Your medical bills and health data belong exclusively to you. We never sell, monetize, or license your records to insurance companies or third parties. 1-click permanent data erasure is built into every account.
              </p>
            </div>

            <div className="rounded-[32px] bg-white border border-black/[0.06] p-8 sm:p-10 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#DBF1F4] text-[#202128] shadow-xs flex items-center justify-center">
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

      {/* 11. REAL STORIES / VIDEO TESTIMONIALS (Ice Blue Container) */}
      <section className="relative z-10 py-16 sm:py-24 bg-white border-t border-black/[0.05]">
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
              {[
                {
                  id: 1,
                  name: "Rajesh M., 42 yo",
                  loc: "Bengaluru • Cardiac Inpatient",
                  quote: "Found ₹48,000 in duplicate ICU charges within 5 minutes of uploading our hospital discharge bill. The dispute letter got us an immediate refund.",
                  recovered: "₹48,000 Saved",
                },
                {
                  id: 2,
                  name: "Pooja K., 36 yo",
                  loc: "Delhi NCR • Cardiology Audit",
                  quote: "The hospital billed ₹65,000 for a stent capped at ₹30,080 by NPPA. CuraVeris cited the exact government gazette notification and saved us ₹34,920.",
                  recovered: "₹34,920 Saved",
                },
                {
                  id: 3,
                  name: "Vikram S., 51 yo",
                  loc: "Mumbai • Orthopedic Surgery",
                  quote: "Our insurance TPA rejected ₹28,000 under 'non-payable' consumables. The CuraVeris appeal notice reversed the rejection in 10 days.",
                  recovered: "₹28,000 Saved",
                },
              ].map((card) => {
                const isPlaying = playingVideo === card.id;
                return (
                  <div key={card.id} className="bg-white rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden group">
                    {/* Simulated Video Frame with Play Overlay */}
                    <div className="relative rounded-2xl overflow-hidden bg-[#F5F7FB] border border-black/[0.04] aspect-[16/9] flex items-center justify-center group-hover:shadow-inner transition-shadow">
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#202128] shadow-xs">
                        {card.recovered}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPlayingVideo(isPlaying ? null : card.id)}
                        className="w-12 h-12 rounded-full bg-[#202128] hover:bg-black text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95"
                      >
                        {isPlaying ? <Volume2 className="w-5 h-5 text-[#86C159]" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
                      </button>

                      {isPlaying && (
                        <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1">
                          <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#43A8B2] animate-pulse w-2/3" />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-[#202128]">0:42</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#D97706] text-xs">
                      {"★★★★★"}
                    </div>
                    <p className="text-xs sm:text-sm text-[#202128] font-medium leading-relaxed">
                      &ldquo;{card.quote}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-black/[0.04]">
                      <p className="font-bold text-xs text-[#202128]">{card.name}</p>
                      <p className="text-[10px] text-[#606470]">{card.loc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ ACCORDION SECTION */}
      <section className="relative z-10 py-16 sm:py-24 bg-[#F5F7FB]">
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
                  className="rounded-2xl bg-white border border-black/[0.06] overflow-hidden shadow-xs transition-all"
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

      {/* 13. FINAL HIGH-IMPACT CTA BANNER (Pastel Gradient Banner) */}
      <section className="relative z-10 py-12 sm:py-20 bg-white border-t border-black/[0.05]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="curaveris-hero-card p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
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

      {/* 14. OBSIDIAN FOOTER */}
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
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-neutral-400">
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
                <p><Link href="/compliance" className="hover:text-white transition-colors">Compliance Gazette</Link></p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Advocacy & Team</p>
                <p><Link href="/about" className="hover:text-white transition-colors">About Us</Link></p>
                <p><Link href="/features" className="hover:text-white transition-colors">Features Hub</Link></p>
                <p><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></p>
                <p><Link href="/contact" className="hover:text-white transition-colors">Grievance Desk</Link></p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Legal & DPDP 2023</p>
                <p><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></p>
                <p><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></p>
                <p><Link href="/data-policy" className="hover:text-white transition-colors">Data Vault Policy</Link></p>
                <p><Link href="/security" className="hover:text-white transition-colors">Security Controls</Link></p>
              </div>
            </div>
          </div>

          {/* Statutory Compliance & Standards Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-semibold">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Statutory Standards:</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/10">DPDP Act 2023</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/10">NPPA & DPCO Price Caps</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/10">Section 65B BSA 2023 Evidence</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/10">CGHS Package Rates</span>
            </div>

            <div className="flex items-center gap-3">
              <a href="#download" className="hover:opacity-90 transition-opacity">
                <Image src="/assets/scraped/btn_app_store.png" alt="Download on App Store" width={120} height={36} className="h-9 w-auto object-contain" />
              </a>
              <a href="#download" className="hover:opacity-90 transition-opacity">
                <Image src="/assets/scraped/btn_google_play.png" alt="Get it on Google Play" width={120} height={36} className="h-9 w-auto object-contain" />
              </a>
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
