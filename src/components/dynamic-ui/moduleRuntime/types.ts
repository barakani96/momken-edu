import React from 'react';
import { FieldSchema, ColumnDefinition, EntitySchema, ResourceDefinition, DataProvider } from '../types';

export interface ModuleEntityManifest {
  name: string;
  label: string;
  labelPlural: string;
  isPrimary?: boolean;
  icon?: string;
  description?: string;
  schema: EntitySchema;
  columns: ColumnDefinition<any>[];
  defaultData?: any[];
}

export interface ModuleManifestJSON {
  id: string;
  code: string;
  name: string;
  label: string;
  shortName?: string;
  category: string;
  version: string;
  status: 'active' | 'beta' | 'deprecated';
  description: string;
  icon?: string;
  authoritativeEntities: string[];
  primaryEntity: string;
  entities: ModuleEntityManifest[];
  settings?: Record<string, Record<string, any>>;
}

export interface RuntimeModule {
  manifest: ModuleManifestJSON;
  entities: Record<string, ResourceDefinition<any>>;
  entityList: {
    name: string;
    label: string;
    labelPlural: string;
    isPrimary: boolean;
    icon?: React.ComponentType<any>;
    count: number;
  }[];
  activeEntityName: string;
  getDefinition: (name: string) => ResourceDefinition<any>;
  getDataProvider: (name: string) => DataProvider<any>;
  settings: Record<string, Record<string, any>>;
  updateSettings: (section: string, key: string, value: any) => void;
  resetData: () => void;
}
