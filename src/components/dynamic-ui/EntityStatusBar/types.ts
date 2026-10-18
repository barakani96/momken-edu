import React from 'react';
import { EntityMode } from '../EntityToolbar/types';

export type ConnectionStatus = 'connected' | 'syncing' | 'offline' | 'error';

export interface EntityStatusBarInfo {
  resourceName?: string;
  resourceLabel?: string;
  mode: EntityMode;
  connectionStatus?: ConnectionStatus;
  isDirty?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  isDisabledRecord?: boolean;
  recordIndex?: number;
  totalRecords?: number;
  recordId?: string;
  lastModified?: string | Date;
  errorMessage?: string | null;
  errorCount?: number;
}

export interface EntityStatusBarProps {
  status: EntityStatusBarInfo;
  className?: string;
}
