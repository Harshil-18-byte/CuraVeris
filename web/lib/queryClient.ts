import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: (failureCount, error: any) => {
        // Do not retry 401, 403, 404, or 409
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404 || status === 409) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
