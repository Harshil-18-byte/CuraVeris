import Link from "next/link";
import { ShieldCheck, FileCheck, ArrowRight, Lock, Scale, Building2, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  const statutoryFrameworks = [
    { title: "CGHS Rate Master", desc: "Central Government Health Scheme procedural benchmarks and tariffs", icon: Scale },
    { title: "NPPA Gazette Caps", desc: "Mandatory statutory price caps for DES stents, orthopaedic & cardiac implants", icon: ShieldCheck },
    { title: "DPCO 2013 / NLEM", desc: "National List of Essential Medicines formula and pharmaceutical retail ceilings", icon: FileCheck },
    { title: "IRDAI Standardization", desc: "Non-payable items circular and prohibited unbundled administrative overheads", icon: Building2 },
    { title: "CBIC GST Exemptions", desc: "Notification 12/2017 healthcare service taxation exemption verification", icon: Lock },
    { title: "Ayushman Bharat PM-JAY", desc: "National Health Authority fixed-package zero out-of-pocket compliance", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="h-20 border-b border-neutral-300 bg-white px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-bold text-xl">
            C
          </div>
          <span className="font-heading font-bold text-2xl text-neutral-900 tracking-tight">
            CuraVeris
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="md">
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-surface border border-primary/20 rounded-badge text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>Automated Indian Medical Billing Audit Engine</span>
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-tight">
            Cryptographic Medical Bill Auditing for India.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 font-body leading-relaxed max-w-2xl">
            Upload hospital invoices (PDF or photo). CuraVeris runs OCR itemization, validates every line item against government statutory gazettes (CGHS, NPPA, DPCO, IRDAI, GST), and produces ready-to-file legal dispute documents sealed with Section 65B Merkle certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Audit Your Hospital Bill Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Operations Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-neutral-300 grid grid-cols-3 gap-6 text-neutral-900">
            <div>
              <span className="font-heading font-bold text-2xl block text-primary">14,200+</span>
              <span className="text-xs text-neutral-600">Hospital Bills Audited</span>
            </div>
            <div>
              <span className="font-heading font-bold text-2xl block text-danger">₹8.4 Cr+</span>
              <span className="text-xs text-neutral-600">Overcharges Flagged</span>
            </div>
            <div>
              <span className="font-heading font-bold text-2xl block text-success">100%</span>
              <span className="text-xs text-neutral-600">DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Sample Audit Card */}
        <div className="lg:col-span-5">
          <Card padding="lg" accentColor="danger" className="space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-300">
              <div>
                <span className="text-xs font-semibold text-neutral-600 uppercase">
                  Audit Verification Sample
                </span>
                <h3 className="font-heading font-bold text-base text-neutral-900">
                  Apollo Multispeciality Invoice #4892
                </h3>
              </div>
              <Badge variant="danger">HIGH RISK</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-danger-surface/40 border border-danger/20 rounded-card flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">NPPA Implant Violation</span>
                  <span className="text-neutral-600">Drug Eluting Stent billed at ₹65,000. Statutory cap: ₹27,890.</span>
                  <span className="font-mono font-bold text-danger block mt-1">Excess: ₹37,110</span>
                </div>
              </div>

              <div className="p-3 bg-danger-surface/40 border border-danger/20 rounded-card flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">IRDAI Unbundled Overhead</span>
                  <span className="text-neutral-600">Hospital Administrative & MRD Charges billed separately.</span>
                  <span className="font-mono font-bold text-danger block mt-1">Excess: ₹4,500</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-300 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-600 block">Total Recoverable Sum</span>
                <span className="font-mono font-bold text-xl text-danger">₹41,610</span>
              </div>
              <Link href="/register">
                <Button size="sm">Audit Free</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Statutory Frameworks Grid */}
      <section className="bg-white border-t border-neutral-300 py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
              Statutory Gazette Rules Enforced
            </h2>
            <p className="text-sm text-neutral-600 mt-2 font-body">
              Every audit strictly cross-references published Indian ministerial orders and healthcare price regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statutoryFrameworks.map((fw, idx) => {
              const Icon = fw.icon;
              return (
                <Card key={idx} padding="md" className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-surface text-primary flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-neutral-900">
                    {fw.title}
                  </h3>
                  <p className="text-xs text-neutral-600 font-body leading-relaxed">
                    {fw.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-300 py-8 px-6 lg:px-12 text-center text-xs text-neutral-600">
        <p>© 2026 CuraVeris. Built for Indian Healthcare Transparency & Consumer Protection.</p>
        <p className="mt-1">Section 65B Digital Evidence Architecture · DPDP Act 2023 Certified</p>
      </footer>
    </div>
  );
}
