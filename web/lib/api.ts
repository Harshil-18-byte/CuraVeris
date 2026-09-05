import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  User,
  Bill,
  BillSummary,
  Audit,
  AuditFinding,
  Notification,
  EvidenceRecord,
  PaginatedResponse,
  FinancialRiskAssessment,
  StressScenarioResult,
  VaRResult,
  ModelRiskResult,
  FRMInputs,
  FRMAsyncResponse,
  UserStats,
  HospitalTrustScore,
  BillComparisonResult,
} from "@/types";

// ─── Error Type ────────────────────────────────────────────────────────────────

export interface AppError {
  code: string;
  message: string;
  retryable: boolean;
  requestId: string | null;
  status: number;
}

// ─── Request Types ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  dpdp_consent: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose?: string;
}

export interface LoginRequest {
  email_or_phone: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface BillListParams {
  page?: number;
  per_page?: number;
  status?: string;
  sort?: string;
}

export interface FindingsParams {
  page?: number;
  per_page?: number;
  source?: string;
  severity?: string;
  finding_type?: string;
}

export interface NotificationListParams {
  page?: number;
  per_page?: number;
  filter?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone_number?: string;
}

// ─── Axios Instance ────────────────────────────────────────────────────────────

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "") + "/api/v1";
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:8000/api/v1";
    }
    // Deployed on Vercel / Cloud — talk directly to production Render backend
    return "https://curaveris.onrender.com/api/v1";
  }

  return "https://curaveris.onrender.com/api/v1";
};

const BASE_URL = getBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds — Render free tier can take 30-60s to wake up
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Token + Request ID ───────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cv_access_token")
      : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const requestId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
  config.headers["X-Request-ID"] = requestId;
  return config;
});

// ─── Response Interceptor: Wakeup Retry + 401 Refresh + Error Normalization ─────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
      _wakeRetry?: boolean;
    }) | undefined;

    // Retry once for Render spin-up timeouts or initial network disconnects
    const isTimeout =
      error.code === "ECONNABORTED" ||
      Boolean(error.message && error.message.toLowerCase().includes("timeout"));
    const isNetworkError = !error.response && error.code === "ERR_NETWORK";

    if (originalRequest && (isTimeout || isNetworkError) && !originalRequest._wakeRetry) {
      originalRequest._wakeRetry = true;
      // Wait 3 seconds then retry once — gives Render time to wake
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiClient(originalRequest);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("cv_refresh_token")
          : null;

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(normalizeError(error));
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = response.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("cv_access_token", access_token);
          localStorage.setItem("cv_refresh_token", refresh_token);
        }
        processQueue(null, access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError): AppError {
  const errorData = error.response?.data as any;
  return {
    code:
      errorData?.error?.code ||
      errorData?.detail?.code ||
      "UNKNOWN_ERROR",
    message:
      errorData?.error?.message ||
      (typeof errorData?.detail === "string" ? errorData.detail : null) ||
      error.message ||
      "An unexpected error occurred.",
    retryable:
      errorData?.error?.retryable ||
      error.response?.status === 503 ||
      error.response?.status === 429 ||
      false,
    requestId:
      (error.config?.headers?.["X-Request-ID"] as string) ||
      errorData?.error?.request_id ||
      null,
    status: error.response?.status || 0,
  };
}

// ─── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (
    data:
      | RegisterRequest
      | { email: string; password: string; full_name: string; phone_number?: string }
  ) => {
    const payload = { ...data, dpdp_consent: true };
    return apiClient.post("/auth/register", payload).then((r) => r.data);
  },

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post("/auth/verify-otp", data).then((r) => r.data),

  login: (email_or_phone: string | LoginRequest, password?: string) => {
    const payload =
      typeof email_or_phone === "string"
        ? { email_or_phone, password: password || "" }
        : email_or_phone;
    return apiClient.post("/auth/login", payload).then((r) => r.data);
  },

  demoLogin: () => apiClient.post("/auth/demo-login").then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post("/auth/refresh", { refresh_token: refreshToken })
      .then((r) => r.data),

  logout: () => apiClient.post("/auth/logout").then((r) => r.data),

  requestPasswordReset: (email: string) =>
    apiClient
      .post("/auth/request-password-reset", { email })
      .then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post("/auth/reset-password", data).then((r) => r.data),

  deleteAccount: () =>
    apiClient.delete("/users/me").then((r) => r.data),
};

// ─── Bills API ─────────────────────────────────────────────────────────────────

export const billsApi = {
  upload: (
    formData: FormData,
    onProgress?: (pct: number) => void
  ): Promise<{ bill_id: string; status: string; message: string }> =>
    apiClient
      .post("/bills/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data),

  list: (params?: BillListParams): Promise<PaginatedResponse<BillSummary>> =>
    apiClient.get("/bills", { params }).then((r) => r.data),

  getById: (billId: string): Promise<Bill> =>
    apiClient.get(`/bills/${billId}`).then((r) => r.data),

  getStatus: (billId: string) =>
    apiClient.get(`/bills/${billId}/status`).then((r) => r.data),

  deleteById: (billId: string): Promise<void> =>
    apiClient.delete(`/bills/${billId}`).then((r) => r.data),

  compare: (billId1: string, billId2: string): Promise<BillComparisonResult> =>
    apiClient
      .get("/bills/compare", {
        params: { bill_id_1: billId1, bill_id_2: billId2 },
      })
      .then((r) => r.data),
};

// ─── Audits API ────────────────────────────────────────────────────────────────

export const auditsApi = {
  getByBillId: (billId: string): Promise<Audit> =>
    apiClient.get(`/bills/${billId}/audit`).then((r) => r.data),

  getReport: (billId: string): Promise<Audit> =>
    apiClient.get(`/bills/${billId}/audit`).then((r) => r.data),

  getFindings: (
    billId: string,
    params?: FindingsParams
  ): Promise<PaginatedResponse<AuditFinding>> =>
    apiClient
      .get(`/bills/${billId}/audit/findings`, { params })
      .then((r) => r.data),

  getFinding: (billId: string, findingId: string): Promise<AuditFinding> =>
    apiClient
      .get(`/bills/${billId}/audit/findings/${findingId}`)
      .then((r) => r.data),
};

// ─── Notifications API ─────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (
    params?: NotificationListParams
  ): Promise<PaginatedResponse<Notification>> =>
    apiClient.get("/notifications", { params }).then((r) => r.data),

  getUnreadCount: (): Promise<{ count: number }> =>
    apiClient.get("/notifications/unread-count").then((r) => r.data),

  markRead: (id: string): Promise<void> =>
    apiClient.post(`/notifications/${id}/read`).then((r) => r.data),

  markAsRead: (id: string): Promise<void> =>
    apiClient.post(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: (): Promise<void> =>
    apiClient.post("/notifications/read-all").then((r) => r.data),

  markAllAsRead: (): Promise<void> =>
    apiClient.post("/notifications/read-all").then((r) => r.data),
};

// ─── Evidence API ──────────────────────────────────────────────────────────────

export const evidenceApi = {
  getByBillId: (billId: string): Promise<EvidenceRecord> =>
    apiClient.get(`/bills/${billId}/evidence`).then((r) => r.data),

  verify: (evidenceId: string) =>
    apiClient.post(`/evidence/${evidenceId}/verify`).then((r) => r.data),
};

// ─── Users API ─────────────────────────────────────────────────────────────────

export const usersApi = {
  getMe: (): Promise<User & { onboarding?: Record<string, boolean> }> =>
    apiClient.get("/users/me").then((r) => r.data),

  updateMe: (data: UpdateUserRequest): Promise<User> =>
    apiClient.patch("/users/me", data).then((r) => r.data),

  deleteMe: (): Promise<void> =>
    apiClient.delete("/users/me").then((r) => r.data),

  getStats: (): Promise<UserStats> =>
    apiClient.get("/users/me/stats").then((r) => r.data),
};

// ─── Financial Risk Management (FRM) API ──────────────────────────────────────

export const frmApi = {
  startAssessment: (
    billId: string,
    inputs: FRMInputs
  ): Promise<FRMAsyncResponse> =>
    apiClient
      .post(`/bills/${billId}/frm/assess`, inputs)
      .then((r) => r.data),

  triggerAssessment: (
    billId: string,
    inputs: FRMInputs
  ): Promise<FRMAsyncResponse> =>
    apiClient
      .post(`/bills/${billId}/frm/assess`, inputs)
      .then((r) => r.data),

  getAssessment: (billId: string): Promise<FinancialRiskAssessment> =>
    apiClient.get(`/bills/${billId}/frm/assess`).then((r) => r.data),

  getStressScenarios: (billId: string): Promise<StressScenarioResult[]> =>
    apiClient
      .get(`/bills/${billId}/frm/stress-scenarios`)
      .then((r) => r.data),

  getLossDistribution: (billId: string): Promise<VaRResult> =>
    apiClient
      .get(`/bills/${billId}/frm/loss-distribution`)
      .then((r) => r.data),

  getModelRisk: (billId: string): Promise<ModelRiskResult> =>
    apiClient
      .get(`/bills/${billId}/frm/model-risk`)
      .then((r) => r.data),
};

// ─── Legal Documents API ───────────────────────────────────────────────────────

export interface LegalDocumentItem {
  document_type: string;
  display_name: string;
  status: string;
  document_id: string | null;
  generated_at: string | null;
}

export interface LegalDocumentListResponse {
  documents: LegalDocumentItem[];
}

export interface GenerateLegalDocResponse {
  id: string;
  bill_id: string;
  document_type: string;
  display_name: string;
  status: string;
  generated_at: string | null;
  file_hash_sha256: string;
}

export interface DownloadLegalDocResponse {
  download_url: string;
  expires_in_seconds: number;
}

export const legalDocsApi = {
  list: (billId: string): Promise<LegalDocumentListResponse> =>
    apiClient.get(`/bills/${billId}/legal-documents`).then((r) => r.data),

  generate: (
    billId: string,
    payload: { document_type: string; [key: string]: any }
  ): Promise<GenerateLegalDocResponse> =>
    apiClient.post(`/bills/${billId}/legal-documents`, payload).then((r) => r.data),

  getDownloadUrl: (docId: string): Promise<DownloadLegalDocResponse> =>
    apiClient.get(`/legal-documents/${docId}/download`).then((r) => r.data),
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export interface CreatePaymentOrderPayload {
  bill_id?: string;
  amount?: number;
  currency?: string;
}

export interface CreateOrderResponse {
  razorpay_order_id: string;
  amount_paise: number;
  amount_display: string;
  currency: string;
  key_id: string;
  bill_id?: string | null;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    hospital: string;
    disputed_amount: string;
    undisputed_amount: string;
  };
}

export const paymentsApi = {
  createOrder: (payload: CreatePaymentOrderPayload): Promise<CreateOrderResponse> =>
    apiClient.post("/payments/create-order", payload).then((r) => r.data),

  verify: (payload: { order_id: string; payment_id: string; signature: string }): Promise<any> =>
    apiClient.post("/payments/verify", payload).then((r) => r.data),
};

// ─── Hospitals API ────────────────────────────────────────────────────────────

export const hospitalsApi = {
  getTrustScores: (search?: string): Promise<{ hospitals: HospitalTrustScore[] }> =>
    apiClient
      .get("/hospitals/trust-scores", { params: { search: search || undefined } })
      .then((r) => r.data),

  rateHospital: (payload: {
    bill_id: string;
    score: number;
  }): Promise<{ status: string }> =>
    apiClient.post("/hospitals/rate", payload).then((r) => r.data),
};

// ─── Unified API object (backward compatibility) ───────────────────────────────

export const api = {
  auth: authApi,
  bills: billsApi,
  audit: auditsApi,
  audits: auditsApi,
  notifications: notificationsApi,
  evidence: evidenceApi,
  users: usersApi,
  frm: frmApi,
  legalDocs: legalDocsApi,
  payments: paymentsApi,
  hospitals: hospitalsApi,
};

export default apiClient;

