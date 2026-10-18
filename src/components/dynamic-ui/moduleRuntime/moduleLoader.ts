import React from 'react';
import {
  Education,
  UserMultiple,
  DocumentAdd,
  CheckmarkOutline,
  Collaborate,
  Catalog,
  Building,
  Events,
  ReportData,
  Settings,
  Enterprise,
  Dashboard,
} from '@carbon/icons-react';
import { DataProvider, ResourceDefinition } from '../types';
import { registerResource } from '../registry';
import { ModuleManifestJSON, ModuleEntityManifest, RuntimeModule } from './types';

// Map icon string names to Carbon icon components
export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Education,
  UserMultiple,
  DocumentAdd,
  CheckmarkOutline,
  Collaborate,
  Catalog,
  Building,
  Events,
  ReportData,
  Settings,
  Enterprise,
  Dashboard,
};

export function resolveIcon(name?: string, fallback: React.ComponentType<any> = Catalog): React.ComponentType<any> {
  if (!name) return fallback;
  return ICON_MAP[name] || fallback;
}

/**
 * Creates an in-memory reactive DataProvider initialized with seed data
 */
export function createInMemoryDataProvider<T extends { id: string | number }>(
  initialData: T[] = []
): DataProvider<T> & { getRawData: () => T[]; resetData: (data: T[]) => void } {
  let records: T[] = JSON.parse(JSON.stringify(initialData));

  return {
    list: async (params?: any) => {
      let filtered = [...records];
      if (params?.filter && typeof params.filter === 'object') {
        const query = (params.filter.q || params.filter.search || '').toLowerCase();
        if (query) {
          filtered = filtered.filter((item) =>
            Object.values(item).some((val) =>
              String(val || '').toLowerCase().includes(query)
            )
          );
        }
      }
      return {
        data: filtered,
        total: filtered.length,
      };
    },
    get: async (id: string) => {
      const found = records.find((r) => String(r.id) === String(id));
      if (!found) {
        throw new Error(`Record with id ${id} not found.`);
      }
      return { ...found };
    },
    create: async (data: Partial<T>) => {
      const newId = String(Date.now());
      const newRecord = { id: newId, ...data } as T;
      records.unshift(newRecord);
      return { ...newRecord };
    },
    update: async (id: string, data: Partial<T>) => {
      const idx = records.findIndex((r) => String(r.id) === String(id));
      if (idx === -1) {
        throw new Error(`Record with id ${id} not found.`);
      }
      records[idx] = { ...records[idx], ...data };
      return { ...records[idx] };
    },
    delete: async (id: string) => {
      records = records.filter((r) => String(r.id) !== String(id));
    },
    getRawData: () => [...records],
    resetData: (freshData: T[]) => {
      records = JSON.parse(JSON.stringify(freshData));
    },
  };
}

/**
 * Compiles a ModuleManifestJSON into live ResourceDefinitions and registers them
 */
export function buildRuntimeModule(manifest: ModuleManifestJSON): {
  resourceDefs: Record<string, ResourceDefinition<any>>;
  dataProviders: Record<string, any>;
} {
  const resourceDefs: Record<string, ResourceDefinition<any>> = {};
  const dataProviders: Record<string, any> = {};

  const entities = manifest.entities || (Array.isArray((manifest as any).authoritativeEntities)
    ? (manifest as any).authoritativeEntities.map((name: string) => ({
        name,
        label: name,
        labelPlural: name + 's',
        schema: { fields: [] },
        columns: [],
        defaultData: []
      }))
    : []);

  for (const entityManifest of entities) {
    const provider = createInMemoryDataProvider(entityManifest.defaultData || []);
    dataProviders[entityManifest.name] = provider;

    const resourceDef: ResourceDefinition<any> = {
      name: entityManifest.name,
      label: entityManifest.label || entityManifest.name,
      labelPlural: entityManifest.labelPlural || (entityManifest.name + 's'),
      schema: entityManifest.schema || { fields: [] },
      columns: entityManifest.columns || [],
      dataProvider: provider,
      permissions: ['read', 'create', 'update', 'delete'],
    };

    resourceDefs[entityManifest.name] = resourceDef;
    // Register into the global registry
    registerResource(resourceDef);
  }

  return { resourceDefs, dataProviders };
}
