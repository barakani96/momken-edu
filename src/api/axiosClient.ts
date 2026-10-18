/**
 * Centralized Axios Instance with Interceptors
 * Automatically attaches auth bearer tokens, request tracing IDs,
 * and intercepts global HTTP errors (401, 403, 404, 500, network offline).
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { auditLogger } from '../core/auditLogger';

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Event listener callbacks for global auth/network states
type ErrorHandler = (error: ApiErrorResponse) => void;
const errorHandlers: Set<ErrorHandler> = new Set();

export function onGlobalApiError(handler: ErrorHandler): () => void {
  errorHandlers.add(handler);
  return () => errorHandlers.delete(handler);
}

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject Bearer Authentication Token if available
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || 'mock-jwt-token-active'
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Correlation and Request Tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    config.headers['X-Request-ID'] = requestId;
    (config as any).metadata = { startTime: performance.now(), requestId };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const meta = (response.config as any).metadata;
    if (meta && import.meta.env.DEV) {
      const duration = Math.round(performance.now() - meta.startTime);
      console.debug(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status || 0;
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'GET';

    const normalizedError: ApiErrorResponse = {
      statusCode: status,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network or server error occurred.',
      code: error.code || `HTTP_${status}`,
      details: error.response?.data,
    };

    // Global Error Handlers per status
    if (status === 401) {
      // Unauthorized: clear token and notify
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      auditLogger.log({
        type: 'ERROR',
        action: `HTTP 401 Unauthorized for ${method} ${url}`,
        details: normalizedError,
      });
    } else if (status === 403) {
      auditLogger.log({
        type: 'ERROR',
        action: `HTTP 403 Forbidden on ${method} ${url}`,
        details: normalizedError,
      });
    } else if (status === 404) {
      auditLogger.log({
        type: 'ERROR',
        action: `HTTP 404 Not Found: ${method} ${url}`,
        details: normalizedError,
      });
    } else if (status >= 500) {
      auditLogger.log({
        type: 'ERROR',
        action: `HTTP ${status} Server Error: ${method} ${url}`,
        details: normalizedError,
      });
    } else if (!error.response) {
      // Network disconnect / offline error
      auditLogger.log({
        type: 'ERROR',
        action: `Network disconnect: ${method} ${url}`,
        details: { offline: true, message: error.message },
      });
    }

    // Trigger subscribers
    errorHandlers.forEach((handler) => {
      try {
        handler(normalizedError);
      } catch (err) {
        console.error('Error in global error handler:', err);
      }
    });

    return Promise.reject(normalizedError);
  }
);

// Typed API Helper
export const http = {
  get: <T>(url: string, params?: Record<string, any>) =>
    axiosInstance.get<T>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: any) =>
    axiosInstance.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: any) =>
    axiosInstance.put<T>(url, data).then((res) => res.data),

  patch: <T>(url: string, data?: any) =>
    axiosInstance.patch<T>(url, data).then((res) => res.data),

  delete: <T>(url: string, params?: Record<string, any>) =>
    axiosInstance.delete<T>(url, { params }).then((res) => res.data),
};
