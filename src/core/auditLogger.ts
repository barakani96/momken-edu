/**
 * Platform Audit Logging Service
 * Tracks user navigation, entity lifecycle, and runtime state mutations
 * with local IndexedDB persistence and real-time subscription support.
 */

import { indexedDb } from './persistence/indexedDb';

export type AuditLogType =
  | 'NAVIGATION'
  | 'STATE_CHANGE'
  | 'ACTION'
  | 'API_CALL'
  | 'ERROR'
  | 'EXPORT';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: AuditLogType;
  moduleId?: string;
  entityName?: string;
  action: string;
  actor?: string;
  details?: Record<string, any>;
  durationMs?: number;
}

export type AuditLogListener = (entry: AuditLogEntry) => void;

class AuditLoggerService {
  private inMemoryLogs: AuditLogEntry[] = [];
  private maxMemoryLogs = 200;
  private listeners: Set<AuditLogListener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const persisted = await indexedDb.getAuditLogs(50);
      if (persisted && persisted.length > 0) {
        this.inMemoryLogs = persisted;
      }
      this.initialized = true;
    } catch (e) {
      this.initialized = true;
    }
  }

  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      actor: entry.actor || 'current_user',
    };

    // Prepend to in-memory ring buffer
    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > this.maxMemoryLogs) {
      this.inMemoryLogs.pop();
    }

    // Persist asynchronously
    indexedDb.saveAuditLog(fullEntry).catch(() => {});

    // Broadcast to listeners
    this.listeners.forEach((listener) => {
      try {
        listener(fullEntry);
      } catch (err) {
        console.error('[AuditLogger] Listener error:', err);
      }
    });

    // Console trace in development
    if (import.meta.env.DEV) {
      console.debug(
        `%c[AUDIT] %c${fullEntry.type}%c ${fullEntry.moduleId ? `[${fullEntry.moduleId}] ` : ''}${fullEntry.action}`,
        'color: #0f62fe; font-weight: bold;',
        'color: #8a3ffc;',
        'color: inherit;',
        fullEntry.details || ''
      );
    }

    return fullEntry;
  }

  public logNavigation(from: string, to: string, moduleId?: string): AuditLogEntry {
    return this.log({
      type: 'NAVIGATION',
      moduleId,
      action: `Navigate to ${to}`,
      details: { from, to },
    });
  }

  public logStateChange(
    moduleId: string,
    entityName: string,
    action: 'create' | 'update' | 'delete' | 'batch_delete' | 'batch_update' | 'restore' | 'import',
    details?: any
  ): AuditLogEntry {
    return this.log({
      type: 'STATE_CHANGE',
      moduleId,
      entityName,
      action: `${action.toUpperCase()} ${entityName}`,
      details,
    });
  }

  public logAction(moduleId: string, actionName: string, details?: any): AuditLogEntry {
    return this.log({
      type: 'ACTION',
      moduleId,
      action: actionName,
      details,
    });
  }

  public logExport(moduleId: string, format: string, recordCount: number, details?: any): AuditLogEntry {
    return this.log({
      type: 'EXPORT',
      moduleId,
      action: `Exported ${recordCount} records to ${format}`,
      details: { format, recordCount, ...details },
    });
  }

  public logError(moduleId: string, error: Error | string, details?: any): AuditLogEntry {
    const errorMsg = typeof error === 'string' ? error : error.message;
    return this.log({
      type: 'ERROR',
      moduleId,
      action: `Error: ${errorMsg}`,
      details: {
        message: errorMsg,
        stack: typeof error !== 'string' ? error.stack : undefined,
        ...details,
      },
    });
  }

  public getRecentLogs(limit: number = 50, filter?: { moduleId?: string; type?: AuditLogType }): AuditLogEntry[] {
    let result = [...this.inMemoryLogs];
    if (filter?.moduleId) {
      result = result.filter((l) => l.moduleId === filter.moduleId);
    }
    if (filter?.type) {
      result = result.filter((l) => l.type === filter.type);
    }
    return result.slice(0, limit);
  }

  public subscribe(listener: AuditLogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public clear(): void {
    this.inMemoryLogs = [];
  }
}

export const auditLogger = new AuditLoggerService();
