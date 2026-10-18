import React from 'react';
import { ResourceDefinition } from '../types';

export interface ModuleSettingsConfig {
  /** General */
  defaultViewMode: 'table' | 'cards' | 'list';
  defaultPageSize: number;
  autoRefreshInterval: number; // in seconds (0 = disabled)
  enableLiveSync: boolean;
  allowQuickInlineEdit: boolean;
  /** Columns & Display */
  visibleColumns: string[];
  primaryDisplayField?: string;
  defaultSortField?: string;
  defaultSortDirection?: 'ASC' | 'DESC';
  density: 'compact' | 'normal' | 'tall';
  /** Notifications */
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  notifyOnDelete: boolean;
  notifyOnApprovalRequired: boolean;
  emailDigestFrequency: 'none' | 'daily' | 'weekly';
  /** Data Governance & Exports */
  defaultExportFormat: 'csv' | 'xlsx' | 'json';
  enableAuditLogging: boolean;
  archiveRetentionDays: number;
  allowBulkDeletion: boolean;
  /** Access & Security */
  readOnlyMode: boolean;
  requireApprovalForChanges: boolean;
  restrictedRoles?: string[];
}

export const defaultSettings: ModuleSettingsConfig = {
  defaultViewMode: 'table',
  defaultPageSize: 10,
  autoRefreshInterval: 0,
  enableLiveSync: false,
  allowQuickInlineEdit: true,
  visibleColumns: [],
  defaultSortDirection: 'ASC',
  density: 'normal',
  notifyOnCreate: true,
  notifyOnUpdate: false,
  notifyOnDelete: true,
  notifyOnApprovalRequired: false,
  emailDigestFrequency: 'none',
  defaultExportFormat: 'csv',
  enableAuditLogging: true,
  archiveRetentionDays: 365,
  allowBulkDeletion: true,
  readOnlyMode: false,
  requireApprovalForChanges: false,
};

export interface ModuleSettingsProps {
  /** Resource name or custom identifier */
  resource?: string;
  /** Optional Resource Definition */
  resourceDef?: ResourceDefinition<any>;
  /** Title override */
  title?: string;
  /** Initial or controlled configuration */
  initialSettings?: Partial<ModuleSettingsConfig>;
  /** Save callback */
  onSave?: (settings: ModuleSettingsConfig) => void | Promise<void>;
  /** Reset callback */
  onReset?: () => void;
  /** Close / Exit callback */
  onClose?: () => void;
  className?: string;
}
