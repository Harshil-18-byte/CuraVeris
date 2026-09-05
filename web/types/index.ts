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
  link?: string;
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

export interface FRMInputs {
  monthly_income: number;
  monthly_expenses: number;
  verified_savings: number;
  insurance_coverage_claimed: number;
  already_paid: number;
}

export interface StressScenarioResult {
  scenario_code: string;
  scenario_name: string;
  description?: string;
  assumption_changes?: Record<string, any>;
  resulting_ead?: number;
  resulting_pd?: number;
  resulting_lgd?: number;
  resulting_el?: number;
  delta_el?: number;
  resulting_lcr?: number;
  delta_lcr?: number;
  resulting_time_to_insolvency?: number;
  stress_severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  frequency: number;
}

export interface DistributionSummary {
  percentiles: Record<string, number>;
  histogram: HistogramBin[];
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
}

export interface VaRResult {
  mc_sample_count: number;
  el_mean?: number;
  el_std?: number;
  var_90?: number;
  var_95?: number;
  cvar_95?: number;
  el_distribution_summary?: DistributionSummary;
  plain_english_var95?: string;
  plain_english_cvar95?: string;
  disclaimer: string;
}

export interface ModelRiskResult {
  prediction_confidence?: number;
  data_quality_score?: number;
  ood_ratio?: number;
  ood_features?: string[];
  model_risk_level?: "LOW" | "MEDIUM" | "HIGH";
  requires_human_review: boolean;
  human_review_reasons?: string[];
  confidence_interpretation?: string;
  disclaimer: string;
}

export interface FinancialRecommendation {
  priority: number;
  action: string;
  rationale: string;
}

export interface CashFlowTimelinePoint {
  month: number;
  running_savings: number;
  cumulative_paid: number;
  insurance_received: number;
  is_deficit: boolean;
}

export interface FinancialRiskAssessment {
  id: string;
  bill_id: string;
  audit_id: string;
  user_id: string;

  // Inputs
  monthly_income?: number;
  monthly_expenses?: number;
  verified_savings?: number;
  insurance_coverage_claimed?: number;
  insurance_type?: string;
  tpa_name?: string;
  already_paid: number;

  // EL Components
  ead?: number;
  pd?: number;
  lgd?: number;
  recovery_rate?: number;
  expected_loss?: number;

  // Recovery Components
  p_insurance_pays?: number;
  p_dispute_succeeds?: number;
  p_hospital_waives?: number;
  expected_insurance_amount?: number;

  // Liquidity Risk
  immediate_obligation?: number;
  available_liquid_resources?: number;
  liquidity_gap?: number;
  lcr?: number;
  lcr_category?: "DEFICIT" | "MARGINAL" | "ADEQUATE" | "STRONG";
  dsti_ratio?: number;
  time_to_insolvency_months?: number;

  // VaR / CVaR
  mc_sample_count: number;
  el_mean?: number;
  el_std?: number;
  var_90?: number;
  var_95?: number;
  cvar_95?: number;
  el_distribution_summary?: DistributionSummary;

  // Stress Test Results
  stress_scenarios?: StressScenarioResult[];
  worst_case_el?: number;
  worst_case_lcr?: number;

  // Model Risk
  prediction_confidence?: number;
  data_quality_score?: number;
  ood_ratio?: number;
  model_risk_level?: "LOW" | "MEDIUM" | "HIGH";
  requires_human_review: boolean;
  human_review_reasons?: string[];

  // Recommendations & Hardship
  financial_recommendations?: FinancialRecommendation[];
  hardship_category?: "MANAGEABLE" | "MODERATE" | "SEVERE" | "CRITICAL";

  // Metadata
  frm_engine_version: string;
  computed_at: string;
  created_at: string;
  updated_at: string;

  // Disclaimers
  disclaimer_el?: string;
  disclaimer_var?: string;
  disclaimer_model_risk?: string;
  disclaimer_stress?: string;
  disclaimer_legal?: string;
}

export interface FRMAsyncResponse {
  assessment_id?: string;
  status: "COMPUTING" | "COMPLETED" | "FAILED";
  message: string;
}

export interface MonthlyTrendItem {
  month: string;
  bills: number;
  overcharge: number;
}

export interface UserStats {
  bills_total: number;
  audits_complete: number;
  total_overcharge_found: number;
  documents_generated: number;
  monthly_trend: MonthlyTrendItem[];
}

export interface HospitalTrustScore {
  name: string;
  total_audits: number;
  billing_trust_score: number;
  total_overcharge_found: number;
  overcharge_rate: number;
}

export interface BillComparisonResult {
  bill_1: {
    id: string;
    hospital_name: string;
    date: string;
    total_billed: string;
    overcharge: string;
    risk_label?: string | null;
    finding_count: number;
  };
  bill_2: {
    id: string;
    hospital_name: string;
    date: string;
    total_billed: string;
    overcharge: string;
    risk_label?: string | null;
    finding_count: number;
  };
  comparison: {
    billed_difference: string;
    overcharge_difference: string;
    same_hospital: boolean;
  };
}

export interface OnboardingStatus {
  bill_uploaded: boolean;
  audit_complete: boolean;
  notification_enabled: boolean;
  profile_complete: boolean;
  checklist_dismissed: boolean;
}
