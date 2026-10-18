import { TenantSchema } from '../entities';

export interface AuditLogEntry {
  id: string;
  tenantId: TenantSchema;
  timestamp: string;
  userId: string;
  userName: string;
  action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE', 'PII_DECRYPT', 'EXPORT', 'AUTHENTICATE'
  resourceName: string; // e.g., 'Student', 'Guardian', 'Enrollment'
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  errorCode?: string;
  metadata?: Record<string, any>;
}

export interface AuditQueryFilter {
  userId?: string;
  action?: string;
  resourceName?: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILURE';
  startDate?: string;
  endDate?: string;
}

export interface IAuditService {
  /**
   * Logs a structured event to the audit trail
   */
  logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;

  /**
   * Queries audit logs based on tenant and optional filters
   */
  queryLogs(tenantId: TenantSchema, filter?: AuditQueryFilter): Promise<AuditLogEntry[]>;
}

export interface AuditService extends IAuditService {}
