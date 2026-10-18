import React from 'react';

export interface DataProvider<T = any> {
  list: (params?: any) => Promise<{ data: T[]; total: number }>;
  get: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export type FieldType = 
  | 'text' | 'textarea' | 'number' | 'currency' 
  | 'date' | 'datetime' | 'time' | 'checkbox' 
  | 'switch' | 'radio' | 'select' | 'multiselect' 
  | 'relationship' | 'email' | 'phone' | 'url' | 'password';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldCondition {
  field: string;
  equals?: any;
  notEquals?: any;
  in?: any[];
}

export interface FieldSchema {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: FieldOption[];
  colSpan?: number;
  visibleWhen?: FieldCondition;
  disabledWhen?: FieldCondition;
  requiredWhen?: FieldCondition;
  component?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null | Promise<string | null>;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
}

export interface EntitySchema {
  resource: string;
  label: string;
  labelPlural?: string;
  fields?: FieldSchema[];
  sections?: FormSection[];
}

export interface ColumnDefinition<T = any> {
  key: string;
  name?: string; // alias for key
  label: string;
  header?: string; // alias for label
  type?: FieldType;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  renderCell?: (value: any, row: T) => React.ReactNode;
}

export type ColumnDef<T = any> = ColumnDefinition<T>;

export interface EntityAction {
  id: string;
  type?: 'create' | 'view' | 'edit' | 'delete' | 'custom';
  label: string;
  icon?: React.ComponentType<any>;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  handler?: (items: any | any[]) => void | Promise<void>;
  requireConfirmation?: boolean;
  visible?: (items: any | any[]) => boolean;
  disabled?: (items: any | any[]) => boolean;
  isBulk?: boolean;
}

export interface ResourceDefinition<T = any> {
  name: string;
  label: string;
  labelPlural?: string;
  icon?: React.ComponentType<any>;
  schema: EntitySchema;
  columns: ColumnDefinition<T>[];
  dataProvider: DataProvider<T>;
  actions?: EntityAction[];
  permissions?: string[];
  allowedViewModes?: ('table' | 'cards' | 'list')[];
}
