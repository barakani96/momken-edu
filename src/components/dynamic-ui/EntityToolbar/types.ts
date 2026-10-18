import React from 'react';

export type EntityMode = 'create' | 'edit' | 'view' | 'duplicate';

export type EntityToolbarActionType =
  | 'new'
  | 'edit'
  | 'save'
  | 'search' // LOV
  | 'delete'
  | 'disable'
  | 'print'
  | 'first'
  | 'previous'
  | 'next'
  | 'last'
  | 'list'
  | 'exit'
  | 'refresh';

export interface EntityToolbarActionConfig {
  id: EntityToolbarActionType | string;
  label: string;
  tooltip?: string;
  shortcut?: string;
  icon: React.ComponentType<any>;
  kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void | Promise<void>;
}

export interface EntityToolbarProps {
  mode: EntityMode;
  isDirty?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  isDisabledRecord?: boolean;
  currentRecordIndex?: number;
  totalRecords?: number;
  hasRecord?: boolean;
  customActions?: EntityToolbarActionConfig[];
  onAction: (actionType: EntityToolbarActionType) => void;
  className?: string;
}
