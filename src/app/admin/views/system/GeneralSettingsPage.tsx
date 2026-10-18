/**
 * EduCore Admin Console - System Settings & Configuration View
 */

import React, { useState } from 'react';
import { TextInput, Button, InlineNotification, Tile, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Save, Reset } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { AdminPage, AdminSection } from '../../../../ui/admin/AdminPage';

import { useTranslation } from 'react-i18next';

export function GeneralSettingsPage() {
  const { systemSettings, updateSystemSetting } = useAdminStore();
  const { t } = useTranslation();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [institutionName, setInstitutionName] = useState(
    systemSettings.find((s) => s.key === 'system.institution.name')?.value || 'EduCore Global University'
  );

  const [sessionTimeout, setSessionTimeout] = useState(
    systemSettings.find((s) => s.key === 'system.security.session_timeout_minutes')?.value || 30
  );

  const [smtpHost, setSmtpHost] = useState(
    systemSettings.find((s) => s.key === 'system.email.smtp_host')?.value || 'smtp.sendgrid.net'
  );

  const handleSave = async () => {
    const nameSetting = systemSettings.find((s) => s.key === 'system.institution.name');
    if (nameSetting) await updateSystemSetting(nameSetting.id, institutionName);

    const timeoutSetting = systemSettings.find((s) => s.key === 'system.security.session_timeout_minutes');
    if (timeoutSetting) await updateSystemSetting(timeoutSetting.id, Number(sessionTimeout));

    const smtpSetting = systemSettings.find((s) => s.key === 'system.email.smtp_host');
    if (smtpSetting) await updateSystemSetting(smtpSetting.id, smtpHost);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AdminPage
      title={t('admin.systemSettings.title', 'System Settings & Governance')}
      description={t('admin.systemSettings.description', 'Configure platform-wide operational settings, security session rules, branding identity, and transactional mail services.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('shell.nav.settings', 'Settings') }, { label: t('admin.generalSettings', 'General Settings') }]}
      actions={
        <Button renderIcon={Save} onClick={handleSave}>
          {t('admin.systemSettings.saveBtn', 'Save Configuration Changes')}
        </Button>
      }
    >
      {saveSuccess && (
        <InlineNotification
          kind="success"
          title={t('admin.systemSettings.savedNotification', 'Settings Saved')}
          subtitle={t('admin.systemSettings.savedSubtitle', 'System configuration settings have been updated and synced across all nodes.')}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      <Tabs>
        <TabList aria-label="System Settings Category Tabs">
          <Tab>{t('admin.systemSettings.tabGeneral', 'General & Identity')}</Tab>
          <Tab>{t('admin.systemSettings.tabSecurity', 'Security & Session Policies')}</Tab>
          <Tab>{t('admin.systemSettings.tabSMTP', 'SMTP & Transactional Mail')}</Tab>
        </TabList>

        <div style={{ marginTop: '1.5rem' }}>
          <TabPanels>
          {/* General & Identity */}
          <TabPanel>
            <AdminSection title={t('admin.systemSettings.identityTitle', 'Institution Identity Settings')}>
              <div className="cds-flex cds-flex-col cds-gap-03" style={{ maxWidth: '600px' }}>
                <TextInput
                  id="setting-inst-name"
                  labelText={t('admin.systemSettings.displayInstName', 'Primary Institution Display Name')}
                  placeholder="EduCore Global University"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
                <TextInput
                  id="setting-support-email"
                  labelText={t('admin.systemSettings.supportContact', 'System Support Contact Email')}
                  placeholder="support@educore.edu"
                  defaultValue="support@educore.edu"
                />
              </div>
            </AdminSection>
          </TabPanel>

          {/* Security & Session Policies */}
          <TabPanel>
            <AdminSection title={t('admin.systemSettings.sessionPoliciesTitle', 'Session Security Policies')}>
              <div className="cds-flex cds-flex-col cds-gap-03" style={{ maxWidth: '600px' }}>
                <TextInput
                  id="setting-session-timeout"
                  labelText={t('admin.systemSettings.sessionTimeout', 'Inactivity Session Timeout (Minutes)')}
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                  {t('admin.systemSettings.sessionTimeoutDesc', 'Automatically terminates idle user sessions after specified inactivity duration.')}
                </p>
              </div>
            </AdminSection>
          </TabPanel>

          {/* SMTP & Transactional Mail */}
          <TabPanel>
            <AdminSection title={t('admin.systemSettings.smtpTitle', 'Email Delivery Service Configuration')}>
              <div className="cds-flex cds-flex-col cds-gap-03" style={{ maxWidth: '600px' }}>
                <TextInput
                  id="setting-smtp-host"
                  labelText={t('admin.systemSettings.smtpHost', 'SMTP Relay Host')}
                  placeholder="smtp.sendgrid.net"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
                <TextInput
                  id="setting-smtp-port"
                  labelText={t('admin.systemSettings.smtpPort', 'SMTP Port')}
                  defaultValue="587"
                />
              </div>
            </AdminSection>
          </TabPanel>
        </TabPanels>
        </div>
      </Tabs>
    </AdminPage>
  );
}
