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
import { Add, DataShare, Task } from '@carbon/icons-react';
import { AdminPage, AdminSection, AdminEmptyState } from '../../../../ui/admin/AdminPage';
import { usePlatformStore } from '../../../../core/platform/platformStore';

export function WorkflowsPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { workflows, fetchWorkflows, loading } = usePlatformStore();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'draft': return 'gray';
      case 'deprecated': return 'red';
      default: return 'cool-gray';
    }
  };

  return (
    <AdminPage
      title={t('admin.platformConsole.workflowsTitle', 'Workflow & Approvals Engine')}
      description={t('admin.platformConsole.workflowsDesc', 'Define approval chains, monitor active tasks, manage escalations, and audit business process states.')}
      breadcrumbs={[
        { label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' },
        { label: t('admin.platformConsole.workflowsTitle', 'Workflows Engine') }
      ]}
      actions={
        <Button renderIcon={Add} onClick={() => {}}>
          {t('admin.platformConsole.createWorkflowBtn', 'Create Workflow')}
        </Button>
      }
    >
      <Tabs>
        <TabList aria-label="Workflows Management Tabs">
          <Tab renderIcon={DataShare}>{t('admin.platformConsole.activeWorkflowsTab', 'Active Definitions')}</Tab>
          <Tab renderIcon={Task}>{t('admin.platformConsole.pendingTasksTab', 'Pending Tasks')}</Tab>
        </TabList>
        <TabPanels>
          {/* Active Workflows Tab */}
          <TabPanel style={{ padding: '1.5rem 0' }}>
            <AdminSection title={t('admin.platformConsole.activeWorkflowsTab', 'Active Definitions')}>
              {loading ? (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <Loading active withOverlay={false} small />
                </div>
              ) : (
                <Table size="lg">
                  <TableHead>
                    <TableRow>
                      <TableHeader>{t('admin.platformConsole.workflowName', 'Workflow Name')}</TableHeader>
                      <TableHeader>{t('admin.platformConsole.trigger', 'Trigger Event')}</TableHeader>
                      <TableHeader>{t('admin.platformConsole.steps', 'Steps')}</TableHeader>
                      <TableHeader>{t('admin.platformConsole.owner', 'Business Owner')}</TableHeader>
                      <TableHeader>{t('admin.usersConsole.status', 'Status')}</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workflows.map((wf) => (
                      <TableRow key={wf.id}>
                        <TableCell>
                          <strong>{wf.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                            {wf.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code style={{ fontSize: '0.75rem', padding: '0.125rem 0.25rem', backgroundColor: 'var(--cds-layer-02)' }}>
                            {wf.triggerEvent}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Tag type="blue" size="sm">{wf.steps.length} Steps</Tag>
                        </TableCell>
                        <TableCell>
                          <Tag type="cool-gray" size="sm">{wf.owner}</Tag>
                        </TableCell>
                        <TableCell>
                          <Tag type={getStatusColor(wf.status)} size="sm">
                            {wf.status}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AdminSection>
          </TabPanel>

          {/* Pending Tasks Tab */}
          <TabPanel style={{ padding: '1.5rem 0' }}>
            <AdminSection title={t('admin.platformConsole.pendingTasksTab', 'Pending Tasks')}>
              <AdminEmptyState title={isAr ? "لا توجد مهام معلقة" : "No pending workflow tasks"} />
            </AdminSection>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AdminPage>
  );
}

export default WorkflowsPage;
