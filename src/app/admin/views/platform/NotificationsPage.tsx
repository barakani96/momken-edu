import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  Loading
} from '@carbon/react';
import { Add, Notification, DeliveryTruck } from '@carbon/icons-react';
import { AdminPage, AdminSection } from '../../../../ui/admin/AdminPage';
import { usePlatformStore } from '../../../../core/platform/platformStore';

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { templates, deliveryLogs, fetchTemplates, fetchDeliveryLogs, loading } = usePlatformStore();

  useEffect(() => {
    fetchTemplates();
    fetchDeliveryLogs();
  }, [fetchTemplates, fetchDeliveryLogs]);

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'blue';
      case 'sms': return 'green';
      case 'in-app': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered': return 'green';
      case 'failed': return 'red';
      case 'pending':
      case 'draft': return 'gray';
      default: return 'cool-gray';
    }
  };

  return (
    <AdminPage
      title={t('admin.platformConsole.notificationsTitle', 'Notifications Engine')}
      description={t('admin.platformConsole.notificationsDesc', 'Configure and manage global notification templates (Email, SMS, In-App) and monitor delivery logs.')}
      breadcrumbs={[
        { label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' },
        { label: t('admin.platformConsole.notificationsTitle', 'Notifications Engine') }
      ]}
      actions={
        <Button renderIcon={Add} onClick={() => {}}>
          {t('admin.platformConsole.createTemplateBtn', 'Create Template')}
        </Button>
      }
    >
      <Tabs>
        <TabList aria-label="Notifications Management Tabs">
          <Tab renderIcon={Notification}>{t('admin.platformConsole.templatesTab', 'Notification Templates')}</Tab>
          <Tab renderIcon={DeliveryTruck}>{t('admin.platformConsole.logsTab', 'Delivery Logs')}</Tab>
        </TabList>
        <TabPanels>
          {/* Templates Tab */}
          <TabPanel style={{ padding: '1.5rem 0' }}>
            <AdminSection title={t('admin.platformConsole.templatesTab', 'Notification Templates')}>
              {loading ? (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <Loading active withOverlay={false} small />
                </div>
              ) : (
                <Table size="lg">
                  <TableHead>
                    <TableRow>
                      <TableHeader>{t('admin.platformConsole.templateName', 'Template Name')}</TableHeader>
                      <TableHeader>{t('admin.platformConsole.channel', 'Delivery Channel')}</TableHeader>
                      <TableHeader>{t('admin.platformConsole.trigger', 'Trigger Event')}</TableHeader>
                      <TableHeader>{t('admin.usersConsole.status', 'Status')}</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.map((tpl) => (
                      <TableRow key={tpl.id}>
                        <TableCell>
                          <strong>{tpl.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                            {tpl.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag type={getChannelColor(tpl.channel)} size="sm">
                            {tpl.channel.toUpperCase()}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <code style={{ fontSize: '0.75rem', padding: '0.125rem 0.25rem', backgroundColor: 'var(--cds-layer-02)' }}>
                            {tpl.triggerEvent}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Tag type={getStatusColor(tpl.status)} size="sm">
                            {tpl.status}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AdminSection>
          </TabPanel>

          {/* Delivery Logs Tab */}
          <TabPanel style={{ padding: '1.5rem 0' }}>
            <AdminSection title={t('admin.platformConsole.logsTab', 'Delivery Logs')}>
              {loading ? (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <Loading active withOverlay={false} small />
                </div>
              ) : (
                <Table size="md">
                  <TableHead>
                    <TableRow>
                      <TableHeader>{t('admin.dashboardConsole.timestamp', 'Timestamp')}</TableHeader>
                      <TableHeader>Recipient</TableHeader>
                      <TableHeader>{t('admin.platformConsole.channel', 'Channel')}</TableHeader>
                      <TableHeader>{t('admin.usersConsole.status', 'Status')}</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell style={{ fontSize: '0.875rem' }}>
                          {new Date(log.sentAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.recipient}</TableCell>
                        <TableCell>
                          <Tag type={getChannelColor(log.channel)} size="sm">
                            {log.channel.toUpperCase()}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <Tag type={getStatusColor(log.status)} size="sm">
                            {log.status}
                          </Tag>
                          {log.error && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-error)', marginTop: '0.25rem' }}>
                              {log.error}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AdminSection>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AdminPage>
  );
}

export default NotificationsPage;
