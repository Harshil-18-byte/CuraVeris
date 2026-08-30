"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Users, Layers, IndianRupee, Activity } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await apiClient.get("/admin/metrics");
        setMetrics(res.data);
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <PageShell
      title="Admin System Telemetry"
      description="Real-time monitoring of audit queues, database operations, and statutory violation metrics."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Total Patients Registered
            </span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
            {metrics?.total_users || 0}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Total Invoices Ingested
            </span>
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
            {metrics?.total_bills || 0}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Audits Completed
            </span>
            <Activity className="w-5 h-5 text-success" />
          </div>
          <p className="font-heading font-bold text-3xl text-neutral-900 mt-2">
            {metrics?.audited_bills || 0}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Total Overcharges Flagged
            </span>
            <IndianRupee className="w-5 h-5 text-danger" />
          </div>
          <p className="font-mono font-bold text-2xl text-danger mt-2">
            {formatCurrency(metrics?.total_overcharge_flagged_inr || 0)}
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
