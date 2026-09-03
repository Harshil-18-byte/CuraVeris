import { create } from "zustand";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }, user?: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tokens, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cv_access_token", tokens.access_token);
      localStorage.setItem("cv_refresh_token", tokens.refresh_token);
      if (user) {
        localStorage.setItem("cv_user", JSON.stringify(user));
      }
    }
    set({
      accessToken: tokens.access_token,
      user: user || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cv_access_token", token);
    }
    set({
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cv_access_token");
      localStorage.removeItem("cv_refresh_token");
      localStorage.removeItem("cv_user");
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("cv_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("cv_user");
      }
    }
    set({ user, isAuthenticated: !!user });
  },

  initialize: async () => {
    set({ isLoading: true });
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem("cv_access_token");
    let cachedUser: User | null = null;
    try {
      const stored = localStorage.getItem("cv_user");
      if (stored) {
        cachedUser = JSON.parse(stored);
      }
    } catch {
      // ignore parse error
    }

    if (!token) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await api.users.getMe();
      if (typeof window !== "undefined") {
        localStorage.setItem("cv_user", JSON.stringify(user));
      }
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      if (cachedUser) {
        set({
          user: cachedUser,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (token.startsWith("demo_")) {
        const fallbackUser: User = {
          id: "user-" + Date.now(),
          email: "patient@curaveris.ai",
          full_name: "Patient Account",
          role: "patient",
          phone_verified: true,
          email_verified: true,
          dpdp_consent_given: true,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem("cv_user", JSON.stringify(fallbackUser));
        set({
          user: fallbackUser,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("cv_access_token");
        localStorage.removeItem("cv_refresh_token");
        localStorage.removeItem("cv_user");
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    }
  },
}));
