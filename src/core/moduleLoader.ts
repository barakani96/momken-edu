/**
 * Core Module Loader
 * Parses module configuration files (manifests), validates structure,
 * dynamically injects sub-entities, data providers, and institutional settings
 * into the Dynamic UI runtime and ResourceRegistry.
 */

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
  Settings as SettingsIcon,
  Enterprise,
  Dashboard,
  Book,
} from '@carbon/icons-react';
import { ModuleConfigSchema, ModuleEntityConfig, validateModuleConfig } from './moduleSchema';
import { moduleRegistry } from './moduleRegistry';
import { createModuleStore } from '../stores/useModuleStore';
import { registerResource, hasResource, getResource } from '../components/dynamic-ui/registry';
import { DataProvider, ResourceDefinition } from '../components/dynamic-ui/types';
import { auditLogger } from './auditLogger';

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
  Settings: SettingsIcon,
  Enterprise,
  Dashboard,
  Book,
};

export function resolveModuleIcon(
  iconName?: string,
  fallback: React.ComponentType<any> = Catalog
): React.ComponentType<any> {
  if (!iconName) return fallback;
  return ICON_MAP[iconName] || fallback;
}

export interface RuntimeModuleInstance {
  config: ModuleConfigSchema;
  entities: Record<string, ResourceDefinition<any>>;
  dataProviders: Record<string, DataProvider<any>>;
  defaultEntity: string;
  settings: Record<string, Record<string, any>>;
}

/**
 * Creates a reactive DataProvider connected directly to the module's Zustand store and IndexedDB cache
 */
export function createStoreBackedDataProvider<T extends { id: string | number }>(
  moduleId: string,
  entityName: string
): DataProvider<T> {
  const store = createModuleStore(moduleId);

  return {
    list: async (params?: any) => {
      const state = store.getState();
      let records = state.getRecords<T>(entityName);

      if (params?.filter && typeof params.filter === 'object') {
        const query = (params.filter.q || params.filter.search || '').toLowerCase();
        if (query) {
          records = records.filter((item) =>
            Object.values(item).some((val) =>
              String(val || '').toLowerCase().includes(query)
            )
          );
        }
      }

      return {
        data: records,
        total: records.length,
      };
    },

    get: async (id: string | number) => {
      const record = store.getState().getRecord<T>(entityName, id);
      if (!record) {
        throw new Error(`Record ${id} not found in ${moduleId}.${entityName}`);
      }
      return { ...record };
    },

    create: async (data: Partial<T>) => {
      return store.getState().createRecord<T>(entityName, data as T);
    },

    update: async (id: string | number, data: Partial<T>) => {
      return store.getState().updateRecord<T>(entityName, id, data);
    },

    delete: async (id: string | number) => {
      return store.getState().deleteRecord(entityName, id);
    },
  };
}

/**
 * Parses and validates a module configuration file, injecting all sub-entities,
 * columns, schemas, and settings into the platform runtime.
 */
export async function loadModuleFromConfig(
  rawConfig: unknown
): Promise<RuntimeModuleInstance> {
  const validation = validateModuleConfig(rawConfig);
  if (!validation.valid || !validation.validatedConfig) {
    throw new Error(
      `Module validation failed: ${validation.errors.join('; ')}`
    );
  }

  const config = validation.validatedConfig;

  // Register in module registry (handles DI, logging, and IndexedDB caching)
  moduleRegistry.registerModule(config);

  // Initialize module store with seed data if declared
  const seedDataMap: Record<string, any[]> = {};
  config.entities.forEach((entity) => {
    if (entity.seedData && Array.isArray(entity.seedData)) {
      seedDataMap[entity.name] = entity.seedData;
    }
  });
  const moduleStore = createModuleStore(config.id, seedDataMap);

  const entities: Record<string, ResourceDefinition<any>> = {};
  const dataProviders: Record<string, DataProvider<any>> = {};

  // Inject sub-entities into runtime
  config.entities.forEach((entityConfig: ModuleEntityConfig) => {
    // Ensure entity is registered in module store
    moduleStore.getState().registerEntity(entityConfig.name, entityConfig.seedData || []);

    const dataProvider = createStoreBackedDataProvider(config.id, entityConfig.name);
    dataProviders[entityConfig.name] = dataProvider;

    const resourceDef: ResourceDefinition<any> = {
      name: entityConfig.name,
      label: entityConfig.label,
      labelPlural: entityConfig.labelPlural || `${entityConfig.label}s`,
      icon: resolveModuleIcon(entityConfig.icon),
      schema: {
        resource: entityConfig.schema.resource || entityConfig.name,
        label: entityConfig.schema.label || entityConfig.label,
        labelPlural: entityConfig.schema.labelPlural || entityConfig.labelPlural || `${entityConfig.label}s`,
        fields: entityConfig.schema.fields as any,
      },
      columns: (entityConfig.columns as any) || [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
      ],
      dataProvider,
      allowedViewModes: entityConfig.allowedViewModes || ['table', 'cards', 'list'],
    };

    entities[entityConfig.name] = resourceDef;

    // Register globally in Dynamic UI ResourceRegistry
    registerResource(resourceDef);
  });

  // Extract initial settings values
  const settings: Record<string, Record<string, any>> = {};
  if (config.settings) {
    Object.entries(config.settings).forEach(([category, fields]) => {
      settings[category] = {};
      Object.entries(fields).forEach(([fieldName, fieldDef]) => {
        settings[category][fieldName] = fieldDef.default !== undefined ? fieldDef.default : null;
      });
    });
  }

  auditLogger.logAction(config.id, 'Runtime Module Loaded', {
    moduleId: config.id,
    entitiesInjected: Object.keys(entities),
    version: config.version,
  });

  return {
    config,
    entities,
    dataProviders,
    defaultEntity: config.primaryEntity || config.entities[0]?.name || '',
    settings,
  };
}
