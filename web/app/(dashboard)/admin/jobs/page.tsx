"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import apiClient from "@/lib/api";

export default function AdminJobsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "workers"],
    queryFn: () => apiClient.get("/admin/workers").then((r) => r.data),
    staleTime: 10 * 1000,
  });

  const queues = data?.queues ?? [];

  return (
    <PageShell
      title="Celery Background Worker Telemetry"
      description="Active queue concurrency, task allocation, and worker heartbeats."
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <InlineError
          title="Could not load worker telemetry"
          message={(error as any)?.message ?? "An error occurred fetching background worker statuses."}
          onRetry={() => refetch()}
        />
      ) : queues.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No background queues active"
          description="Worker telemetry is currently unavailable or workers are offline."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {queues.map((q: any) => (
            <Card key={q.name} padding="md" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-primary">{q.name}</span>
                <Badge variant={q.status === "ONLINE" || q.status === "ACTIVE" ? "success" : "warning"}>
                  {q.status || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 font-body">{q.tasks || "Task execution engine"}</p>
              <div className="pt-2 text-xs text-neutral-600 border-t border-neutral-300">
                Concurrency: <span className="font-semibold text-neutral-900">{q.concurrency ?? 1} processes</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

