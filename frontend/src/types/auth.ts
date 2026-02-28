export interface User {
  id: string;
  email: string;
  role: string;
  enterprise_id: string;
  permissions: string[];
  [key: string]: unknown; // Allow additional fields from backend
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}