import React, { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TextInput,
  Select,
  SelectItem,
  Toggle,
  NumberInput,
  Button,
  InlineNotification,
  Tile,
  Tag,
} from '@carbon/react';
import {
  Save,
  Reset,
  Settings as SettingsIcon,
  Security,
  User,
  Catalog,
  Information,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { useShell } from '../../components/shell/ShellContext';
import { PageLayout } from '../../ui/layout/PageLayout';
import { getAllResources } from '../../components/dynamic-ui/registry';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { setActiveContext } = useShell();

  // General Settings State
  const [institutionName, setInstitutionName] = useState('Schools Systems Academy');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [enable2FA, setEnable2FA] = useState(true);
  const [enableAuditLogs, setEnableAuditLogs] = useState(true);
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setActiveContext({
      entity: 'System Preferences',
      component: 'Settings',
    });
  }, [setActiveContext]);

  const registeredModules = getAllResources();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowNotification(true);
      if (i18n.changeLanguage) {
        i18n.changeLanguage(language);
      }
    }, 400);
  };

  return (
    <PageLayout
      title="System Settings"
      description="Configure global institution settings, localization preferences, security policies, and inspect active system modules."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
      contentWidth="wide"
      actions={
        <div className="cds-flex cds-items-center cds-gap-02">
          <Button
            renderIcon={Reset}
            kind="ghost"
            size="md"
            onClick={() => {
              setInstitutionName('Schools Systems Academy');
              setAcademicYear('2026 - 2027');
              setTimezone('UTC');
              setShowNotification(false);
            }}
          >
            Reset
          </Button>
          <Button
            renderIcon={Save}
            kind="primary"
            size="md"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      }
    >
      {showNotification && (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotification
            kind="success"
            title="Settings Saved"
            subtitle="Your application preferences and security policies have been updated."
            onClose={() => setShowNotification(false)}
          />
        </div>
      )}

      <div
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <Tabs>
          <TabList aria-label="System Settings Tabs">
            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <SettingsIcon size={16} />
                <span>General & Institution</span>
              </span>
            </Tab>

            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Security size={16} />
                <span>Security & Access</span>
              </span>
            </Tab>

            <Tab>
              <span className="cds-flex cds-items-center cds-gap-02">
                <Catalog size={16} />
                <span>Registered Modules ({registeredModules.length})</span>
              </span>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Panel 1: General & Institution */}
            <TabPanel style={{ padding: '1.5rem' }}>
              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <TextInput
                    id="inst-name"
                    labelText="Institution / Organization Name"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                  />
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <TextInput
                    id="acad-year"
                    labelText="Current Academic Year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  />
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="sys-lang"
                    labelText="System Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <SelectItem value="en" text="English (US)" />
                    <SelectItem value="ar" text="العربية (Arabic)" />
                    <SelectItem value="es" text="Español (Spanish)" />
                    <SelectItem value="fr" text="Français (French)" />
                  </Select>
                </Column>

                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <Select
                    id="sys-tz"
                    labelText="Default Timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <SelectItem value="UTC" text="UTC (Coordinated Universal Time)" />
                    <SelectItem value="EST" text="EST (Eastern Standard Time)" />
                    <SelectItem value="CST" text="CST (Central Standard Time)" />
                    <SelectItem value="PST" text="PST (Pacific Standard Time)" />
                    <SelectItem value="GMT+3" text="GMT+3 (Riyadh, Kuwait, Doha)" />
                  </Select>
                </Column>
              </Grid>
            </TabPanel>

            {/* Panel 2: Security & Access */}
            <TabPanel style={{ padding: '1.5rem' }}>
              <Grid style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={4} lg={6} style={{ marginBottom: '1.5rem' }}>
                  <NumberInput
                    id="session-timeout"
                    label="Inactivity Session Timeout (Minutes)"
                    min={5}
                    max={240}
                    step={5}
                    value={sessionTimeout}
                    onChange={(_, { value }) => setSessionTimeout(Number(value))}
                  />
                </Column>

                <Column sm={4} md={8} lg={12}>
                  <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1.25rem' }}>
                    <div className="cds-flex cds-flex-col cds-gap-03">
                      <Toggle
                        id="toggle-2fa"
                        labelText="Require Two-Factor Authentication (2FA) for Staff"
                        labelA="Disabled"
                        labelB="Enforced"
                        toggled={enable2FA}
                        onToggle={(checked) => setEnable2FA(checked)}
                      />

                      <Toggle
                        id="toggle-sys-audit"
                        labelText="Comprehensive System Audit Trail Logging"
                        labelA="Off"
                        labelB="On"
                        toggled={enableAuditLogs}
                        onToggle={(checked) => setEnableAuditLogs(checked)}
                      />

                      <Toggle
                        id="toggle-guest"
                        labelText="Allow Anonymous Public Preview / Guest Access"
                        labelA="Disallowed"
                        labelB="Allowed"
                        toggled={allowGuestAccess}
                        onToggle={(checked) => setAllowGuestAccess(checked)}
                      />
                    </div>
                  </Tile>
                </Column>
              </Grid>
            </TabPanel>

            {/* Panel 3: Registered Modules Overview */}
            <TabPanel style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: '0 0 0.25rem' }}>
                  Dynamic UI Module Registry
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                  Active data-driven entities discovered and managed by the system.
                </p>
              </div>

              <Grid style={{ padding: 0, margin: 0 }}>
                {registeredModules.map((mod) => (
                  <Column key={mod.name} sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
                    <Tile
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--cds-layer-02)',
                        border: '1px solid var(--cds-border-subtle)',
                        borderRadius: '2px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div className="cds-flex cds-items-center cds-justify-between" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                            {mod.labelPlural || mod.label}
                          </span>
                          <Tag type="teal" size="sm">Active</Tag>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                          Resource: <code style={{ color: 'var(--cds-text-primary)' }}>/{mod.name}</code>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', margin: '0.25rem 0 0' }}>
                          {mod.schema.fields.length} schema fields • {mod.columns.length} columns
                        </p>
                      </div>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--cds-border-subtle)' }}>
                        <Button
                          kind="ghost"
                          size="sm"
                          href={`/${mod.name}`}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          Open Module →
                        </Button>
                      </div>
                    </Tile>
                  </Column>
                ))}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </PageLayout>
  );
}
