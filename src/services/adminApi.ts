/**
 * EduCore Admin Console - Centralized API Client
 * Using Axios with automatic JWT injection, status error handling, and typed service endpoints.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAdminStore } from '../core/admin/adminStore';
import {
  AdminUser,
  Organization,
  Role,
  FeatureFlag,
  SystemHealthComponent,
  AdminJob,
} from '../core/admin/adminTypes';
import { AuditLogEntry, auditLogger } from '../core/auditLogger';

export interface AdminApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface DashboardMetricsResponse {
  activeUsersCount: number;
  totalUsersCount: number;
  mfaAdoptionRate: number;
  organizationsCount: number;
  activeJobsCount: number;
  failedJobsCount: number;
  systemHealthStatus: 'healthy' | 'degraded' | 'critical';
  unresolvedSecurityAlerts: number;
}

// Create centralized Axios client
export const adminApiClient = axios.create({
  baseURL: '/api/v1/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Automatic JWT Injection
adminApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token') || 'mock-admin-jwt-token-educore-2026';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantContext = useAdminStore.getState().tenantContext;
    if (tenantContext) {
      config.headers['X-Tenant-Scope'] = tenantContext.scope;
      if (tenantContext.organizationId) {
        config.headers['X-Organization-Id'] = tenantContext.organizationId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling & Event Dispatch
adminApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    let message = 'An unexpected system error occurred.';

    switch (status) {
      case 400:
        message = (error.response?.data as any)?.message || 'Invalid request payload or parameters.';
        break;
      case 401:
        message = 'Authentication token expired or missing. Please re-authenticate.';
        break;
      case 403:
        message = 'Access forbidden: Insufficient administrative privileges for this resource.';
        break;
      case 404:
        message = 'The requested administrative resource was not found.';
        break;
      case 422:
        message = 'Validation failed for administrative operation.';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Backend administrative service error. Please try again later.';
        break;
    }

    const apiError: AdminApiError = {
      status,
      message,
      code: error.code,
      details: error.response?.data,
    };

    // Dispatch custom notification event for UI listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('admin-api-error', {
          detail: apiError,
        })
      );
    }

    return Promise.reject(apiError);
  }
);

/**
 * Service API Methods
 */
export const adminApi = {
  /**
   * Summary metrics for Admin Dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    try {
      const response = await adminApiClient.get<DashboardMetricsResponse>('/dashboard/metrics');
      return response.data;
    } catch {
      // Fallback calculation from local state store
      const store = useAdminStore.getState();
      const activeUsers = store.users.filter((u) => u.status === 'active');
      const mfaUsers = store.users.filter((u) => u.mfaEnabled);
      const mfaRate = store.users.length ? Math.round((mfaUsers.length / store.users.length) * 100) : 0;
      const failedJobs = store.jobs.filter((j) => j.status === 'failed').length;
      const runningJobs = store.jobs.filter((j) => j.status === 'running').length;
      const degradedComp = store.healthComponents.some((h) => h.status === 'degraded' || h.status === 'unavailable');

      return {
        activeUsersCount: activeUsers.length,
        totalUsersCount: store.users.length,
        mfaAdoptionRate: mfaRate,
        organizationsCount: store.organizations.length,
        activeJobsCount: runningJobs,
        failedJobsCount: failedJobs,
        systemHealthStatus: degradedComp ? 'degraded' : 'healthy',
        unresolvedSecurityAlerts: store.securityEvents.filter((s) => s.severity === 'critical' || s.severity === 'high').length,
      };
    }
  },

  /**
   * System Health Components
   */
  async getSystemHealth(): Promise<SystemHealthComponent[]> {
    try {
      const response = await adminApiClient.get<SystemHealthComponent[]>('/system/health');
      return response.data;
    } catch {
      return useAdminStore.getState().healthComponents;
    }
  },

  /**
   * Recent Audit Logs
   */
  async getRecentAuditLogs(limit: number = 10): Promise<AuditLogEntry[]> {
    try {
      const response = await adminApiClient.get<AuditLogEntry[]>(`/audit/logs?limit=${limit}`);
      return response.data;
    } catch {
      return auditLogger.getRecentLogs(limit);
    }
  },

  /**
   * Active User Accounts
   */
  async getActiveUsers(): Promise<AdminUser[]> {
    try {
      const response = await adminApiClient.get<AdminUser[]>('/users?status=active');
      return response.data;
    } catch {
      return useAdminStore.getState().users;
    }
  },

  /**
   * Organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await adminApiClient.get<Organization[]>('/organizations');
      return response.data;
    } catch {
      return useAdminStore.getState().organizations;
    }
  },

  /**
   * System Roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await adminApiClient.get<Role[]>('/roles');
      return response.data;
    } catch {
      return useAdminStore.getState().roles;
    }
  },

  /**
   * Feature Flags
   */
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const response = await adminApiClient.get<FeatureFlag[]>('/feature-flags');
      return response.data;
    } catch {
      return useAdminStore.getState().featureFlags;
    }
  },

  /**
   * Background Jobs
   */
  async getAdminJobs(): Promise<AdminJob[]> {
    try {
      const response = await adminApiClient.get<AdminJob[]>('/jobs');
      return response.data;
    } catch {
      return useAdminStore.getState().jobs;
    }
  },
};
