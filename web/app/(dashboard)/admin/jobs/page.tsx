"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminJobsPage() {
  const queues = [
    { name: "bill_processing", concurrency: 2, status: "ONLINE", tasks: "OCR, Statutory Audit, ML Inference, Merkle Sealing" },
    { name: "notifications", concurrency: 2, status: "ONLINE", tasks: "Resend Email & Web Push Dispatch" },
    { name: "default", concurrency: 1, status: "ONLINE", tasks: "Background Housekeeping & Rate Limiter Cleanup" },
  ];

  return (
    <PageShell
      title="Celery Background Worker Telemetry"
      description="Active queue concurrency, task allocation, and worker heartbeats."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queues.map((q) => (
          <Card key={q.name} padding="md" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-primary">{q.name}</span>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <p className="text-xs text-neutral-600 font-body">{q.tasks}</p>
            <div className="pt-2 text-xs text-neutral-600 border-t border-neutral-300">
              Concurrency: <span className="font-semibold text-neutral-900">{q.concurrency} processes</span>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
