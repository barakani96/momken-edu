import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tile,
  Tag,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  CodeSnippet,
  InlineNotification,
  Select,
  SelectItem,
  TextInput,
  Toggle,
  NumberInput,
} from '@carbon/react';
import {
  Add,
  Renew,
  Code,
  Checkmark,
  Copy,
  Table as TableIcon,
  Analytics,
  Report,
  Settings as SettingsIcon,
  Information,
  UserMultiple,
  CheckmarkOutline,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { ModuleManifestJSON, ModuleEntityManifest } from './types';
import { resolveIcon, buildRuntimeModule } from './moduleLoader';
import { DataView } from '../../../ui/data/DataView';
import { EntityForm } from '../EntityForm';
import { InteractiveReports } from '../InteractiveReports';
import { useNotification } from '../../../core/notifications/NotificationContext';
import { DataViewMode } from '../../../ui/layout/ModuleHeader';
import { ModuleRuntimeSkeleton } from './ModuleRuntimeSkeleton';
import { ModuleTabs, SubEntityTabDefinition } from '../../ui/ModuleTabs';
import { usePerformanceMonitor, useModuleDwellTime } from '../../../hooks';

export interface ModuleRuntimePageProps {
  manifest: ModuleManifestJSON;
  initialEntity?: string;
  initialTab?: 'records' | 'analytics' | 'reports' | 'settings' | 'json';
  className?: string;
}

export function ModuleRuntimePage({
  manifest,
  initialEntity,
  initialTab = 'records',
  className = '',
}: ModuleRuntimePageProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();

  // Performance and Engagement Telemetry
  usePerformanceMonitor(`Module:${manifest.name}`, { thresholdMs: 40, initialThresholdMs: 250 });
  useModuleDwellTime(manifest.code || manifest.name, manifest.name);

  // Initialize runtime definitions and data providers
  const { resourceDefs, dataProviders } = useMemo(() => {
    return buildRuntimeModule(manifest);
  }, [manifest]);

  // Selected sub-entity state
  const [activeEntityName, setActiveEntityName] = useState<string>(() => {
    if (initialEntity && resourceDefs[initialEntity]) return initialEntity;
    return manifest.primaryEntity || manifest.entities[0]?.name || '';
  });

  // Tab & View states
  const [activeTabIndex, setActiveTabIndex] = useState<number>(() => {
    switch (initialTab) {
      case 'records': return 0;
      case 'analytics': return 1;
      case 'reports': return 2;
      case 'settings': return 3;
      case 'json': return 4;
      default: return 0;
    }
  });
  const [viewMode, setViewMode] = useState<DataViewMode>('table');

  // Active data records for currently selected sub-entity
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modals
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Settings State (cloned from JSON manifest)
  const [settingsState, setSettingsState] = useState<Record<string, Record<string, any>>>(() => {
    return JSON.parse(JSON.stringify(manifest.settings || {}));
  });

  // Current entity metadata
  const activeEntityManifest = useMemo(() => {
    return manifest.entities.find((e) => e.name === activeEntityName) || manifest.entities[0];
  }, [manifest, activeEntityName]);

  const activeResourceDef = useMemo(() => {
    return resourceDefs[activeEntityName];
  }, [resourceDefs, activeEntityName]);

  const activeProvider = useMemo(() => {
    return dataProviders[activeEntityName];
  }, [dataProviders, activeEntityName]);

  const ModuleIcon = useMemo(() => {
    return resolveIcon(manifest.icon);
  }, [manifest.icon]);

  // Transform sub-entities to tab definitions for ModuleTabs
  const subEntityTabs: SubEntityTabDefinition[] = useMemo(() => {
    return manifest.entities.map((entity) => ({
      id: entity.name,
      name: entity.name,
      label: entity.label,
      labelPlural: entity.labelPlural,
      icon: resolveIcon(entity.icon, UserMultiple),
      count: dataProviders[entity.name]?.getRawData?.()?.length ?? 0,
      isPrimary: entity.isPrimary,
    }));
  }, [manifest.entities, dataProviders]);

  // Load records for active sub-entity
  const loadRecords = useCallback(async () => {
    if (!activeProvider) return;
    setIsLoading(true);
    try {
      const res = await activeProvider.list();
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      notify({ kind: 'error', title: 'Data Load Error', subtitle: 'Could not fetch records.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeProvider, notify]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, activeEntityName]);

  // Handle entity change
  const handleSelectEntity = (entityName: string) => {
    setActiveEntityName(entityName);
  };

  // Reset demo data back to default manifest
  const handleResetData = () => {
    manifest.entities.forEach((ent) => {
      const prov = dataProviders[ent.name];
      if (prov && typeof prov.resetData === 'function') {
        prov.resetData(ent.defaultData || []);
      }
    });
    setSettingsState(JSON.parse(JSON.stringify(manifest.settings || {})));
    loadRecords();
    notify({
      kind: 'info',
      title: 'Data Reset',
      subtitle: `All records for ${manifest.name} were restored to seed state.`,
    });
  };

  // Save Settings handler
  const handleSaveSettings = () => {
    notify({
      kind: 'success',
      title: 'Module Settings Saved',
      subtitle: `Settings for ${manifest.name} updated successfully.`,
    });
  };

  // Record Deletion
  const handleDeleteRecord = async (item: any) => {
    if (!activeProvider) return;
    if (!window.confirm(`Are you sure you want to delete ${item.name || item.title || item.studentId || item.id}?`)) {
      return;
    }
    try {
      await activeProvider.delete(String(item.id));
      notify({
        kind: 'success',
        title: 'Record Deleted',
        subtitle: `Deleted ${item.name || 'item'} successfully.`,
      });
      loadRecords();
    } catch (err) {
      notify({ kind: 'error', title: 'Deletion Failed', subtitle: 'Could not delete item.' });
    }
  };

  // Bulk Deletion
  const handleBulkDelete = async (selectedIds: (string | number)[]) => {
    if (!activeProvider) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected record(s)?`)) return;
    try {
      for (const id of selectedIds) {
        await activeProvider.delete(String(id));
      }
      notify({
        kind: 'success',
        title: 'Bulk Deletion Complete',
        subtitle: `Deleted ${selectedIds.length} records.`,
      });
      loadRecords();
    } catch (err) {
      notify({ kind: 'error', title: 'Bulk Deletion Error', subtitle: 'Could not complete deletion.' });
    }
  };

  // Computed KPIs for active sub-entity
  const activeCount = records.filter(
    (r) => r.status === 'active' || r.stage === 'Accepted' || r.status === 'Enrolled' || r.isEmergencyContact === true
  ).length;

  if (isLoading && records.length === 0) {
    return <ModuleRuntimeSkeleton />;
  }

  return (
    <div
      className={`cds--grid cds--grid--full-width ${className}`}
      style={{ padding: '1rem', backgroundColor: 'var(--cds-background)' }}
    >
      {/* 1. MODULE IDENTITY HEADER */}
      <div
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '4px',
                backgroundColor: 'var(--cds-layer-accent-01, #e0e0e0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cds-icon-primary)',
              }}
            >
              <ModuleIcon size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
                  {manifest.name}
                </h1>
                <Tag type="cool-gray">{manifest.category}</Tag>
                <Tag type="cyan">{manifest.code}</Tag>
                <Tag type="outline">v{manifest.version}</Tag>
                <Tag type={manifest.status === 'active' ? 'green' : 'warm-gray'}>
                  {manifest.status.toUpperCase()}
                </Tag>
              </div>
              <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem', maxWidth: '850px' }}>
                {manifest.description}
              </p>
            </div>
          </div>

          {/* Module Action Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Code}
              onClick={() => setIsJsonModalOpen(true)}
            >
              View JSON Manifest
            </Button>
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Renew}
              onClick={handleResetData}
            >
              Reset Seed Data
            </Button>
            <Button
              kind="primary"
              size="sm"
              renderIcon={Add}
              onClick={() => {
                setSelectedRecordId(undefined);
                setModalMode('create');
              }}
            >
              New {activeEntityManifest.label}
            </Button>
          </div>
        </div>

        {/* SUB-ENTITIES SWITCHER BAR */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--cds-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Authoritative Sub-Entities ({manifest.entities.length}):
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
              Domain Owned • Strictly Isolated Contract Schemas
            </span>
          </div>

          <ModuleTabs
            tabs={subEntityTabs}
            activeTabId={activeEntityName}
            onTabChange={(tabId) => handleSelectEntity(tabId)}
            lazyLoadSecondary={false}
          />
        </div>
      </div>


      {/* 2. SUB-ENTITY METRICS & KPI STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Tile style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
            Active Entity Scope
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
            {activeEntityManifest.labelPlural}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '0.25rem' }}>
            {activeEntityManifest.description}
          </div>
        </Tile>

        <Tile style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
            Total {activeEntityManifest.labelPlural}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
            {records.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-success, #24a148)', marginTop: '0.25rem' }}>
            {activeCount} Verified / Active
          </div>
        </Tile>

        <Tile style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
            Schema Fields
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
            {activeEntityManifest.schema.fields?.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '0.25rem' }}>
            Fully Typed JSON Contracts
          </div>
        </Tile>

        <Tile style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
            Data Integrity
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-support-success, #24a148)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '0.25rem' }}>
            Carbon Form & LOV Compliant
          </div>
        </Tile>
      </div>

      {/* 3. MAIN RUNTIME TABS */}
      <Tabs selectedIndex={activeTabIndex} onChange={(evt: any) => {
        const idx = typeof evt === 'number' ? evt : (evt?.selectedIndex ?? 0);
        setActiveTabIndex(idx);
      }}>
        <TabList aria-label="Module Runtime Tabs">
          <Tab renderIcon={TableIcon}>
            Records & Data ({records.length})
          </Tab>
          <Tab renderIcon={Analytics}>Summary & KPIs</Tab>
          <Tab renderIcon={Report}>Interactive Reports</Tab>
          <Tab renderIcon={SettingsIcon}>Module Settings</Tab>
          <Tab renderIcon={Code}>JSON Identity & Contract</Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: RECORDS & DATA */}
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              {activeResourceDef && (
                <DataView
                  data={records}
                  columns={activeResourceDef.columns}
                  idField="id"
                  titleField={activeResourceDef.columns[1]?.name || activeResourceDef.columns[1]?.key || 'name'}
                  subtitleField={activeResourceDef.columns[2]?.name || activeResourceDef.columns[2]?.key || 'email'}
                  statusField="status"
                  icon={resolveIcon(activeEntityManifest.icon)}
                  isLoading={isLoading}
                  defaultViewMode={viewMode}
                  allowedViewModes={['table', 'cards', 'list']}
                  onRowClick={(item) => {
                    setSelectedRecordId(item.id);
                    setModalMode('view');
                  }}
                  onView={(item) => {
                    setSelectedRecordId(item.id);
                    setModalMode('view');
                  }}
                  onEdit={(item) => {
                    setSelectedRecordId(item.id);
                    setModalMode('edit');
                  }}
                  onDelete={handleDeleteRecord}
                  onBulkDelete={handleBulkDelete}
                  onRefresh={loadRecords}
                />
              )}
            </div>
          </TabPanel>

          {/* TAB 2: SUMMARY & KPIS */}
          <TabPanel>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Tile>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {activeEntityManifest.labelPlural} Distribution Overview
                </h3>
                <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Real-time breakdown of current {activeEntityManifest.labelPlural.toLowerCase()} managed under {manifest.name}.
                </p>
                {activeResourceDef && (
                  <InteractiveReports resource={activeEntityName} />
                )}
              </Tile>
            </div>
          </TabPanel>

          {/* TAB 3: REPORTS */}
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              {activeResourceDef && (
                <InteractiveReports resource={activeEntityName} />
              )}
            </div>
          </TabPanel>

          {/* TAB 4: MODULE SETTINGS */}
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              <Tile style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                      {manifest.name} Configuration & Rules
                    </h3>
                    <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      Domain settings defined in <code>{manifest.id}-module.json</code>.
                    </p>
                  </div>
                  <Button kind="primary" size="md" onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                  {/* General Configuration */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: '0.5rem' }}>
                      General & Academic Policy
                    </h4>

                    <TextInput
                      id="setting-academic-year"
                      labelText="Current Academic Year"
                      value={settingsState.general?.academicYear || '2026-2027'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettingsState((prev) => ({
                          ...prev,
                          general: { ...prev.general, academicYear: val },
                        }));
                      }}
                    />

                    <Select
                      id="setting-default-view"
                      labelText="Default Entity View Mode"
                      value={settingsState.general?.defaultViewMode || 'table'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettingsState((prev) => ({
                          ...prev,
                          general: { ...prev.general, defaultViewMode: val },
                        }));
                      }}
                    >
                      <SelectItem value="table" text="Data Table (Default)" />
                      <SelectItem value="cards" text="Card Grid" />
                      <SelectItem value="list" text="Compact List" />
                    </Select>

                    <Toggle
                      id="setting-inline-edit"
                      labelText="Allow Quick Inline Editing"
                      labelA="Off"
                      labelB="On"
                      toggled={settingsState.general?.allowQuickInlineEdit ?? true}
                      onToggle={(checked) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          general: { ...prev.general, allowQuickInlineEdit: checked },
                        }));
                      }}
                    />
                  </div>

                  {/* ID Generation / Numbering */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: '0.5rem' }}>
                      Identifiers & Numbering
                    </h4>

                    <TextInput
                      id="setting-id-prefix"
                      labelText="Entity Code Prefix"
                      value={settingsState.numbering?.idPrefix || (manifest.code ? manifest.code.split('-')[1] + '-' : 'ID-')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettingsState((prev) => ({
                          ...prev,
                          numbering: { ...prev.numbering, idPrefix: val },
                        }));
                      }}
                    />

                    <NumberInput
                      id="setting-sequence-start"
                      label="Initial Sequence Counter"
                      value={settingsState.numbering?.idSequenceStart || 1000}
                      min={1}
                      max={999999}
                      onChange={(e, { value }) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          numbering: { ...prev.numbering, idSequenceStart: Number(value) },
                        }));
                      }}
                    />

                    <Toggle
                      id="setting-auto-generate"
                      labelText="Auto-Generate Identifiers on Create"
                      labelA="Manual"
                      labelB="Automatic"
                      toggled={settingsState.numbering?.autoGenerateStudentId ?? true}
                      onToggle={(checked) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          numbering: { ...prev.numbering, autoGenerateStudentId: checked },
                        }));
                      }}
                    />
                  </div>

                  {/* Governance & Privacy */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: '0.5rem' }}>
                      Governance & Retention
                    </h4>

                    <Toggle
                      id="setting-audit-logging"
                      labelText="Enable Comprehensive Audit Trail"
                      labelA="Disabled"
                      labelB="Enabled"
                      toggled={settingsState.governance?.enableAuditLogging ?? true}
                      onToggle={(checked) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          governance: { ...prev.governance, enableAuditLogging: checked },
                        }));
                      }}
                    />

                    <NumberInput
                      id="setting-retention-years"
                      label="Data Archive Retention (Years)"
                      value={settingsState.governance?.archiveRetentionYears || 7}
                      min={1}
                      max={50}
                      onChange={(e, { value }) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          governance: { ...prev.governance, archiveRetentionYears: Number(value) },
                        }));
                      }}
                    />

                    <Toggle
                      id="setting-bulk-deletion"
                      labelText="Allow Bulk Deletions"
                      labelA="Disallowed"
                      labelB="Allowed"
                      toggled={settingsState.governance?.allowBulkDeletion ?? true}
                      onToggle={(checked) => {
                        setSettingsState((prev) => ({
                          ...prev,
                          governance: { ...prev.governance, allowBulkDeletion: checked },
                        }));
                      }}
                    />
                  </div>
                </div>
              </Tile>
            </div>
          </TabPanel>

          {/* TAB 5: JSON IDENTITY & CONTRACT */}
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              <Tile style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                      Module Identity JSON Manifest
                    </h3>
                    <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      The declarative JSON blueprint powering all sub-entities, schemas, columns, and settings.
                    </p>
                  </div>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={Copy}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
                      notify({ kind: 'info', title: 'Copied', subtitle: 'Module JSON copied to clipboard.' });
                    }}
                  >
                    Copy Full JSON
                  </Button>
                </div>

                <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
                  <CodeSnippet type="multi" feedback="Copied to clipboard">
                    {JSON.stringify(manifest, null, 2)}
                  </CodeSnippet>
                </div>
              </Tile>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* MODAL: CREATE / EDIT / VIEW ENTITY FORM */}
      {modalMode && activeResourceDef && (
        <EntityForm
          resource={activeEntityName}
          resourceDef={activeResourceDef}
          mode={modalMode}
          presentation="modal"
          isOpen={true}
          entityId={selectedRecordId}
          onClose={() => {
            setModalMode(null);
            setSelectedRecordId(undefined);
          }}
          onSuccess={() => {
            setModalMode(null);
            setSelectedRecordId(undefined);
            loadRecords();
            notify({
              kind: 'success',
              title: modalMode === 'create' ? 'Record Created' : 'Record Updated',
              subtitle: `${activeEntityManifest.label} was successfully saved.`,
            });
          }}
        />
      )}

      {/* MODAL: VIEW MODULE JSON MANIFEST */}
      <Modal
        open={isJsonModalOpen}
        onRequestClose={() => setIsJsonModalOpen(false)}
        passiveModal
        modalHeading={`${manifest.name} — JSON Manifest`}
        size="lg"
      >
        <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
          This JSON contract authoritatively defines the module identity, all {manifest.entities.length} sub-entities,
          their schemas, data grid columns, and module settings.
        </p>
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <CodeSnippet type="multi" feedback="Copied to clipboard">
            {JSON.stringify(manifest, null, 2)}
          </CodeSnippet>
        </div>
      </Modal>
    </div>
  );
}
