export interface AuditLog {
  id: string;
  trace_id: string;
  event_type: string;
  actor_id: string;
  action_id?: string;
  workflow_id?: string;
  timestamp: string;
  details: Record<string, unknown>;
  compliance_tags?: string[];
  [key: string]: unknown;
}

export interface AuditQueryParams {
  trace_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}