import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-300 shadow-card">
        <div className="w-16 h-16 bg-primary-surface text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-badge text-xs font-semibold text-amber-700">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>404 — Page Not Found</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-neutral-900 tracking-tight">
            Resource Unavailable
          </h1>
          <p className="text-sm text-neutral-600 font-body leading-relaxed">
            The page or statutory audit record you requested could not be located. It may have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="md" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Home Page</span>
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-400 font-mono">
        CuraVeris Automated Statutory Medical Audit Engine
      </p>
    </div>
  );
}
