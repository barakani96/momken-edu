/**
 * EduCore Admin Console - Feature Flag Management View
 */

import React, { useState } from 'react';
import { Button, Toggle, Tag, Modal, TextInput, Slider } from '@carbon/react';
import { Add, Flag, TrashCan } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { FeatureFlag } from '../../../../core/admin/adminTypes';
import { AdminPage } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';

import { useTranslation } from 'react-i18next';

export function FeatureFlagsPage() {
  const { featureFlags, toggleFeatureFlag, updateFeatureFlag } = useAdminStore();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flagKey, setFlagKey] = useState('');
  const [flagName, setFlagName] = useState('');
  const [flagDesc, setFlagDesc] = useState('');

  const handleCreateFlag = async () => {
    if (!flagKey.trim() || !flagName.trim()) return;
    setIsModalOpen(false);
  };

  const columns: ColumnDef<FeatureFlag>[] = [
    { key: 'name', header: t('admin.featureToggles.ffName', 'Feature Name') },
    { key: 'key', header: t('admin.featureToggles.ffKey', 'Flag Key Identifier'), render: (row) => <code style={{ fontSize: '0.8125rem' }}>{row.key}</code> },
    {
      key: 'enabled',
      header: t('admin.featureToggles.toggleStatus', 'Toggle Status'),
      render: (row) => (
        <Toggle
          id={`toggle-ff-${row.id}`}
          size="sm"
          toggled={row.enabled}
          labelA="Off"
          labelB="On"
          aria-label={`Toggle feature ${row.name}`}
          onChange={() => toggleFeatureFlag(row.id)}
        />
      ),
    },
    { key: 'rolloutPercentage', header: t('admin.featureToggles.rollout', 'Rollout %'), render: (row) => `${row.rolloutPercentage}%` },
    { key: 'environment', header: t('admin.featureToggles.targetEnv', 'Target Env'), render: (row) => <Tag type="cool-gray" size="sm">{row.environment.toUpperCase()}</Tag> },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) =>
        row.tags.map((t, idx) => (
          <Tag key={idx} type="teal" size="sm">
            {t}
          </Tag>
        )),
    },
  ];

  return (
    <AdminPage
      title={t('admin.featureToggles.title', 'Feature Flags & Capability Toggles')}
      description={t('admin.featureToggles.description', 'Manage feature releases, canary rollouts, percentage targeting, and emergency kill switches without code deployments.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('shell.nav.featureFlags', 'Feature Flags') }]}
      actions={
        <Button renderIcon={Add} onClick={() => setIsModalOpen(true)}>
          {t('admin.featureToggles.createBtn', 'Create Feature Flag')}
        </Button>
      }
    >
      <AdminDataTable
        title={t('admin.featureToggles.registeredTitle', 'Registered Feature Flags')}
        description={t('admin.featureToggles.registeredDesc', 'Active feature toggles controlling experimental and progressive features across EduCore.')}
        columns={columns}
        data={featureFlags}
        searchPlaceholder={t('admin.featureToggles.search', 'Search flags by name, key, or tag...')}
      />

      <Modal
        open={isModalOpen}
        modalHeading={t('admin.featureToggles.modalTitle', 'Create Feature Flag')}
        modalLabel={t('admin.featureToggles.modalLabel', 'Feature Management Engine')}
        primaryButtonText={t('admin.featureToggles.createBtn', 'Create Flag')}
        secondaryButtonText={t('ui.actions.cancel', 'Cancel')}
        onRequestSubmit={handleCreateFlag}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="cds-flex cds-flex-col cds-gap-03" style={{ padding: '0.5rem 0' }}>
          <TextInput
            id="ff-key-input"
            labelText={t('admin.featureToggles.keyLabel', 'Flag Key *')}
            placeholder="e.g., enable_ai_student_summaries"
            value={flagKey}
            onChange={(e) => setFlagKey(e.target.value)}
          />
          <TextInput
            id="ff-name-input"
            labelText={t('admin.featureToggles.nameLabel', 'Feature Display Name *')}
            placeholder="e.g., Gemini AI Student Performance Insights"
            value={flagName}
            onChange={(e) => setFlagName(e.target.value)}
          />
          <TextInput
            id="ff-desc-input"
            labelText={t('admin.featureToggles.descLabel', 'Description')}
            placeholder="Purpose and targeted user group..."
            value={flagDesc}
            onChange={(e) => setFlagDesc(e.target.value)}
          />
        </div>
      </Modal>
    </AdminPage>
  );
}
