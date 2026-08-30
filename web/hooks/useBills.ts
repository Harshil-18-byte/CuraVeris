import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useBills(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({
    queryKey: ["bills", params],
    queryFn: () => api.bills.list(params),
  });
}

export function useBillDetail(billId: string) {
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: () => api.bills.getById(billId),
    enabled: !!billId,
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => api.bills.deleteById(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}
