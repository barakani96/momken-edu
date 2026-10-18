/**
 * useFilterStore - Persistent Filter Configurations Hook & Store
 * Utilizes IndexedDB to save, load, and manage named filter configurations for data views,
 * allowing users to persist, switch, and customize their table and grid views offline.
 */

import { create } from 'zustand';
import { indexedDb } from '../persistence/indexedDb';
import { auditLogger } from '../auditLogger';

export interface FilterConfiguration {
  id: string;
  name: string;
  viewKey: string; // e.g. 'sis.students', 'academics.courses', 'finance.invoices'
  searchQuery?: string;
  activeStatus?: string;
  columnFilters?: Record<string, any>;
  sortField?: string;
  sortDir?: 'ASC' | 'DESC';
  visibleColumns?: string[];
  viewMode?: 'table' | 'cards' | 'list' | 'grid';
  pageSize?: number;
  isDefault?: boolean;
  isSystem?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FilterStoreState {
  // Presets partitioned by viewKey (e.g. 'sis.students')
  presets: Record<string, FilterConfiguration[]>;
  activePresetId: Record<string, string | null>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPresets: (viewKey: string) => Promise<FilterConfiguration[]>;
  savePreset: (
    viewKey: string,
    presetData: Omit<FilterConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'viewKey'>
  ) => Promise<FilterConfiguration>;
  updatePreset: (
    viewKey: string,
    presetId: string,
    updates: Partial<Omit<FilterConfiguration, 'id' | 'viewKey' | 'createdAt'>>
  ) => Promise<FilterConfiguration>;
  deletePreset: (viewKey: string, presetId: string) => Promise<void>;
  setActivePreset: (viewKey: string, presetId: string | null) => void;
  getActivePreset: (viewKey: string) => FilterConfiguration | null;
  duplicatePreset: (viewKey: string, presetId: string, newName: string) => Promise<FilterConfiguration>;
  setDefaultPreset: (viewKey: string, presetId: string) => Promise<void>;
  resetToDefaults: (viewKey: string) => Promise<void>;
}

const getStorageKey = (viewKey: string) => `filter_presets_${viewKey}`;

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  presets: {},
  activePresetId: {},
  isLoading: false,
  error: null,

  loadPresets: async (viewKey: string): Promise<FilterConfiguration[]> => {
    set({ isLoading: true, error: null });
    const storageKey = getStorageKey(viewKey);

    try {
      const cached = await indexedDb.getItem<FilterConfiguration[]>(storageKey);
      let presetList: FilterConfiguration[] = [];

      if (cached && Array.isArray(cached) && cached.length > 0) {
        presetList = cached;
      } else {
        // Built-in starter presets for any view
        const defaultPresets: FilterConfiguration[] = [
          {
            id: 'preset-default-all',
            name: 'All Records',
            viewKey,
            searchQuery: '',
            activeStatus: 'ALL',
            sortDir: 'ASC',
            isDefault: true,
            isSystem: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'preset-default-active',
            name: 'Active Status Only',
            viewKey,
            searchQuery: '',
            activeStatus: 'active',
            sortDir: 'ASC',
            isDefault: false,
            isSystem: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
        presetList = defaultPresets;
        await indexedDb.setItem(storageKey, defaultPresets);
      }

      // Default active preset determination
      const defaultPreset = presetList.find((p) => p.isDefault) || presetList[0];
      const currentActiveId = get().activePresetId[viewKey] || defaultPreset?.id || null;

      set((state) => ({
        presets: {
          ...state.presets,
          [viewKey]: presetList,
        },
        activePresetId: {
          ...state.activePresetId,
          [viewKey]: currentActiveId,
        },
        isLoading: false,
      }));

      return presetList;
    } catch (err: any) {
      console.warn(`[useFilterStore] Failed to load presets for ${viewKey}:`, err);
      set({ isLoading: false, error: err.message || 'Failed to load filter presets' });
      return [];
    }
  },

  savePreset: async (viewKey, presetData) => {
    const newId = `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const newPreset: FilterConfiguration = {
      ...presetData,
      id: newId,
      viewKey,
      createdAt: now,
      updatedAt: now,
    };

    const currentPresets = get().presets[viewKey] || [];
    let updatedPresets = [...currentPresets];

    // If new preset is set as default, unset others
    if (newPreset.isDefault) {
      updatedPresets = updatedPresets.map((p) => ({ ...p, isDefault: false }));
    }
    updatedPresets.push(newPreset);

    // Persist to IndexedDB
    await indexedDb.setItem(getStorageKey(viewKey), updatedPresets);

    set((state) => ({
      presets: {
        ...state.presets,
        [viewKey]: updatedPresets,
      },
      activePresetId: {
        ...state.activePresetId,
        [viewKey]: newId,
      },
    }));

    auditLogger.log({
      type: 'STATE_CHANGE',
      action: 'SAVE_FILTER_PRESET',
      moduleId: viewKey.split('.')[0] || 'SYSTEM',
      details: {
        viewKey,
        presetId: newId,
        presetName: newPreset.name,
      },
    });

    return newPreset;
  },

  updatePreset: async (viewKey, presetId, updates) => {
    const currentPresets = get().presets[viewKey] || [];
    let updatedResult: FilterConfiguration | null = null;

    const updatedPresets = currentPresets.map((preset) => {
      if (preset.id === presetId) {
        updatedResult = {
          ...preset,
          ...updates,
          updatedAt: Date.now(),
        };
        return updatedResult;
      }
      if (updates.isDefault && preset.id !== presetId) {
        return { ...preset, isDefault: false };
      }
      return preset;
    });

    if (!updatedResult) {
      throw new Error(`Filter preset ${presetId} not found in ${viewKey}`);
    }

    await indexedDb.setItem(getStorageKey(viewKey), updatedPresets);

    set((state) => ({
      presets: {
        ...state.presets,
        [viewKey]: updatedPresets,
      },
    }));

    auditLogger.log({
      type: 'STATE_CHANGE',
      action: 'UPDATE_FILTER_PRESET',
      moduleId: viewKey.split('.')[0] || 'SYSTEM',
      details: {
        viewKey,
        presetId,
        updates,
      },
    });

    return updatedResult;
  },

  deletePreset: async (viewKey, presetId) => {
    const currentPresets = get().presets[viewKey] || [];
    const target = currentPresets.find((p) => p.id === presetId);

    if (target?.isSystem) {
      throw new Error('System default filter presets cannot be deleted.');
    }

    const filtered = currentPresets.filter((p) => p.id !== presetId);
    await indexedDb.setItem(getStorageKey(viewKey), filtered);

    // If active preset was deleted, fallback to the default or first available
    const activeId = get().activePresetId[viewKey];
    let nextActiveId = activeId;
    if (activeId === presetId) {
      nextActiveId = filtered.find((p) => p.isDefault)?.id || filtered[0]?.id || null;
    }

    set((state) => ({
      presets: {
        ...state.presets,
        [viewKey]: filtered,
      },
      activePresetId: {
        ...state.activePresetId,
        [viewKey]: nextActiveId,
      },
    }));

    auditLogger.log({
      type: 'STATE_CHANGE',
      action: 'DELETE_FILTER_PRESET',
      moduleId: viewKey.split('.')[0] || 'SYSTEM',
      details: {
        viewKey,
        presetId,
      },
    });
  },

  setActivePreset: (viewKey, presetId) => {
    set((state) => ({
      activePresetId: {
        ...state.activePresetId,
        [viewKey]: presetId,
      },
    }));
  },

  getActivePreset: (viewKey) => {
    const activeId = get().activePresetId[viewKey];
    if (!activeId) return null;
    const list = get().presets[viewKey] || [];
    return list.find((p) => p.id === activeId) || null;
  },

  duplicatePreset: async (viewKey, presetId, newName) => {
    const list = get().presets[viewKey] || [];
    const original = list.find((p) => p.id === presetId);
    if (!original) {
      throw new Error(`Preset with ID ${presetId} does not exist`);
    }

    const duplicate: Omit<FilterConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'viewKey'> = {
      name: newName || `${original.name} (Copy)`,
      searchQuery: original.searchQuery,
      activeStatus: original.activeStatus,
      columnFilters: original.columnFilters ? { ...original.columnFilters } : undefined,
      sortField: original.sortField,
      sortDir: original.sortDir,
      visibleColumns: original.visibleColumns ? [...original.visibleColumns] : undefined,
      viewMode: original.viewMode,
      pageSize: original.pageSize,
      isDefault: false,
      isSystem: false,
    };

    return get().savePreset(viewKey, duplicate);
  },

  setDefaultPreset: async (viewKey, presetId) => {
    return get().updatePreset(viewKey, presetId, { isDefault: true }).then(() => {});
  },

  resetToDefaults: async (viewKey) => {
    const storageKey = getStorageKey(viewKey);
    const defaultPresets: FilterConfiguration[] = [
      {
        id: 'preset-default-all',
        name: 'All Records',
        viewKey,
        searchQuery: '',
        activeStatus: 'ALL',
        sortDir: 'ASC',
        isDefault: true,
        isSystem: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'preset-default-active',
        name: 'Active Status Only',
        viewKey,
        searchQuery: '',
        activeStatus: 'active',
        sortDir: 'ASC',
        isDefault: false,
        isSystem: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    await indexedDb.setItem(storageKey, defaultPresets);
    set((state) => ({
      presets: {
        ...state.presets,
        [viewKey]: defaultPresets,
      },
      activePresetId: {
        ...state.activePresetId,
        [viewKey]: 'preset-default-all',
      },
    }));
  },
}));
