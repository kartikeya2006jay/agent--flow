import { request } from './client';
import { endpoints } from './endpoints';
import { 
  AuthTokens, LoginCredentials, User,
  ActionDefinition, ActionExecutionRequest, ActionExecutionResponse,
  Workflow, ApprovalRequest, ApprovalDecisionPayload, AuditLog
} from '@/types';

// Auth Service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return request<AuthTokens>(endpoints.auth.token(), {
      method: 'POST',
      data: formData.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return request<User>(endpoints.auth.me());
  },
};

// Actions Service
export const actionsService = {
  list: async (): Promise<ApiResponse<ActionDefinition[]>> => {
    return request<ActionDefinition[]>(endpoints.actions.list());
  },
  
  get: async (id: string): Promise<ApiResponse<ActionDefinition>> => {
    return request<ActionDefinition>(endpoints.actions.get(id));
  },
  
  execute: async (
    actionId: string, 
    payload: ActionExecutionRequest
  ): Promise<ApiResponse<ActionExecutionResponse>> => {
    return request<ActionExecutionResponse>(endpoints.actions.execute(actionId), {
      method: 'POST',
      data: payload,
    });
  },
};

// Workflows Service
export const workflowsService = {
  list: async (params?: { limit?: number; status?: string }): Promise<ApiResponse<Workflow[]>> => {
    return request<Workflow[]>(endpoints.workflows.list(params));
  },
  
  get: async (id: string): Promise<ApiResponse<Workflow>> => {
    return request<Workflow>(endpoints.workflows.get(id));
  },
};

// Approvals Service
export const approvalsService = {
  listPending: async (): Promise<ApiResponse<ApprovalRequest[]>> => {
    return request<ApprovalRequest[]>(endpoints.approvals.pending());
  },
  
  get: async (id: string): Promise<ApiResponse<ApprovalRequest>> => {
    return request<ApprovalRequest>(endpoints.approvals.get(id));
  },
  
  decide: async (
    id: string, 
    decision: ApprovalDecisionPayload
  ): Promise<ApiResponse<{ status: string; request_id: string }>> => {
    return request(endpoints.approvals.decide(id), {
      method: 'POST',
      data: decision,
    });
  },
};

// Audit Service
export const auditService = {
  queryLogs: async (params?: Record<string, unknown>): Promise<ApiResponse<AuditLog[]>> => {
    return request<AuditLog[]>(endpoints.audit.logs(params));
  },
  
  getTrace: async (traceId: string): Promise<ApiResponse<{ trace_id: string; events: unknown[] }>> => {
    return request(endpoints.audit.trace(traceId));
  },
};

// Health Service
export const healthService = {
  check: async (): Promise<ApiResponse<{ status: string; version: string }>> => {
    return request(endpoints.health.check());
  },
};