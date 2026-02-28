// All endpoints defined as functions - NO HARDCODED STRINGS in components
export const endpoints = {
  // Auth
  auth: {
    token: () => '/auth/token' as const,
    me: () => '/auth/me' as const,
  },
  
  // Actions
  actions: {
    list: () => '/actions/' as const,
    get: (id: string) => `/actions/${encodeURIComponent(id)}` as const,
    execute: (id: string) => `/actions/${encodeURIComponent(id)}/execute` as const,
  },
  
  // Workflows
  workflows: {
    list: (params?: Record<string, unknown>) => {
      const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
      return `/workflows/${qs ? `?${qs}` : ''}` as const;
    },
    get: (id: string) => `/workflows/${encodeURIComponent(id)}` as const,
    ws: (id: string) => `/workflows/ws/${encodeURIComponent(id)}` as const,
  },
  
  // Approvals
  approvals: {
    pending: () => '/approvals/pending' as const,
    get: (id: string) => `/approvals/${encodeURIComponent(id)}` as const,
    decide: (id: string) => `/approvals/${encodeURIComponent(id)}/decide` as const,
  },
  
  // Audit
  audit: {
    logs: (params?: Record<string, unknown>) => {
      const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
      return `/audit/logs/${qs ? `?${qs}` : ''}` as const;
    },
    trace: (id: string) => `/audit/logs/${encodeURIComponent(id)}` as const,
    export: () => '/audit/export' as const,
  },
  
  // Health
  health: {
    check: () => '/health' as const,
    ready: () => '/ready' as const,
  },
} as const;