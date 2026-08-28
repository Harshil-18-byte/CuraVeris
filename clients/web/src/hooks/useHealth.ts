/**
 * React Query Hooks for Backend System & Health Probes.
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { HealthResponse, LivenessResponse, ReadinessResponse } from '../types/api';

export function useSystemHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['system', 'health'],
    queryFn: () => apiClient<HealthResponse>('/health', { skipAuth: true }),
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useLiveness() {
  return useQuery<LivenessResponse>({
    queryKey: ['system', 'liveness'],
    queryFn: () => apiClient<LivenessResponse>('/health/live', { skipAuth: true }),
  });
}

export function useReadiness() {
  return useQuery<ReadinessResponse>({
    queryKey: ['system', 'readiness'],
    queryFn: () => apiClient<ReadinessResponse>('/health/ready', { skipAuth: true }),
  });
}
