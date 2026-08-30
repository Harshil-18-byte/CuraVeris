import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, login, logout, setUser, initialize } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser,
    initialize,
  };
}
