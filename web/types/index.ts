export type ProcessingStatus =
  | "QUEUED"
  | "EXTRACTING"
  | "AUDITING"
  | "ML_ANALYSIS"
  | "FINANCIAL_ANALYSIS"
  | "GENERATING_REPORT"
  | "GENERATING_EVIDENCE"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING";

export type RiskLabel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FindingSource = "DETERMINISTIC" | "ML";

export interface User {
  id: string;
  email: string;
  phone_number?: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  full_name: string;
  role: "patient" | "admin" | "auditor";
  is_active: boolean;
  dpdp_consent_given: boolean;
  created_at: string;
}

export interface BillLineItem {
  id: string;
  item_sequence: number;
  raw_description: string;
  normalized_name?: string | null;
  category?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
  gst_rate_applied?: number | null;
  extraction_confidence?: number | null;
  page_number?: number | null;
}

export interface Bill {
  id: string;
  user_id: string;
  reference_number?: string | null;
  hospital_name?: string | null;
  patient_name?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  total_billed_amount?: number | null;
  bill_type?: string | null;
  insurance_type?: string | null;
  processing_status: ProcessingStatus;
  processing_job_id?: string | null;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  failure_reason?: string | null;
  retry_count: number;
  file_name_original: string;
  file_size_bytes: number;
  file_mime_type: string;
  file_url?: string | null;
  created_at: string;
  updated_at: string;
  line_items?: BillLineItem[];
  audit?: Audit;
}

export interface BillSummary {
  id: string;
  hospital_name?: string | null;
  patient_name?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  total_billed_amount?: number | null;
  total_overcharge?: number | null;
  processing_status: ProcessingStatus;
  file_name_original: string;
  created_at: string;
}

export interface ShapExplanation {
  feature_label: string;
  shap_value: number;
  direction: "INCREASES_RISK" | "DECREASES_RISK";
  explanation: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  bill_line_item_id?: string | null;
  finding_type: string;
  finding_source: FindingSource;
  severity: SeverityLevel;
  item_description?: string | null;
  billed_amount?: number | null;
  benchmark_amount?: number | null;
  overcharge_amount?: number | null;
  statutory_reference?: string | null;
  ml_confidence?: number | null;
  shap_explanation?: Record<string, any> | null;
  legal_basis?: string | null;
  user_explanation?: string | null;
  is_disputable: boolean;
  created_at: string;
}

export interface Audit {
  id: string;
  bill_id: string;
  user_id: string;
  audit_version: string;
  statutory_ref_version: string;
  ml_model_version: string;
  total_overcharge_deterministic?: number | null;
  total_overcharge_ml_estimate?: number | null;
  total_billed?: number | null;
  risk_score?: number | null;
  risk_label?: RiskLabel | null;
  uncertainty_lower?: number | null;
  uncertainty_upper?: number | null;
  shadow_bill_detected: boolean;
  finding_count: number;
  finding_summary?: Record<string, number> | null;
  shap_values?: ShapExplanation[] | null;
  recommendations?: Recommendation[] | null;
  completed_at?: string | null;
  findings?: AuditFinding[];
  ml_disclaimer?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  event_type: string;
  title: string;
  body: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  entity_type?: "BILL" | "AUDIT" | "DISPUTE" | null;
  entity_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface EvidenceRecord {
  id: string;
  bill_id: string;
  audit_id: string;
  merkle_root: string;
  hmac_signature: string;
  canonical_payload?: Record<string, any>;
  leaf_hashes?: string[];
  certificate_url?: string | null;
  issued_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  unread_count?: number;
}

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
  requestId?: string;
  retryAfterSeconds?: number;
}
