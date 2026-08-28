/**
 * Resilient API Client with Request ID Tracing and JWT Auth Header Injection.
 */
import { ApiErrorResponse } from '../../types/api';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  'http://localhost:8000';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
  requestId?: string;

  constructor(statusCode: number, code: string, message: string, details?: unknown, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'req_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('curaveris_access_token');
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const requestId = generateRequestId();
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');
  if (!requestHeaders.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  requestHeaders.set('X-Request-ID', requestId);

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  const responseRequestId = response.headers.get('X-Request-ID') || requestId;

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Body not JSON
    }

    const errorCode = errorData?.error?.code || `HTTP_${response.status}`;
    const errorMessage = errorData?.error?.message || response.statusText || 'An unexpected API error occurred.';
    const errorDetails = errorData?.error?.details;

    // Auto logout on 401
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('curaveris_access_token');
      localStorage.removeItem('curaveris_refresh_token');
      localStorage.removeItem('curaveris_user');
    }

    throw new ApiError(response.status, errorCode, errorMessage, errorDetails, responseRequestId);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
