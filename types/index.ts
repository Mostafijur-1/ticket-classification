export type CaseType =
  | "wrong_transfer"
  | "payment_failed"
  | "refund_request"
  | "phishing_or_social_engineering"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type Department =
  | "customer_support"
  | "dispute_resolution"
  | "payments_ops"
  | "fraud_risk";

export interface SortTicketRequest {
  title?: string;
  description: string;
  customerEmail?: string;
}

export interface SortedTicket {
  case_type: CaseType;
  severity: Severity;
  department: Department;
  agent_summary: string;
  human_review_required: boolean;
}

export interface SortTicketResponse {
  ticket: SortedTicket;
}

export interface ValidationError {
  field: string;
  message: string;
}

