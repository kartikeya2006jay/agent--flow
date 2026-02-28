export interface ApprovalRequest {
  id: string;
  workflow_id: string;
  action_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  risk_level: string;
  risk_score: number;
  context: Record<string, unknown>;
  approvers: string[];
  created_at: string;
  updated_at: string;
  decisions?: ApprovalDecision[];
  [key: string]: unknown;
}

export interface ApprovalDecision {
  approver_id: string;
  decision: 'approved' | 'rejected' | 'modified';
  comments?: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface ApprovalDecisionPayload {
  decision: 'approved' | 'rejected' | 'modified';
  comments?: string;
  [key: string]: unknown;
}