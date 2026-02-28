// Dynamic action types - schema comes from backend
export interface ActionDefinition {
  id: string;
  name: string;
  description?: string;
  target_agents: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  estimated_cost?: number;
  [key: string]: unknown; // Allow backend to add fields
}

export interface ActionContext {
  user_id: string;
  enterprise_id: string;
  enterprise_type?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  request_source?: string;
  trace_id?: string;
  [key: string]: unknown;
}

export interface ActionExecutionRequest {
  action: string;
  target_agents: string[];
  data: Record<string, unknown>;
  context: ActionContext;
  timeout_ms?: number;
  [key: string]: unknown;
}

export interface AgentStepResult {
  agent_id: string;
  status: 'success' | 'failed' | 'pending_approval' | 'timeout' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
  confidence?: number;
  tokens_used?: number;
  duration_ms?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ActionExecutionResponse {
  request_id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'pending_approval' | 'timeout' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
  agent_results: AgentStepResult[];
  total_tokens_used?: number;
  total_duration_ms?: number;
  overall_confidence?: number;
  policy_decision?: string;
  approval_request_id?: string;
  risk_flag?: boolean;
  compliance_tags?: string[];
  trace_id: string;
  created_at?: string;
  [key: string]: unknown;
}