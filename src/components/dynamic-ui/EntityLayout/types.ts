import React from 'react';
import { BreadcrumbItem } from '../../../ui/layout/PageHeader';
import { EntityToolbarProps, EntityToolbarActionConfig, EntityToolbarActionType, EntityMode } from '../EntityToolbar/types';
import { EntityStatusBarInfo, ConnectionStatus } from '../EntityStatusBar/types';

export interface EntityLayoutProps {
  /** Title displayed in the page header */
  title?: string;
  /** Subtitle / description */
  description?: string;
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Mode: create | edit | view | duplicate */
  mode?: EntityMode;
  /** Resource identifier or label */
  resourceLabel?: string;
  resourceName?: string;
  /** Entity ID if available */
  entityId?: string;
  /** Total records count */
  totalRecords?: number;
  /** Active record index */
  currentRecordIndex?: number;
  /** Status states */
  isDirty?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  isDisabledRecord?: boolean;
  connectionStatus?: ConnectionStatus;
  lastModified?: string | Date;
  errorMessage?: string | null;
  errorCount?: number;
  /** Toggle toolbar & status bar */
  showToolbar?: boolean;
  showStatusBar?: boolean;
  /** Custom Toolbar or Statusbar override */
  customToolbar?: React.ReactNode;
  customStatusBar?: React.ReactNode;
  /** Custom toolbar action buttons */
  customActions?: EntityToolbarActionConfig[];
  /** Action handler */
  onAction?: (actionType: EntityToolbarActionType) => void;
  /** Layout width: narrow | default | wide | full */
  contentWidth?: 'narrow' | 'default' | 'wide' | 'full';
  /** Main entity body content (Form, Details, Grid, etc.) */
  children: React.ReactNode;
  /** Container class name */
  className?: string;
}
