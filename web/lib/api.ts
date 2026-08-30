import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  User,
  Bill,
  BillSummary,
  Audit,
  AuditFinding,
  Notification,
  EvidenceRecord,
  PaginatedResponse,
  ApiError,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer JWT and X-Request-ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cv_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  config.headers["X-Request-ID"] = requestId;
  return config;
});

// Response Interceptor: 401 Token Refresh & Error Normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("cv_refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("cv_access_token");
        localStorage.removeItem("cv_refresh_token");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem("cv_access_token", data.access_token);
        localStorage.setItem("cv_refresh_token", data.refresh_token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        processQueue(null, data.access_token);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("cv_access_token");
        localStorage.removeItem("cv_refresh_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 Rate Limits
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const appErr: ApiError = {
        code: "RATE_LIMITED",
        message: "Too many requests. Please slow down.",
        retryable: true,
        retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : 60,
      };
      return Promise.reject(appErr);
    }

    return Promise.reject(error);
  }
);

// Typed API modules
export const api = {
  auth: {
    register: async (data: { email: string; password: string; full_name: string; phone_number?: string; dpdp_consent: boolean }) => {
      const resp = await apiClient.post("/auth/register", data);
      return resp.data;
    },
    verifyOtp: async (data: { email: string; otp: string; purpose?: string }) => {
      const resp = await apiClient.post("/auth/verify-otp", data);
      return resp.data;
    },
    login: async (data: { email_or_phone: string; password: string }) => {
      const resp = await apiClient.post("/auth/login", data);
      return resp.data;
    },
    refresh: async (refreshToken: string) => {
      const resp = await apiClient.post("/auth/refresh", { refresh_token: refreshToken });
      return resp.data;
    },
    logout: async () => {
      const resp = await apiClient.post("/auth/logout");
      return resp.data;
    },
    requestPasswordReset: async (email: string) => {
      const resp = await apiClient.post("/auth/request-password-reset", { email });
      return resp.data;
    },
    resetPassword: async (data: { email: string; otp: string; new_password: string }) => {
      const resp = await apiClient.post("/auth/reset-password", data);
      return resp.data;
    },
  },

  bills: {
    upload: async (
      formData: FormData,
      onProgress?: (progress: number) => void
    ): Promise<{ bill_id: string; status: string; message: string }> => {
      const resp = await apiClient.post("/bills/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return resp.data;
    },
    list: async (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<BillSummary>> => {
      const resp = await apiClient.get("/bills", { params });
      return resp.data;
    },
    getById: async (billId: string): Promise<Bill> => {
      const resp = await apiClient.get(`/bills/${billId}`);
      return resp.data;
    },
    getStatus: async (billId: string) => {
      const resp = await apiClient.get(`/bills/${billId}/status`);
      return resp.data;
    },
    deleteById: async (billId: string): Promise<void> => {
      await apiClient.delete(`/bills/${billId}`);
    },
  },

  audits: {
    getByBillId: async (billId: string): Promise<Audit> => {
      const resp = await apiClient.get(`/bills/${billId}/audit`);
      return resp.data;
    },
    getFindings: async (
      billId: string,
      params?: { page?: number; per_page?: number; source?: string; severity?: string; finding_type?: string }
    ): Promise<PaginatedResponse<AuditFinding>> => {
      const resp = await apiClient.get(`/bills/${billId}/audit/findings`, { params });
      return resp.data;
    },
    getFinding: async (billId: string, findingId: string): Promise<AuditFinding> => {
      const resp = await apiClient.get(`/bills/${billId}/audit/findings/${findingId}`);
      return resp.data;
    },
    getEvidence: async (billId: string): Promise<EvidenceRecord> => {
      const resp = await apiClient.get(`/bills/${billId}/evidence`);
      return resp.data;
    },
  },

  evidence: {
    getByBillId: async (billId: string): Promise<EvidenceRecord> => {
      const resp = await apiClient.get(`/bills/${billId}/evidence`);
      return resp.data;
    },
    verify: async (evidenceId: string) => {
      const resp = await apiClient.post(`/evidence/${evidenceId}/verify`);
      return resp.data;
    },
  },

  notifications: {
    list: async (params?: { page?: number; per_page?: number; filter_type?: string }): Promise<PaginatedResponse<Notification>> => {
      const resp = await apiClient.get("/notifications", { params });
      return resp.data;
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
      const resp = await apiClient.get("/notifications/unread-count");
      return resp.data;
    },
    markRead: async (notificationId: string): Promise<void> => {
      await apiClient.post(`/notifications/${notificationId}/read`);
    },
    markAllRead: async (): Promise<void> => {
      await apiClient.post("/notifications/read-all");
    },
  },

  users: {
    getMe: async (): Promise<User> => {
      const resp = await apiClient.get("/users/me");
      return resp.data;
    },
    updateMe: async (data: { full_name?: string; phone_number?: string }): Promise<User> => {
      const resp = await apiClient.patch("/users/me", data);
      return resp.data;
    },
  },

  legalDocs: {
    getDisputeNotice: async (billId: string) => {
      const resp = await apiClient.get(`/legal-docs/bills/${billId}/dispute-notice`);
      return resp.data;
    },
  },
};
