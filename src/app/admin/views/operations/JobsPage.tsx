/**
 * EduCore Admin Console - Background Jobs & Operations View
 */

import React from 'react';
import { Button, ProgressBar, Tag } from '@carbon/react';
import { Renew, TrashCan, Play } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { AdminJob } from '../../../../core/admin/adminTypes';
import { AdminPage } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';

import { useTranslation } from 'react-i18next';

export function JobsPage() {
  const { jobs, retryJob, cancelJob } = useAdminStore();
  const { t } = useTranslation();

  const columns: ColumnDef<AdminJob>[] = [
    { key: 'name', header: t('admin.jobsConsole.jobName', 'Job Name') },
    { key: 'type', header: t('admin.jobsConsole.jobType', 'Job Type') },
    { key: 'status', header: t('admin.jobsConsole.status', 'Status') },
    {
      key: 'progress',
      header: t('admin.jobsConsole.progress', 'Progress'),
      render: (row) => (
        <div style={{ width: '120px' }}>
          <ProgressBar
            label=""
            value={row.progress}
            max={100}
            size="small"
            status={row.status === 'failed' ? 'error' : row.status === 'completed' ? 'finished' : 'active'}
          />
        </div>
      ),
    },
    { key: 'initiatedBy', header: t('admin.jobsConsole.initiator', 'Initiator') },
    { key: 'startedAt', header: t('admin.jobsConsole.startedAt', 'Started At'), render: (row) => (row.startedAt ? new Date(row.startedAt).toLocaleTimeString() : '—') },
  ];

  return (
    <AdminPage
      title={t('admin.jobsConsole.title', 'Background Jobs & Task Queues')}
      description={t('admin.jobsConsole.description', 'Monitor asynchronous batch processing tasks, mass student enrollments, invoice generators, and SFTP imports.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('shell.nav.jobs', 'Jobs') }]}
    >
      <AdminDataTable
        title={t('admin.jobsConsole.tableTitle', 'Active & Historical Jobs')}
        description={t('admin.jobsConsole.tableDesc', 'List of queued, running, completed, and failed operational jobs.')}
        columns={columns}
        data={jobs}
        searchPlaceholder={t('admin.jobsConsole.search', 'Search jobs by name or type...')}
        rowActions={(row) =>
          row.status === 'failed' ? (
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Renew}
              iconDescription="Retry job execution"
              onClick={() => retryJob(row.id)}
            >
              {t('admin.jobsConsole.retry', 'Retry')}
            </Button>
          ) : row.status === 'running' ? (
            <Button
              kind="danger--tertiary"
              size="sm"
              iconDescription="Cancel active job"
              onClick={() => cancelJob(row.id)}
            >
              {t('ui.actions.cancel', 'Cancel')}
            </Button>
          ) : null
        }
      />
    </AdminPage>
  );
}
