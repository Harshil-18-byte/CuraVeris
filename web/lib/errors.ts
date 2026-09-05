export interface AppError {
  code: string;
  message: string;
  retryable: boolean;
  status: number;
  requestId?: string;
}

export function getErrorMessage(error: unknown): string {
  const err = error as any;

  // Network error — backend unreachable
  if (!err?.status && (err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED")) {
    return "Unable to reach the server. If this is your first visit today, please wait 30 seconds and try again — our server may be starting up.";
  }

  // Timeout
  if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
    return "The request timed out. Our server may be starting up. Please wait a moment and try again.";
  }

  // CORS error
  if (err?.message?.includes("CORS") || err?.message?.includes("cross-origin")) {
    return "Connection blocked. Please try refreshing the page.";
  }

  // Known API error codes
  const code = err?.code as string;
  const knownErrors: Record<string, string> = {
    AUTH_001: "Incorrect email or password. Please try again.",
    AUTH_002: "Your account is temporarily locked. Please try again in 15 minutes.",
    AUTH_003: "Your session has expired. Please sign in again.",
    AUTH_004: "Your session is no longer valid. Please sign in again.",
    BILL_001: "Your file is too large. Please upload a file smaller than 50MB.",
    BILL_002: "We cannot read this file type. Please use a PDF or photo (JPG or PNG).",
    BILL_003: "You have already uploaded this exact bill. Here are your previous results.",
    BILL_004: "This file appears to be damaged. Please try a different copy.",
    RATE_001: "Too many requests. Please wait a moment and try again.",
    OTP_001: "That code has expired. Please request a new one.",
    OTP_002: "That code is incorrect. Please check and try again.",
    OTP_003: "Too many incorrect attempts. Please request a new code.",
  };

  if (code && knownErrors[code]) {
    return knownErrors[code];
  }

  // HTTP status codes
  switch (err?.status) {
    case 400:
      return err?.message || "Something was wrong with your request. Please check and try again.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don't have permission to do this.";
    case 404:
      return "We could not find what you were looking for.";
    case 409:
      return err?.message || "A conflict occurred. Please refresh and try again.";
    case 413:
      return "Your file is too large. Maximum size is 50MB.";
    case 422:
      return "Some information was missing or incorrect. Please check and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Something went wrong on our end. Please try again in a moment.";
    case 502:
      return "Our server is temporarily unavailable. Please try again shortly.";
    case 503:
      return "Our service is temporarily unavailable. Please try again shortly.";
    case 504:
      return "The request timed out. Please try again.";
  }

  return err?.message || "Something went wrong. Please try again.";
}

export function isRetryable(error: unknown): boolean {
  const err = error as any;
  if (err?.retryable !== undefined) return err.retryable;
  const status = err?.status;
  if (!status) return true; // Network error — retry
  return [429, 500, 502, 503, 504].includes(status);
}
