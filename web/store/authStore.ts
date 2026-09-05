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

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  const token = localStorage.getItem("cv_access_token");
  const storedUserStr = localStorage.getItem("cv_user");
  let user: User | null = null;
  if (storedUserStr) {
    try {
      user = JSON.parse(storedUserStr);
    } catch {
      user = null;
    }
  }

  if (token) {
    return {
      user,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),

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
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem("cv_access_token");
    const storedUserStr = localStorage.getItem("cv_user");
    let cachedUser: User | null = null;

    if (storedUserStr) {
      try {
        cachedUser = JSON.parse(storedUserStr);
      } catch {
        cachedUser = null;
      }
    }

    if (!token) {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // Keep authenticated state active immediately while validating in background
    set({
      user: cachedUser || get().user,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
    });

    try {
      // Validate token and fetch latest user info
      const user = await api.users.getMe();
      if (user) {
        localStorage.setItem("cv_user", JSON.stringify(user));
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      // Retain the cached user session smoothly without blocking or resetting authentication
      set({
        user: cachedUser || get().user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },
}));
