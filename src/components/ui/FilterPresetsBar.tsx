/**
 * FilterPresetsBar Component
 * Allows saving, managing, and applying filter preset configurations
 * with local persistence for institutional data grids and data views.
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Modal,
  TextInput,
  Tooltip,
} from '@carbon/react';
import {
  Bookmark,
  Save,
  TrashCan,
  Reset,
  Filter,
  Checkmark,
} from '@carbon/icons-react';
import { useNotification } from '../../core/notifications/NotificationContext';

export interface FilterState {
  searchQuery?: string;
  activeStatusFilter?: string;
  sortField?: string;
  sortDir?: 'ASC' | 'DESC';
  [key: string]: any;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface FilterPresetsBarProps {
  presetStorageKey: string;
  currentFilters: FilterState;
  onApplyPreset: (filters: FilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export function FilterPresetsBar({
  presetStorageKey,
  currentFilters,
  onApplyPreset,
  onResetFilters,
  className = '',
}: FilterPresetsBarProps) {
  const { notify } = useNotification();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  const storageKey = `school_filter_presets_${presetStorageKey}`;

  // Load presets on mount or key change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPresets(JSON.parse(saved));
      } else {
        setPresets([]);
      }
    } catch (err) {
      console.error('Failed to load filter presets:', err);
    }
  }, [storageKey]);

  // Persist presets to localStorage
  const savePresetsToStorage = (updated: FilterPreset[]) => {
    try {
      setPresets(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save filter presets:', err);
    }
  };

  const handleSavePreset = () => {
    const trimmed = presetNameInput.trim();
    if (!trimmed) return;

    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name: trimmed,
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...presets, newPreset];
    savePresetsToStorage(updated);
    setActivePresetId(newPreset.id);
    setIsSaveModalOpen(false);
    setPresetNameInput('');

    notify({
      kind: 'success',
      title: 'Filter Preset Saved',
      subtitle: `Saved filter configuration as "${trimmed}"`,
      timeout: 3000,
    });
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    onApplyPreset(preset.filters);
    notify({
      kind: 'info',
      title: 'Filter Applied',
      subtitle: `Applied preset "${preset.name}"`,
      timeout: 2500,
    });
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = presets.find((p) => p.id === id);
    const updated = presets.filter((p) => p.id !== id);
    savePresetsToStorage(updated);
    if (activePresetId === id) {
      setActivePresetId(null);
    }
    notify({
      kind: 'info',
      title: 'Preset Removed',
      subtitle: preset ? `Removed preset "${preset.name}"` : 'Filter preset deleted',
      timeout: 2500,
    });
  };

  const handleReset = () => {
    setActivePresetId(null);
    onResetFilters();
  };

  const hasActiveFilters = Boolean(
    currentFilters.searchQuery?.trim() ||
      (currentFilters.activeStatusFilter && currentFilters.activeStatusFilter !== 'ALL')
  );

  return (
    <div
      className={`filter-presets-bar cds-flex cds-items-center cds-justify-between cds-gap-03 ${className}`}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--cds-layer-02)',
        borderBottom: '1px solid var(--cds-border-subtle)',
        fontSize: '0.8125rem',
      }}
    >
      {/* Left side: Presets Label and Preset Tags */}
      <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap" style={{ flex: 1 }}>
        <div
          className="cds-flex cds-items-center cds-gap-01"
          style={{
            fontWeight: 600,
            color: 'var(--cds-text-secondary)',
            marginRight: '0.25rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Bookmark size={16} />
          <span>Presets:</span>
        </div>

        {presets.length === 0 ? (
          <span style={{ color: 'var(--cds-text-helper)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            No saved filter views
          </span>
        ) : (
          presets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className="cds-flex cds-items-center"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: isActive
                    ? 'var(--cds-layer-selected-01)'
                    : 'var(--cds-layer-01)',
                  border: isActive
                    ? '1px solid var(--cds-border-interactive)'
                    : '1px solid var(--cds-border-subtle)',
                  borderRadius: '12px',
                  padding: '0.125rem 0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => handleApplyPreset(preset)}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--cds-interactive)' : 'var(--cds-text-primary)',
                    marginRight: '0.375rem',
                  }}
                >
                  {preset.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDeletePreset(preset.id, e)}
                  title="Delete preset"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    color: 'var(--cds-icon-secondary)',
                  }}
                >
                  <TrashCan size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Right side: Actions (Save Current View, Clear/Reset) */}
      <div className="cds-flex cds-items-center cds-gap-02">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Save}
          onClick={() => {
            setPresetNameInput('');
            setIsSaveModalOpen(true);
          }}
          style={{ height: '2rem', minHeight: '2rem' }}
        >
          Save View
        </Button>

        {hasActiveFilters && (
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleReset}
            style={{ height: '2rem', minHeight: '2rem' }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Save Preset Modal */}
      <Modal
        open={isSaveModalOpen}
        onRequestClose={() => setIsSaveModalOpen(false)}
        modalHeading="Save Filter Preset"
        primaryButtonText="Save Preset"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSavePreset}
        primaryButtonDisabled={!presetNameInput.trim()}
        size="sm"
      >
        <div style={{ paddingTop: '0.5rem' }}>
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
            Save current search parameters and status filters to quickly reload this view later.
          </p>

          <TextInput
            id="preset-name-input"
            labelText="Preset Name"
            placeholder="e.g. Active Students, Pending Invoices..."
            value={presetNameInput}
            onChange={(e) => setPresetNameInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && presetNameInput.trim()) {
                handleSavePreset();
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
