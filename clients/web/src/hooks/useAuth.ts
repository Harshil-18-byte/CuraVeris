/**
 * Authentication and User Session Hooks.
 */
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { authStore } from '../lib/auth/store';
import { User, TokenResponse } from '../types/api';

export function useAuth() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(authStore.getUser());

  useEffect(() => {
    return authStore.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  const loginMutation = useMutation<TokenResponse, Error, { email: string; password: string }>({
    mutationFn: (credentials) =>
      apiClient<TokenResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
      }),
    onSuccess: (data) => {
      authStore.setSession(data);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const registerMutation = useMutation<TokenResponse, Error, { email: string; password: string; full_name: string; role?: string }>({
    mutationFn: (userData) =>
      apiClient<TokenResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true,
      }),
    onSuccess: (data) => {
      authStore.setSession(data);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const logout = () => {
    authStore.clearSession();
    queryClient.clear();
  };

  const userQuery = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: () => {
      if (!authStore.isAuthenticated()) return null;
      return apiClient<User>('/api/v1/auth/me');
    },
    enabled: authStore.isAuthenticated(),
    initialData: authStore.getUser(),
  });

  return {
    user: userQuery.data ?? currentUser,
    isAuthenticated: authStore.isAuthenticated(),
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logout,
  };
}
