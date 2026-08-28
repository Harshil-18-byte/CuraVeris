/**
 * Bills and Medical Audit Queries & Mutations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { BillSummary } from '../types/api';

export function useBills() {
  const queryClient = useQueryClient();

  const billsQuery = useQuery<BillSummary[]>({
    queryKey: ['bills', 'list'],
    queryFn: () => apiClient<BillSummary[]>('/api/v1/bills/recent'),
  });

  const uploadBillMutation = useMutation<BillSummary, Error, FormData>({
    mutationFn: (formData) =>
      apiClient<BillSummary>('/api/v1/bills/upload', {
        method: 'POST',
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', 'list'] });
    },
  });

  return {
    bills: billsQuery.data ?? [],
    isLoading: billsQuery.isLoading,
    error: billsQuery.error,
    uploadBill: uploadBillMutation.mutateAsync,
    isUploading: uploadBillMutation.isPending,
  };
}
