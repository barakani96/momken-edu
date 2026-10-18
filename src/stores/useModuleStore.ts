/**
 * Generic useModuleStore Factory
 * Allows any institutional module to register domain entities, perform standardized
 * CRUD operations dynamically, maintain reactive client state via Zustand,
 * and persist/rehydrate offline data via IndexedDB with automatic audit logging.
 */

import { create, StoreApi, UseBoundStore } from 'zustand';
import { indexedDb } from '../core/persistence/indexedDb';
import { auditLogger } from '../core/auditLogger';

export interface StagedEditRecord {
  rowId: string | number;
  rowLabel?: string;
  field: string;
  fieldLabel?: string;
  originalValue: any;
  newValue: any;
  timestamp: number;
}

export interface EntityState<T = any> {
  records: T[];
  loading: boolean;
  error: string | null;
  filter: string;
  selectedIds: string[];
  lastUpdated: number;
}

export interface ModuleStoreState {
  moduleId: string;
  entities: Record<string, EntityState>;
  stagedEdits: Record<string, Record<string, StagedEditRecord>>; // entityName -> "rowId:::field" -> StagedEditRecord

  // Lifecycle & Registration
  registerEntity: (entityName: string, initialRecords?: any[]) => void;
  rehydrateFromCache: (entityName: string) => Promise<void>;

  // Queries
  getRecords: <T = any>(entityName: string) => T[];
  getRecord: <T = any>(entityName: string, id: string | number) => T | undefined;
  isLoading: (entityName: string) => boolean;

  // Standardized CRUD
  setRecords: (entityName: string, records: any[]) => void;
  createRecord: <T extends { id?: string | number }>(entityName: string, record: T) => Promise<T>;
  updateRecord: <T = any>(entityName: string, id: string | number, changes: Partial<T>) => Promise<T>;
  deleteRecord: (entityName: string, id: string | number) => Promise<void>;
  batchDelete: (entityName: string, ids: (string | number)[]) => Promise<void>;

  // Staged Edits & Batch Transactions
  stageEdit: (
    entityName: string,
    rowId: string | number,
    field: string,
    newValue: any,
    originalValue?: any,
    rowLabel?: string,
    fieldLabel?: string
  ) => void;
  unstageEdit: (entityName: string, rowId: string | number, field: string) => void;
  getStagedEdits: (entityName: string) => StagedEditRecord[];
  getStagedCount: (entityName?: string) => { dirtyCells: number; modifiedRows: number };
  hasStagedEdits: (entityName?: string) => boolean;
  commitStagedEdits: (entityName: string) => Promise<void>;
  discardStagedEdits: (entityName: string) => void;
  discardAllStagedEdits: () => void;

  // Selection & UI Filters
  setFilter: (entityName: string, query: string) => void;
  setSelectedIds: (entityName: string, ids: string[]) => void;
  clearSelection: (entityName: string) => void;
}

const moduleStoreRegistry = new Map<string, UseBoundStore<StoreApi<ModuleStoreState>>>();

/**
 * Creates or retrieves an isolated Zustand store instance for a given module ID
 */
export function createModuleStore(
  moduleId: string,
  initialData?: Record<string, any[]>
): UseBoundStore<StoreApi<ModuleStoreState>> {
  if (moduleStoreRegistry.has(moduleId)) {
    return moduleStoreRegistry.get(moduleId)!;
  }

  const initialEntities: Record<string, EntityState> = {};
  if (initialData) {
    Object.entries(initialData).forEach(([entityName, records]) => {
      initialEntities[entityName] = {
        records: JSON.parse(JSON.stringify(records)),
        loading: false,
        error: null,
        filter: '',
        selectedIds: [],
        lastUpdated: Date.now(),
      };
    });
  }

  const store = create<ModuleStoreState>((set, get) => ({
    moduleId,
    entities: initialEntities,
    stagedEdits: {},

    registerEntity: (entityName: string, initialRecords: any[] = []) => {
      const state = get();
      if (!state.entities[entityName]) {
        set((prev) => ({
          entities: {
            ...prev.entities,
            [entityName]: {
              records: JSON.parse(JSON.stringify(initialRecords)),
              loading: false,
              error: null,
              filter: '',
              selectedIds: [],
              lastUpdated: Date.now(),
            },
          },
        }));

        // Try rehydrating from offline cache if available
        get().rehydrateFromCache(entityName);
      }
    },

    rehydrateFromCache: async (entityName: string) => {
      try {
        const cached = await indexedDb.getEntityState(moduleId, entityName);
        if (cached && Array.isArray(cached.records) && cached.records.length > 0) {
          set((prev) => {
            const current = prev.entities[entityName];
            if (!current) return prev;
            return {
              entities: {
                ...prev.entities,
                [entityName]: {
                  ...current,
                  records: cached.records,
                  lastUpdated: cached.updatedAt,
                },
              },
            };
          });
        }
      } catch (err) {
        console.warn(`[ModuleStore] Rehydration failed for ${moduleId}.${entityName}:`, err);
      }
    },

    getRecords: <T = any>(entityName: string): T[] => {
      const entity = get().entities[entityName];
      if (!entity) return [];
      if (!entity.filter.trim()) return entity.records as T[];

      const q = entity.filter.toLowerCase().trim();
      return (entity.records as any[]).filter((record) =>
        Object.values(record).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      ) as T[];
    },

    getRecord: <T = any>(entityName: string, id: string | number): T | undefined => {
      const entity = get().entities[entityName];
      if (!entity) return undefined;
      return (entity.records as any[]).find((r) => String(r.id) === String(id));
    },

    isLoading: (entityName: string) => {
      return !!get().entities[entityName]?.loading;
    },

    setRecords: (entityName: string, records: any[]) => {
      set((prev) => ({
        entities: {
          ...prev.entities,
          [entityName]: {
            ...(prev.entities[entityName] || {
              loading: false,
              error: null,
              filter: '',
              selectedIds: [],
            }),
            records,
            lastUpdated: Date.now(),
          },
        },
      }));

      // Cache asynchronously in IndexedDB
      indexedDb.saveEntityState(moduleId, entityName, records);
    },

    createRecord: async <T extends { id?: string | number }>(entityName: string, record: T): Promise<T> => {
      const newId = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newRecord = { ...record, id: newId } as T;

      set((prev) => {
        const entity = prev.entities[entityName] || {
          records: [],
          loading: false,
          error: null,
          filter: '',
          selectedIds: [],
          lastUpdated: Date.now(),
        };
        const updatedRecords = [newRecord, ...entity.records];
        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              records: updatedRecords,
              lastUpdated: Date.now(),
            },
          },
        };
      });

      const allRecords = get().entities[entityName].records;
      await indexedDb.saveEntityState(moduleId, entityName, allRecords);

      auditLogger.logStateChange(moduleId, entityName, 'create', {
        recordId: newId,
        record: newRecord,
      });

      return newRecord;
    },

    updateRecord: async <T = any>(
      entityName: string,
      id: string | number,
      changes: Partial<T>
    ): Promise<T> => {
      let updatedResult: any = null;

      set((prev) => {
        const entity = prev.entities[entityName];
        if (!entity) return prev;

        const updatedRecords = entity.records.map((r) => {
          if (String(r.id) === String(id)) {
            updatedResult = { ...r, ...changes };
            return updatedResult;
          }
          return r;
        });

        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              records: updatedRecords,
              lastUpdated: Date.now(),
            },
          },
        };
      });

      if (!updatedResult) {
        throw new Error(`Record ${id} not found in ${moduleId}.${entityName}`);
      }

      const allRecords = get().entities[entityName].records;
      await indexedDb.saveEntityState(moduleId, entityName, allRecords);

      auditLogger.logStateChange(moduleId, entityName, 'update', {
        recordId: id,
        changes,
      });

      return updatedResult;
    },

    deleteRecord: async (entityName: string, id: string | number): Promise<void> => {
      set((prev) => {
        const entity = prev.entities[entityName];
        if (!entity) return prev;

        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              records: entity.records.filter((r) => String(r.id) !== String(id)),
              selectedIds: entity.selectedIds.filter((selId) => String(selId) !== String(id)),
              lastUpdated: Date.now(),
            },
          },
        };
      });

      const allRecords = get().entities[entityName]?.records || [];
      await indexedDb.saveEntityState(moduleId, entityName, allRecords);

      auditLogger.logStateChange(moduleId, entityName, 'delete', { recordId: id });
    },

    batchDelete: async (entityName: string, ids: (string | number)[]): Promise<void> => {
      const idSet = new Set(ids.map(String));

      set((prev) => {
        const entity = prev.entities[entityName];
        if (!entity) return prev;

        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              records: entity.records.filter((r) => !idSet.has(String(r.id))),
              selectedIds: [],
              lastUpdated: Date.now(),
            },
          },
        };
      });

      const allRecords = get().entities[entityName]?.records || [];
      await indexedDb.saveEntityState(moduleId, entityName, allRecords);

      auditLogger.logStateChange(moduleId, entityName, 'batch_delete', { count: ids.length, ids });
    },

    stageEdit: (
      entityName: string,
      rowId: string | number,
      field: string,
      newValue: any,
      originalValue?: any,
      rowLabel?: string,
      fieldLabel?: string
    ) => {
      const cellKey = `${rowId}:::${field}`;
      const existingEntity = get().entities[entityName];
      const existingRecord = existingEntity?.records.find((r: any) => String(r.id) === String(rowId));
      const orig = originalValue !== undefined ? originalValue : existingRecord ? existingRecord[field] : undefined;

      set((prev) => {
        const entityStaged = { ...(prev.stagedEdits[entityName] || {}) };
        
        // If changed back to original, remove from staged
        if (orig !== undefined && JSON.stringify(newValue) === JSON.stringify(orig)) {
          delete entityStaged[cellKey];
        } else {
          entityStaged[cellKey] = {
            rowId,
            rowLabel: rowLabel || (existingRecord?.name || existingRecord?.title || existingRecord?.code || String(rowId)),
            field,
            fieldLabel: fieldLabel || field,
            originalValue: orig,
            newValue,
            timestamp: Date.now(),
          };
        }

        return {
          stagedEdits: {
            ...prev.stagedEdits,
            [entityName]: entityStaged,
          },
        };
      });
    },

    unstageEdit: (entityName: string, rowId: string | number, field: string) => {
      const cellKey = `${rowId}:::${field}`;
      set((prev) => {
        const entityStaged = { ...(prev.stagedEdits[entityName] || {}) };
        delete entityStaged[cellKey];
        return {
          stagedEdits: {
            ...prev.stagedEdits,
            [entityName]: entityStaged,
          },
        };
      });
    },

    getStagedEdits: (entityName: string): StagedEditRecord[] => {
      const entityStaged = get().stagedEdits[entityName] || {};
      return Object.values(entityStaged);
    },

    getStagedCount: (entityName?: string) => {
      const staged = get().stagedEdits;
      if (entityName) {
        const edits = Object.values(staged[entityName] || {});
        const uniqueRows = new Set(edits.map((e) => String(e.rowId)));
        return { dirtyCells: edits.length, modifiedRows: uniqueRows.size };
      }
      let totalCells = 0;
      const allRows = new Set<string>();
      Object.entries(staged).forEach(([eName, editsMap]) => {
        const edits = Object.values(editsMap);
        totalCells += edits.length;
        edits.forEach((e) => allRows.add(`${eName}:::${e.rowId}`));
      });
      return { dirtyCells: totalCells, modifiedRows: allRows.size };
    },

    hasStagedEdits: (entityName?: string): boolean => {
      const counts = get().getStagedCount(entityName);
      return counts.dirtyCells > 0;
    },

    commitStagedEdits: async (entityName: string): Promise<void> => {
      const edits = get().getStagedEdits(entityName);
      if (edits.length === 0) return;

      const entity = get().entities[entityName];
      if (!entity) return;

      // Group changes by rowId
      const rowPatches: Record<string, Record<string, any>> = {};
      edits.forEach((edit) => {
        const rId = String(edit.rowId);
        if (!rowPatches[rId]) rowPatches[rId] = {};
        rowPatches[rId][edit.field] = edit.newValue;
      });

      const updatedRecords = entity.records.map((record) => {
        const rId = String(record.id);
        if (rowPatches[rId]) {
          return { ...record, ...rowPatches[rId] };
        }
        return record;
      });

      set((prev) => ({
        entities: {
          ...prev.entities,
          [entityName]: {
            ...entity,
            records: updatedRecords,
            lastUpdated: Date.now(),
          },
        },
        stagedEdits: {
          ...prev.stagedEdits,
          [entityName]: {},
        },
      }));

      await indexedDb.saveEntityState(moduleId, entityName, updatedRecords);
      auditLogger.logStateChange(moduleId, entityName, 'batch_update', {
        rowCount: Object.keys(rowPatches).length,
        cellCount: edits.length,
        patches: rowPatches,
      });
    },

    discardStagedEdits: (entityName: string) => {
      set((prev) => ({
        stagedEdits: {
          ...prev.stagedEdits,
          [entityName]: {},
        },
      }));
    },

    discardAllStagedEdits: () => {
      set(() => ({ stagedEdits: {} }));
    },

    setFilter: (entityName: string, query: string) => {
      set((prev) => {
        const entity = prev.entities[entityName];
        if (!entity) return prev;
        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              filter: query,
            },
          },
        };
      });
    },

    setSelectedIds: (entityName: string, ids: string[]) => {
      set((prev) => {
        const entity = prev.entities[entityName];
        if (!entity) return prev;
        return {
          entities: {
            ...prev.entities,
            [entityName]: {
              ...entity,
              selectedIds: ids,
            },
          },
        };
      });
    },

    clearSelection: (entityName: string) => {
      get().setSelectedIds(entityName, []);
    },
  }));

  moduleStoreRegistry.set(moduleId, store);
  return store;
}

/**
 * Standard hook for accessing or creating a module store dynamically
 */
export function useModuleStore(moduleId: string) {
  const store = createModuleStore(moduleId);
  return store();
}
