import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAudit(billId: string) {
  return useQuery({
    queryKey: ["audit", billId],
    queryFn: () => api.audits.getByBillId(billId),
    enabled: !!billId,
    retry: false,
  });
}

export function useAuditFindings(
  billId: string,
  params?: { page?: number; per_page?: number; source?: string; severity?: string; finding_type?: string }
) {
  return useQuery({
    queryKey: ["audit-findings", billId, params],
    queryFn: () => api.audits.getFindings(billId, params),
    enabled: !!billId,
  });
}

export function useEvidence(billId: string) {
  return useQuery({
    queryKey: ["evidence", billId],
    queryFn: () => api.evidence.getByBillId(billId),
    enabled: !!billId,
  });
}
