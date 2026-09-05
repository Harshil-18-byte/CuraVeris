"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { RiskGauge } from "@/components/audit/RiskGauge";
import { ShapChart } from "@/components/audit/ShapChart";
import { formatCurrency } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE_URL = API_URL.replace(/\/+$/, "") + "/api/v1";

export default function DemoPage() {
  const router = useRouter();
  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("findings");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/bills/demo/sample`)
      .then((res) => {
        setDemoData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load demo data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleGenerateComplaint = async () => {
    setGeneratingLetter(true);
    try {
      // Simulate/Trigger legal document generator for demo bill
      const docPayload = {
        document_type: "HOSPITAL_COMPLAINT",
        hospital_name: demoData?.bill?.hospital_name || "Apollo Hospitals, Mumbai",
        overcharge_amount: "₹18,576.60",
        date: new Date().toLocaleDateString("en-IN"),
      };
      
      // Provide instant downloadable representation
      setTimeout(() => {
        setGeneratedDoc({
          title: "Formal Hospital Overcharge Dispute Notice",
          hospital: docPayload.hospital_name,
          overcharge: docPayload.overcharge_amount,
          date: docPayload.date,
          download_url: `${BASE_URL}/bills/demo/sample`,
        });
        setGeneratingLetter(false);
      }, 800);
    } catch (e) {
      setGeneratingLetter(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `I ran an audit on a hospital bill using CuraVeris and identified ₹18,576 in statutory overcharges violating NPPA and CGHS caps at Apollo Hospitals, Mumbai. Check demo audit: ${typeof window !== "undefined" ? window.location.href : ""}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 text-[#43A8B2] animate-spin" />
        <p className="font-heading font-bold text-sm text-[#202128]">
          Loading sample hospital audit...
        </p>
      </div>
    );
  }

  const bill = demoData?.bill;
  const audit = demoData?.audit;
  const findings = demoData?.findings || [];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col selection:bg-[#DBF1F4] selection:text-[#202128]">
      {/* 1. TOP AMBER DEMO BANNER */}
      <div className="bg-[#FEF3C7] border-b border-[#FDE68A] py-2.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D97706]">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              This is a live interactive demonstration using a sample cardiac surgery bill.
            </span>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#202128] hover:underline"
          >
            <span>Upload your own bill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="bg-white border-b border-black/[0.06] px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo href="/" showTagline={true} size="sm" />
          <div className="flex items-center gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-xs rounded-full transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>
            <Link href="/register">
              <Button size="sm" variant="primary" className="rounded-full px-5 bg-[#202128] text-white hover:bg-black font-bold">
                Get Your Audit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. MAIN AUDIT CONTENT */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6 flex-1">
        {/* Header Hero Card */}
        <div className="curaveris-hero-card p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-sm space-y-6 bg-gradient-to-br from-white via-[#F5F7FB] to-[#DBF1F4]/30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#606470] font-semibold mb-1">
                <span>Sample Patient: Rajesh Kumar</span>
                <span>•</span>
                <span>Stay: 10 Jan 2024 – 13 Jan 2024</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#202128] tracking-tight">
                {bill?.hospital_name || "Apollo Hospitals, Mumbai"}
              </h1>
              <p className="text-xs text-[#606470] mt-1 font-medium">
                Coronary Angioplasty & Stent Implantation • Insurance: MD India TPA
              </p>
            </div>

            {/* Key Metrics Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-5 py-3 rounded-2xl border border-black/[0.06] shadow-xs text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#606470] block">
                  Total Bill
                </span>
                <span className="font-mono font-extrabold text-lg text-[#202128]">
                  ₹1,79,840
                </span>
              </div>

              <div className="bg-white px-5 py-3 rounded-2xl border border-black/[0.06] shadow-xs text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block">
                  Extra Charged
                </span>
                <span className="font-mono font-extrabold text-lg text-[#DC2626]">
                  ₹18,577
                </span>
              </div>

              <div className="bg-white px-5 py-3 rounded-2xl border border-black/[0.06] shadow-xs text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] block">
                  Violations
                </span>
                <span className="font-heading font-extrabold text-lg text-[#202128]">
                  5 Found
                </span>
              </div>
            </div>
          </div>

          {/* Alert Strip */}
          <div className="p-3.5 bg-[#FEE2E2] border border-[#FECACA] rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-[#DC2626]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>High Concern · 5 charges found above official government price limits (NPPA, CGHS, IRDAI).</span>
            </div>
            <button
              onClick={handleGenerateComplaint}
              disabled={generatingLetter}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#202128] text-white rounded-full font-bold text-xs hover:bg-black transition-colors"
            >
              {generatingLetter ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Create My Complaint Letter</span>
            </button>
          </div>
        </div>

        {/* Generated Letter Notification Modal/Banner if created */}
        {generatedDoc && (
          <div className="p-5 bg-white border border-[#43A8B2]/40 rounded-[28px] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DBF1F4] flex items-center justify-center text-[#202128] flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#43A8B2]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-[#202128]">
                  {generatedDoc.title} Ready
                </h4>
                <p className="text-xs text-[#606470] mt-0.5">
                  Prepared for {generatedDoc.hospital} citing NPPA 2017 & CGHS 2022 statutory orders.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const blob = new Blob(
                    [
                      `FORMAL MEDICAL BILLING DISPUTE NOTICE\n\nTo:\nThe Medical Superintendent\n${generatedDoc.hospital}\n\nSubject: Formal Dispute regarding overcharges of ${generatedDoc.overcharge} on Hospital Bill\nDate: ${generatedDoc.date}\n\nUnder Section 65B of the Indian Evidence Act and NPPA Price Regulation Orders, this notice serves as a formal demand to rectify the confirmed billing violations on patient account.\n\nSummary of Findings:\n1. Drug Eluting Coronary Stent (DES) — NPPA Violation: ₹14,110 overcharge\n2. Echocardiography — CGHS Schedule Violation: ₹2,400 overcharge\n3. Non-payable charges (Registration & Attendant): ₹2,000 overcharge\n4. GST Misapplication: ₹66.60\n\nTotal Overcharge Amount: ₹18,576.60\n\nPlease adjust the final invoice within 15 business days.\n\nSigned,\nCuraVeris Patient Advocacy Network`
                    ],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "Apollo_Hospitals_Dispute_Notice.txt";
                  a.click();
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-[#202128] hover:bg-black text-white rounded-full font-bold text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Notice</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full font-bold text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <Tabs.List className="bg-[#EDF0FB] rounded-full p-1.5 flex gap-2 overflow-x-auto select-none border border-black/[0.03]">
            <Tabs.Trigger
              value="findings"
              className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Overcharges Found ({findings.length})</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="assessment"
              className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Our Assessment & AI Analysis</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="evidence"
              className="h-10 px-5 text-xs font-bold rounded-full text-[#606470] data-[state=active]:text-[#202128] data-[state=active]:bg-[#DBF1F4] data-[state=active]:shadow-xs hover:text-[#202128] transition-all flex items-center gap-2 focus:outline-none"
            >
              <Lock className="w-4 h-4" />
              <span>Section 65B Proof Certificate</span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* TAB 1: FINDINGS */}
          <Tabs.Content value="findings" className="focus:outline-none space-y-3">
            <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#202128]">
                    5 Confirmed Pricing Violations
                  </h3>
                  <p className="text-xs text-[#606470]">
                    Checked against NPPA ceiling orders, CGHS schedule, and IRDAI rules.
                  </p>
                </div>
                <button
                  onClick={handleGenerateComplaint}
                  disabled={generatingLetter}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#202128] hover:bg-black text-white font-bold text-xs rounded-full shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Dispute Letter</span>
                </button>
              </div>

              {/* Findings Accordion Items */}
              <div className="space-y-3">
                {findings.map((f: any, idx: number) => (
                  <div
                    key={f.id || idx}
                    className="border border-black/[0.06] rounded-2xl p-4 bg-[#F5F7FB]/50 hover:bg-[#F5F7FB] transition-all"
                  >
                    <div
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                            {f.finding_type}
                          </span>
                          <span className="text-xs font-bold text-[#202128]">
                            {f.item_description}
                          </span>
                        </div>
                        <p className="text-xs text-[#606470]">{f.user_explanation}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] text-[#606470] block font-semibold">Overcharge</span>
                          <span className="font-mono font-extrabold text-sm text-[#DC2626]">
                            ₹{Number(f.overcharge_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {expandedId === f.id ? (
                          <ChevronUp className="w-4 h-4 text-[#606470]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#606470]" />
                        )}
                      </div>
                    </div>

                    {expandedId === f.id && (
                      <div className="mt-3 pt-3 border-t border-black/[0.06] text-xs space-y-2 animate-in fade-in-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-black/[0.04]">
                          <div>
                            <span className="text-[#606470] block font-semibold">Billed Price</span>
                            <span className="font-mono font-bold text-[#202128]">
                              ₹{Number(f.billed_amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#606470] block font-semibold">Govt Benchmark</span>
                            <span className="font-mono font-bold text-[#43A8B2]">
                              ₹{Number(f.benchmark_amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#606470] block font-semibold">Legal Rule</span>
                            <span className="font-medium text-[#202128] text-[11px] truncate block">
                              {f.statutory_reference}
                            </span>
                          </div>
                        </div>
                        <p className="text-[#606470] text-[11px] leading-relaxed">
                          <strong>Statutory Basis:</strong> {f.legal_basis}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Content>

          {/* TAB 2: ASSESSMENT */}
          <Tabs.Content value="assessment" className="focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-xs">
                <RiskGauge
                  score={Number(audit?.risk_score || 0.74)}
                  label={audit?.risk_label || "HIGH"}
                  uncertaintyLower={Number(audit?.uncertainty_lower || 0.59)}
                  uncertaintyUpper={Number(audit?.uncertainty_upper || 0.87)}
                />
              </div>
              <div className="lg:col-span-7 bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-xs">
                <ShapChart shapValues={audit?.shap_values} />
              </div>
            </div>
          </Tabs.Content>

          {/* TAB 3: EVIDENCE */}
          <Tabs.Content value="evidence" className="focus:outline-none">
            <div className="bg-white p-8 rounded-[32px] border border-black/[0.06] shadow-xs space-y-6 text-center max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#DBF1F4] flex items-center justify-center text-[#202128] mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8 text-[#43A8B2]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#202128]">
                  Section 65B Tamper-Evident Evidence Record
                </h3>
                <p className="text-xs text-[#606470] mt-1 font-medium">
                  Cryptographically verified Merkle tree hash under Section 65B of the Indian Evidence Act.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-4 rounded-2xl border border-black/[0.04] text-left space-y-2 font-mono text-xs">
                <div>
                  <span className="text-[#606470] block font-sans font-semibold text-[10px] uppercase">
                    Merkle Root Hash (SHA-256)
                  </span>
                  <span className="text-[#202128] break-all font-bold">
                    8f3d9a7c1e5b204687d9a1bc4029f635e810a9b2c3d4e5f6a7b8c9d0e1f2a3b4
                  </span>
                </div>
                <div>
                  <span className="text-[#606470] block font-sans font-semibold text-[10px] uppercase">
                    HMAC-SHA256 Signature
                  </span>
                  <span className="text-[#43A8B2] break-all font-bold">
                    c49e7b2a1f0d38e65a9c8b7e2d1f0a3948e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/register">
                  <Button variant="primary" size="md" className="rounded-full px-6 bg-[#202128] hover:bg-black text-white font-bold">
                    Start Auditing Your Own Bills →
                  </Button>
                </Link>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}
