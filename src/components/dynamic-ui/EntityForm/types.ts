import React from 'react';
import { ResourceDefinition, FieldSchema, FormSection } from '../types';
import { EntityToolbarActionType, EntityToolbarActionConfig, EntityMode } from '../EntityToolbar/types';
import { ConnectionStatus, EntityStatusBarInfo } from '../EntityStatusBar/types';

export type EntityFormMode = EntityMode;
export type EntityFormPresentation = 'full-page' | 'modal' | 'side-panel' | 'sheet' | 'inline';
export type EntityFormVariant = 'default' | 'fluid';
export type { ConnectionStatus };

export type FormActionType = EntityToolbarActionType;
export type FormActionConfig = EntityToolbarActionConfig;
export type FormStatusBarInfo = EntityStatusBarInfo;

export interface EntityFormProps {
  /** Name of registered resource in registry */
  resource?: string;
  /** Explicit resource definition (overrides or provides definition if not registered) */
  resourceDef?: ResourceDefinition<any>;
  /** Operational mode: create, edit, view, duplicate */
  mode?: EntityFormMode;
  /** Presentation layout style */
  presentation?: EntityFormPresentation;
  /** Carbon Form variant: default or fluid */
  variant?: EntityFormVariant;
  /** Active record ID */
  entityId?: string;
  /** Initial or pre-filled entity data */
  entity?: any;
  /** Whether the modal / side-panel is open */
  isOpen?: boolean;
  /** Title override */
  title?: string;
  /** Description override */
  description?: string;
  /** Readonly flag (forces view presentation behavior) */
  readOnly?: boolean;
  /** Toggle visibility of the icon-only Action Bar Toolbar */
  showToolbar?: boolean;
  /** Toggle visibility of the Status Bar */
  showStatusBar?: boolean;
  /** Simulated or provided connection status */
  connectionStatus?: ConnectionStatus;
  /** Optional custom action configurations */
  customActions?: FormActionConfig[];
  /** Callback fired when form is closed / exited */
  onClose?: () => void;
  /** Callback fired upon successful create/update */
  onSuccess?: (data: any) => void;
  /** Callback fired when the form mode transitions (e.g. from view to edit) */
  onModeChange?: (newMode: EntityFormMode) => void;
  /** Callback fired when record navigation occurs */
  onNavigateRecord?: (direction: 'first' | 'previous' | 'next' | 'last', targetRecord?: any) => void;
  /** Callback fired when a record is deleted */
  onDelete?: (id: string) => void;
  /** Callback fired when user clicks the list action */
  onList?: () => void;
  /** Callback fired when user clicks the print action */
  onPrint?: () => void;
  /** Custom children for form elements (replaces or augments dynamic fields) */
  children?: React.ReactNode;
}
