import React, { useState } from 'react';
import {
  Grid,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  SelectItem,
  Toggle,
  Checkbox,
  Button,
  InlineNotification,
  NumberInput,
  Tile,
} from '@carbon/react';
import {
  Save,
  Reset,
  Settings,
  Table,
  Notification,
  Security,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { ModuleSettingsConfig, defaultSettings } from './types';
import { ResourceDefinition } from '../types';
import { getResource, hasResource } from '../registry';

export interface ModuleSettingsProps {
  /** Registered resource name */
  resource?: string;
  /** Explicit resource definition */
  resourceDef?: ResourceDefinition<any>;
  /** Custom title */
  title?: string;
  /** Initial config override */
  initialSettings?: Partial<ModuleSettingsConfig>;
  /** On Save callback */
  onSave?: (config: ModuleSettingsConfig) => void | Promise<void>;
  /** On Reset callback */
  onReset?: () => void;
  className?: string;
}

export function ModuleSettings({
  resource,
  resourceDef: propResourceDef,
  title,
  initialSettings,
  onSave,
  onReset,
  className = '',
}: ModuleSettingsProps) {
  const { t } = useTranslation();

  // Resolve Resource Definition if provided
  const resDef = propResourceDef || (resource && hasResource(resource) ? getResource(resource) : null);
  const resourceLabel = title || resDef?.label || resource || 'Module';

  // State
  const [settings, setSettings] = useState<ModuleSettingsConfig>(() => {
    const cols = resDef ? resDef.columns.map((c) => String(c.key || c.name)) : [];
    const firstCol = resDef?.columns[0] ? String(resDef.columns[0].key || resDef.columns[0].name) : 'id';
    return {
      ...defaultSettings,
      visibleColumns: cols,
      defaultSortField: firstCol,
      ...initialSettings,
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateSetting = <K extends keyof ModuleSettingsConfig>(key: K, value: ModuleSettingsConfig[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleToggleColumn = (colName: string) => {
    setSettings((prev) => {
      const exists = prev.visibleColumns.includes(colName);
      const newCols = exists
        ? prev.visibleColumns.filter((c) => c !== colName)
        : [...prev.visibleColumns, colName];
      return { ...prev, visibleColumns: newCols };
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(settings);
      }
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save module settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      ...defaultSettings,
      visibleColumns: resDef ? resDef.columns.map((c) => String(c.key || c.name)) : [],
    });
    setSaveSuccess(false);
    if (onReset) onReset();
  };

  return (
    <div
      className={`module-settings-container cds-flex cds-flex-col ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="module-settings-header"
        style={{
          borderBottom: '1px solid var(--cds-border-subtle)',
          backgroundColor: 'var(--cds-layer-01)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div className="cds-flex cds-items-center cds-gap-03">
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderRadius: '4px',
              border: '1px solid var(--cds-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Settings size={20} style={{ fill: 'var(--cds-icon-primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
              {resourceLabel} Settings & Configuration
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
              Customize view preferences, notification triggers, column layouts, and access rules.
            </p>
          </div>
        </div>

        <div className="cds-flex cds-items-center cds-gap-02">
          <Button
            renderIcon={Reset}
            kind="ghost"
            size="md"
            onClick={handleReset}
          >
            Reset Defaults
          </Button>

          <Button
            renderIcon={Save}
            kind="primary"
            size="md"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <InlineNotification
            kind="success"
            title="Settings Saved"
            subtitle="Module configuration has been updated successfully."
            onClose={() => setSaveSuccess(false)}
          />
        </div>
      )}

      {/* Tabbed Settings Sections */}
      <div className="module-settings-body">
        <Tabs>
          <TabList aria-label="Module Configuration Sections">
            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Settings size={16} />
                <span>General Preferences</span>
              </span>
            </Tab>

            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Table size={16} />
                <span>Columns & Display</span>
              </span>
            </Tab>

            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Notification size={16} />
                <span>Notifications & Alerts</span>
              </span>
            </Tab>

            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Security size={16} />
                <span>Access & Governance</span>
              </span>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Panel 1: General Preferences */}
            <TabPanel style={{ padding: '1.5rem 0' }}>
              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-default-view"
                    labelText="Default View Mode"
                    helperText="Initial layout when loading this module"
                    value={settings.defaultViewMode}
                    onChange={(e) => updateSetting('defaultViewMode', e.target.value as any)}
                  >
                    <SelectItem value="table" text="Table / Data Grid" />
                    <SelectItem value="cards" text="Interactive Cards / Tiles" />
                    <SelectItem value="list" text="Compact Structured List" />
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-page-size"
                    labelText="Default Page Size"
                    helperText="Number of records shown per page"
                    value={String(settings.defaultPageSize)}
                    onChange={(e) => updateSetting('defaultPageSize', Number(e.target.value))}
                  >
                    <SelectItem value="10" text="10 records" />
                    <SelectItem value="25" text="25 records" />
                    <SelectItem value="50" text="50 records" />
                    <SelectItem value="100" text="100 records" />
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-autorefresh"
                    labelText="Auto-Refresh Interval"
                    helperText="Frequency of background data updates"
                    value={String(settings.autoRefreshInterval)}
                    onChange={(e) => updateSetting('autoRefreshInterval', Number(e.target.value))}
                  >
                    <SelectItem value="0" text="Disabled (Manual Only)" />
                    <SelectItem value="30" text="Every 30 seconds" />
                    <SelectItem value="60" text="Every 1 minute" />
                    <SelectItem value="300" text="Every 5 minutes" />
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-density"
                    labelText="Row Density"
                    helperText="Vertical spacing in grid and table views"
                    value={settings.density}
                    onChange={(e) => updateSetting('density', e.target.value as any)}
                  >
                    <SelectItem value="compact" text="Compact (High Density)" />
                    <SelectItem value="normal" text="Normal (Standard)" />
                    <SelectItem value="tall" text="Tall (Spacious)" />
                  </Select>
                </Column>

                <Column sm={4} md={8} lg={12} style={{ marginBottom: '1.5rem' }}>
                  <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
                    <div className="cds-flex cds-flex-col cds-gap-03">
                      <Toggle
                        id="toggle-live-sync"
                        labelText="Enable Real-Time Live Sync"
                        labelA="Off"
                        labelB="On"
                        toggled={settings.enableLiveSync}
                        onToggle={(checked) => updateSetting('enableLiveSync', checked)}
                      />

                      <Toggle
                        id="toggle-inline-edit"
                        labelText="Allow Quick Inline Editing"
                        labelA="Off"
                        labelB="On"
                        toggled={settings.allowQuickInlineEdit}
                        onToggle={(checked) => updateSetting('allowQuickInlineEdit', checked)}
                      />
                    </div>
                  </Tile>
                </Column>
              </Grid>
            </TabPanel>

            {/* Panel 2: Columns & Display */}
            <TabPanel style={{ padding: '1.5rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: '0 0 0.5rem' }}>
                  Visible Columns in Data Grid & Exports
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: '0 0 1rem' }}>
                  Select which attributes to show in default table columns and generated reports.
                </p>

                {resDef && resDef.columns.length > 0 ? (
                  <Grid style={{ padding: 0, margin: 0 }}>
                    {resDef.columns.map((col) => {
                      const colName = String(col.key || col.name);
                      const isChecked = settings.visibleColumns.includes(colName);
                      return (
                        <Column key={colName} sm={4} md={4} lg={4} style={{ marginBottom: '0.75rem' }}>
                          <Checkbox
                            id={`col-chk-${colName}`}
                            labelText={col.label || col.header || colName}
                            checked={isChecked}
                            onChange={() => handleToggleColumn(colName)}
                          />
                        </Column>
                      );
                    })}
                  </Grid>
                ) : (
                  <p style={{ color: 'var(--cds-text-secondary)' }}>All registered schema fields are active.</p>
                )}
              </div>

              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-default-sort"
                    labelText="Default Sort Field"
                    value={settings.defaultSortField || 'id'}
                    onChange={(e) => updateSetting('defaultSortField', e.target.value)}
                  >
                    {resDef?.columns.map((col, i) => {
                      const colKey = String(col.key || col.name);
                      return (
                        <React.Fragment key={colKey || i}>
                          <SelectItem value={colKey} text={col.label || col.header || colKey} />
                        </React.Fragment>
                      );
                    }) || <SelectItem value="id" text="ID" />}
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-default-sort-dir"
                    labelText="Default Sort Order"
                    value={settings.defaultSortDirection}
                    onChange={(e) => updateSetting('defaultSortDirection', e.target.value as any)}
                  >
                    <SelectItem value="ASC" text="Ascending (A-Z / 1-9)" />
                    <SelectItem value="DESC" text="Descending (Z-A / 9-1)" />
                  </Select>
                </Column>
              </Grid>
            </TabPanel>

            {/* Panel 3: Notifications & Alerts */}
            <TabPanel style={{ padding: '1.5rem 0' }}>
              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={8} lg={8} style={{ marginBottom: '1.5rem' }}>
                  <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: '0 0 1rem' }}>
                      Event Triggers & Instant Alerts
                    </h4>

                    <div className="cds-flex cds-flex-col cds-gap-03">
                      <Toggle
                        id="notify-create"
                        labelText="Notify on New Record Creation"
                        labelA="Disabled"
                        labelB="Enabled"
                        toggled={settings.notifyOnCreate}
                        onToggle={(checked) => updateSetting('notifyOnCreate', checked)}
                      />

                      <Toggle
                        id="notify-update"
                        labelText="Notify on Record Updates / Edits"
                        labelA="Disabled"
                        labelB="Enabled"
                        toggled={settings.notifyOnUpdate}
                        onToggle={(checked) => updateSetting('notifyOnUpdate', checked)}
                      />

                      <Toggle
                        id="notify-delete"
                        labelText="Notify on Record Deletion"
                        labelA="Disabled"
                        labelB="Enabled"
                        toggled={settings.notifyOnDelete}
                        onToggle={(checked) => updateSetting('notifyOnDelete', checked)}
                      />

                      <Toggle
                        id="notify-approval"
                        labelText="Notify on Approval Requests"
                        labelA="Disabled"
                        labelB="Enabled"
                        toggled={settings.notifyOnApprovalRequired}
                        onToggle={(checked) => updateSetting('notifyOnApprovalRequired', checked)}
                      />
                    </div>
                  </Tile>
                </Column>

                <Column sm={4} md={8} lg={4} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-digest-freq"
                    labelText="Email Digest Frequency"
                    helperText="Summary digest of module events"
                    value={settings.emailDigestFrequency}
                    onChange={(e) => updateSetting('emailDigestFrequency', e.target.value as any)}
                  >
                    <SelectItem value="none" text="Never (No Digest)" />
                    <SelectItem value="daily" text="Daily Morning Digest" />
                    <SelectItem value="weekly" text="Weekly Friday Digest" />
                  </Select>
                </Column>
              </Grid>
            </TabPanel>

            {/* Panel 4: Access & Governance */}
            <TabPanel style={{ padding: '1.5rem 0' }}>
              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="settings-export-format"
                    labelText="Default Export File Format"
                    value={settings.defaultExportFormat}
                    onChange={(e) => updateSetting('defaultExportFormat', e.target.value as any)}
                  >
                    <SelectItem value="csv" text="Comma Separated Values (.CSV)" />
                    <SelectItem value="xlsx" text="Microsoft Excel (.XLSX)" />
                    <SelectItem value="json" text="JavaScript Object Notation (.JSON)" />
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <NumberInput
                    id="settings-retention-days"
                    label="Audit & Retention Period (Days)"
                    min={30}
                    max={3650}
                    step={30}
                    value={settings.archiveRetentionDays}
                    onChange={(_, { value }) => updateSetting('archiveRetentionDays', Number(value))}
                  />
                </Column>

                <Column sm={4} md={8} lg={12}>
                  <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1.25rem' }}>
                    <div className="cds-flex cds-flex-col cds-gap-03">
                      <Toggle
                        id="toggle-audit-log"
                        labelText="Enable Immutable Audit Log Tracking"
                        labelA="Off"
                        labelB="On"
                        toggled={settings.enableAuditLogging}
                        onToggle={(checked) => updateSetting('enableAuditLogging', checked)}
                      />

                      <Toggle
                        id="toggle-bulk-delete"
                        labelText="Allow Bulk Deletion for Authorized Admins"
                        labelA="Disabled"
                        labelB="Allowed"
                        toggled={settings.allowBulkDeletion}
                        onToggle={(checked) => updateSetting('allowBulkDeletion', checked)}
                      />

                      <Toggle
                        id="toggle-readonly-mode"
                        labelText="Module Read-Only Lock"
                        labelA="Editable"
                        labelB="Read-Only"
                        toggled={settings.readOnlyMode}
                        onToggle={(checked) => updateSetting('readOnlyMode', checked)}
                      />
                    </div>
                  </Tile>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
