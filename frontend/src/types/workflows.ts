export interface Workflow {
  id: string;
  action_id: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  enterprise_id: string;
  trace_id: string;
  [key: string]: unknown;
}

export interface WorkflowProgress {
  workflow_id: string;
  progress: number;
  current_step?: string;
  message?: string;
  timestamp: string;
  [key: string]: unknown;
}