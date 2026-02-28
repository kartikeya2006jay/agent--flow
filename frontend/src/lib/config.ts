export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 30000,
  },
  auth: {
    tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'agentflow_token',
    userKey: process.env.NEXT_PUBLIC_AUTH_USER_KEY || 'agentflow_user',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'AgentFlow OS',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    env: process.env.NEXT_PUBLIC_ENV || 'development',
  },
  features: {
    pollingIntervalMs: Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS) || 30000,
  },
} as const;

export function validateConfig(): void {
  if (!config.api.baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
  }
}
