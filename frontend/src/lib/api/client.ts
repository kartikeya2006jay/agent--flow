import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';
import { ApiError, ApiResponse } from '@/types/api';
import { getAuthToken, clearAuth } from '../auth/utils';

// Create axios instance with dynamic config
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors uniformly
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401: Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      clearAuth();
      // Redirect to login handled by components
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Transform error to our ApiError type
    const apiError: ApiError = {
      status: error.response?.status || 500,
      code: error.response?.data?.detail || error.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.detail || error.message || 'An error occurred',
      details: error.response?.data,
    };
    
    return Promise.reject(apiError);
  }
);

// Generic request wrapper with type safety
export async function request<T = unknown>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...options,
    });
    
    return {
      data: response.data as T,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: response.headers['x-request-id'],
        trace_id: response.headers['x-trace-id'],
      },
    };
  } catch (error) {
    if ((error as ApiError).code) {
      return { error: error as ApiError };
    }
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}

export default apiClient;