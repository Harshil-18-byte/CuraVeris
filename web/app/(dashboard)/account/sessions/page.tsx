"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Laptop, Smartphone, Globe, ArrowLeft, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { InlineError } from "@/components/ui/InlineError";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function UserSessionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", "sessions"],
    queryFn: () => apiClient.get("/users/me/sessions").then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.delete(`/users/me/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "sessions"] });
    },
  });

  const sessions = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <PageShell
      title="Active Login Sessions"
      description="Manage and revoke active authenticated devices across your CuraVeris account."
      action={
        <Link href="/account">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Account
          </Button>
        </Link>
      }
    >
      {isError ? (
        <InlineError
          title="Could not load active sessions"
          message={(error as any)?.message ?? "An error occurred retrieving your active devices."}
          onRetry={() => refetch()}
        />
      ) : (
        <Card padding="md" className="bg-[#111520] border-white/10 divide-y divide-white/10">
          {isLoading ? (
            <div className="py-4 space-y-4">
              <SkeletonRow columns={3} />
              <SkeletonRow columns={3} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Shield}
                title="Current Session Only"
                description="You are currently signed in from this browser session."
              />
            </div>
          ) : (
            sessions.map((sess: any) => (
              <div key={sess.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400">
                    {sess.device_type === "mobile" ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-sm text-white">
                        {sess.device_name || "Web Browser Session"}
                      </span>
                      {sess.is_current && <Badge variant="brand">CURRENT</Badge>}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono mt-0.5 block">
                      IP: {sess.ip_address || "127.0.0.1"} • Last active {formatDate(sess.last_active_at || sess.created_at)}
                    </span>
                  </div>
                </div>

                {!sess.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => revokeMutation.mutate(sess.id)}
                    isLoading={revokeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </Card>
      )}
    </PageShell>
  );
}
