/**
 * Client-side Authentication and Token Management Store.
 */
import { User, TokenResponse } from '../../types/api';

const TOKEN_KEY = 'curaveris_access_token';
const REFRESH_KEY = 'curaveris_refresh_token';
const USER_KEY = 'curaveris_user';

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

export const authStore = {
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  setSession(data: TokenResponse): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_KEY, data.refresh_token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      listeners.forEach((cb) => cb(data.user));
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      listeners.forEach((cb) => cb(null));
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
