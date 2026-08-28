/**
 * Canonical TypeScript API Types for CuraVeris Web Client.
 * Formatted to mirror FastAPI Backend Schemas.
 */

export type UserRole =
  | 'PATIENT'
  | 'HOSPITAL_ADMIN'
  | 'HOSPITAL_FINANCE'
  | 'HOSPITAL_BILLING'
  | 'HOSPITAL_AUDITOR'
  | 'TPA_REVIEWER'
  | 'TPA_ADMIN'
  | 'INSURER_REVIEWER'
  | 'INSURER_ADMIN'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  org_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  user: User;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ErrorDetail;
  request_id?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  environment: string;
  version: string;
  database: boolean;
  reference_db: boolean;
  database_error?: string | null;
}

export interface LivenessResponse {
  status: 'alive';
  timestamp: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  database: boolean;
  reference_db: boolean;
}

export interface BillItem {
  id?: string;
  raw_text: string;
  normalized_name: string;
  category: string;
  quantity: number;
  unit: string;
  charged_rate: number;
  charged_amount: number;
  mrp?: number | null;
  cghs_rate?: number | null;
  nppa_ceiling?: number | null;
  is_flagged: boolean;
  risk_flags: string[];
  overcharge_amount: number;
  legal_citation?: string | null;
  patient_explanation?: string | null;
  action_recommended?: string | null;
  confidence_score: number;
}

export interface BillSummary {
  id: string;
  patient_name?: string;
  hospital_name?: string;
  total_billed: number;
  total_overcharge: number;
  risk_score: number;
  status: 'UPLOADED' | 'PROCESSING' | 'AUDITED' | 'DISPUTED' | 'RESOLVED';
  created_at: string;
  items_count: number;
}
