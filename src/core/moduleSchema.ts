/**
 * Module Configuration Schema & Validation Helpers
 * Enforces architectural constraints and schema integrity before dynamic module execution.
 */

export type ModuleFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'email'
  | 'textarea'
  | 'boolean'
  | 'phone'
  | 'badge'
  | 'currency';

export interface ModuleSelectOption {
  label: string;
  value: string | number;
}

export interface ModuleFieldConfig {
  name: string;
  type: ModuleFieldType;
  label: string;
  required?: boolean;
  colSpan?: number;
  options?: ModuleSelectOption[];
  defaultValue?: any;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ModuleColumnConfig {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  type?: string;
}

export interface ModuleEntitySchema {
  resource: string;
  label: string;
  labelPlural?: string;
  fields: ModuleFieldConfig[];
}

export interface ModuleEntityConfig {
  name: string;
  label: string;
  labelPlural?: string;
  isPrimary?: boolean;
  icon?: string;
  description?: string;
  schema: ModuleEntitySchema;
  columns?: ModuleColumnConfig[];
  seedData?: any[];
  allowedViewModes?: ('table' | 'cards' | 'list')[];
}

export interface ModuleSettingField {
  type: 'toggle' | 'text' | 'select' | 'number';
  label: string;
  description?: string;
  default?: any;
  options?: ModuleSelectOption[];
}

export interface ModuleConfigSchema {
  id: string;
  code?: string;
  name: string;
  label?: string;
  shortName?: string;
  category?: string;
  version: string;
  status?: 'active' | 'beta' | 'deprecated';
  description: string;
  icon?: string;
  primaryEntity?: string;
  authoritativeEntities?: string[];
  entities: ModuleEntityConfig[];
  dependencies?: string[];
  settings?: Record<string, Record<string, ModuleSettingField>>;
  analytics?: {
    kpis?: Array<{
      id: string;
      label: string;
      metric: string;
      icon?: string;
      color?: string;
    }>;
  };
  reports?: Array<{
    id: string;
    name: string;
    description?: string;
    entity: string;
    defaultGroupBy?: string;
    defaultSortBy?: string;
  }>;
}

export interface ModuleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validatedConfig?: ModuleConfigSchema;
}

/**
 * Validates a module configuration object against the ModuleConfigSchema
 */
export function validateModuleConfig(config: unknown): ModuleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: ['Configuration must be a non-null object.'],
      warnings: [],
    };
  }

  const raw = config as Record<string, any>;

  // 1. Mandatory Core Properties
  if (!raw.id || typeof raw.id !== 'string' || raw.id.trim() === '') {
    errors.push('Module configuration missing required string property: "id".');
  } else if (!/^[a-z0-9-_]+$/i.test(raw.id)) {
    errors.push(`Module id "${raw.id}" contains invalid characters. Use alphanumeric, dash, or underscore.`);
  }

  if (!raw.name || typeof raw.name !== 'string' || raw.name.trim() === '') {
    errors.push('Module configuration missing required string property: "name".');
  }

  if (!raw.version || typeof raw.version !== 'string') {
    errors.push('Module configuration missing required string property: "version".');
  }

  if (!raw.description || typeof raw.description !== 'string') {
    warnings.push('Module configuration is missing a descriptive "description" string.');
  }

  // 2. Entities Validation
  if (!raw.entities || !Array.isArray(raw.entities)) {
    errors.push('Module configuration must declare an "entities" array.');
  } else if (raw.entities.length === 0) {
    errors.push('Module configuration "entities" array must contain at least one entity definition.');
  } else {
    const entityNames = new Set<string>();

    raw.entities.forEach((entity: any, index: number) => {
      const entityPrefix = `Entity[${index}]`;

      if (!entity || typeof entity !== 'object') {
        errors.push(`${entityPrefix} must be a valid object.`);
        return;
      }

      if (!entity.name || typeof entity.name !== 'string') {
        errors.push(`${entityPrefix} missing required "name" property.`);
      } else {
        if (entityNames.has(entity.name)) {
          errors.push(`Duplicate entity name "${entity.name}" declared in module.`);
        }
        entityNames.add(entity.name);
      }

      if (!entity.label || typeof entity.label !== 'string') {
        errors.push(`${entityPrefix} (${entity.name || index}) missing required "label".`);
      }

      // Schema check
      if (!entity.schema || typeof entity.schema !== 'object') {
        errors.push(`${entityPrefix} (${entity.name || index}) missing required "schema" object.`);
      } else {
        if (!entity.schema.fields || !Array.isArray(entity.schema.fields)) {
          errors.push(`${entityPrefix} schema missing required "fields" array.`);
        } else if (entity.schema.fields.length === 0) {
          errors.push(`${entityPrefix} schema "fields" array must not be empty.`);
        } else {
          entity.schema.fields.forEach((field: any, fieldIdx: number) => {
            const fieldPrefix = `${entityPrefix}.fields[${fieldIdx}]`;
            if (!field.name || typeof field.name !== 'string') {
              errors.push(`${fieldPrefix} missing required "name".`);
            }
            if (!field.type || typeof field.type !== 'string') {
              errors.push(`${fieldPrefix} missing required "type".`);
            }
            if (!field.label || typeof field.label !== 'string') {
              errors.push(`${fieldPrefix} missing required "label".`);
            }
            if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
              errors.push(`${fieldPrefix} with type "select" must provide an "options" array.`);
            }
          });
        }
      }
    });

    // Primary entity verification
    if (raw.primaryEntity) {
      if (!entityNames.has(raw.primaryEntity)) {
        errors.push(`Declared primaryEntity "${raw.primaryEntity}" does not exist in entities list.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validatedConfig: errors.length === 0 ? (raw as ModuleConfigSchema) : undefined,
  };
}
