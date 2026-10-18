/**
 * EduCore Admin Console - Organizations Management View
 */

import React, { useState } from 'react';
import { Button, Modal, TextInput, Select, SelectItem, InlineNotification } from '@carbon/react';
import { Add, Edit, TrashCan, View } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { Organization } from '../../../../core/admin/adminTypes';
import { AdminPage, AdminSection } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';
import { AdminDeleteDialog } from '../../../../ui/admin/AdminConfirmationDialog';
import { AdminDrawer, AdminDetailProperty } from '../../../../ui/admin/AdminDetailPanel';

import { useTranslation } from 'react-i18next';

export function OrganizationsPage() {
  const { organizations, createOrganization, updateOrganization, deleteOrganization } = useAdminStore();
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<Organization['type']>('higher_education');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('America/New_York');
  const [email, setEmail] = useState('');

  const resetForm = () => {
    setName('');
    setLegalName('');
    setCode('');
    setType('higher_education');
    setCountry('United States');
    setTimezone('America/New_York');
    setEmail('');
  };

  const handleCreateOrg = async () => {
    if (!name.trim()) return;
    await createOrganization({
      name,
      legalName: legalName || name,
      code: code || `ORG-${Date.now().toString().slice(-4)}`,
      type,
      country,
      timezone,
      email,
      status: 'active',
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const columns: ColumnDef<Organization>[] = [
    { key: 'name', header: t('admin.orgsConsole.orgName', 'Organization Name') },
    { key: 'code', header: t('admin.orgsConsole.code', 'Code') },
    { key: 'type', header: t('admin.orgsConsole.orgType', 'Institutional Type'), render: (row) => row.type.replace('_', ' ').toUpperCase() },
    { key: 'status', header: t('admin.jobsConsole.status', 'Status') },
    { key: 'country', header: t('admin.orgsConsole.country', 'Country') },
    { key: 'campusCount', header: t('admin.orgsConsole.campuses', 'Campuses') },
    { key: 'userCount', header: t('admin.orgsConsole.users', 'Users') },
  ];

  return (
    <AdminPage
      title={t('admin.orgsConsole.title', 'Institutional Organizations')}
      description={t('admin.orgsConsole.description', 'Configure and manage high-level multi-tenant institutional organizations, governance structures, and global regional settings.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('shell.nav.organizations', 'Organizations') }]}
      actions={
        <Button renderIcon={Add} onClick={() => setIsCreateModalOpen(true)}>
          {t('admin.orgsConsole.createBtn', 'Create Organization')}
        </Button>
      }
    >
      <AdminDataTable
        title={t('admin.orgsConsole.registeredTitle', 'Registered Organizations')}
        description={t('admin.orgsConsole.registeredDesc', 'All active and archived institutional tenants under EduCore management.')}
        columns={columns}
        data={organizations}
        searchPlaceholder={t('admin.orgsConsole.search', 'Search organizations by name or code...')}
        onDeleteSelected={async (ids) => {
          for (const id of ids) {
            await deleteOrganization(id);
          }
        }}
        rowActions={(row) => (
          <div className="cds-flex cds-items-center cds-gap-01">
            <Button
              kind="ghost"
              size="sm"
              renderIcon={View}
              hasIconOnly
              iconDescription="View organization details"
              onClick={() => {
                setSelectedOrg(row);
                setIsDrawerOpen(true);
              }}
            />
            <Button
              kind="ghost"
              size="sm"
              renderIcon={TrashCan}
              hasIconOnly
              iconDescription="Delete organization"
              onClick={() => setDeleteOrg(row)}
            />
          </div>
        )}
      />

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        modalHeading={t('admin.orgsConsole.modalTitle', 'Create Institutional Organization')}
        modalLabel={t('admin.orgsConsole.modalLabel', 'Organization Directory')}
        primaryButtonText={t('admin.orgsConsole.createBtn', 'Create Organization')}
        secondaryButtonText={t('ui.actions.cancel', 'Cancel')}
        onRequestSubmit={handleCreateOrg}
        onRequestClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
      >
        <div className="cds-flex cds-flex-col cds-gap-03" style={{ padding: '0.5rem 0' }}>
          <TextInput
            id="org-name-input"
            labelText={t('admin.orgsConsole.nameLabel', 'Organization Name *')}
            placeholder="e.g., EduCore Global University"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            id="org-legal-input"
            labelText={t('admin.orgsConsole.legalLabel', 'Legal Entity Name')}
            placeholder="e.g., EduCore Foundation Inc."
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
          <TextInput
            id="org-code-input"
            labelText={t('admin.orgsConsole.codeLabel', 'Organization Code *')}
            placeholder="e.g., EDU-MAIN"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Select
            id="org-type-select"
            labelText={t('admin.orgsConsole.typeLabel', 'Institutional Type')}
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <SelectItem value="higher_education" text="Higher Education / University" />
            <SelectItem value="k12" text="K-12 School Network" />
            <SelectItem value="district" text="School District" />
            <SelectItem value="vocational" text="Vocational / Technical Institute" />
          </Select>
          <TextInput
            id="org-email-input"
            labelText={t('admin.orgsConsole.emailLabel', 'Administrative Email')}
            placeholder="admin@educore.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </Modal>

      {/* Detail Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen && !!selectedOrg}
        title={selectedOrg?.name || 'Organization Details'}
        subtitle={`Code: ${selectedOrg?.code}`}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedOrg && (
          <div>
            <AdminDetailProperty label="Organization ID" value={selectedOrg.id} />
            <AdminDetailProperty label="Legal Name" value={selectedOrg.legalName} />
            <AdminDetailProperty label="Status" value={selectedOrg.status} />
            <AdminDetailProperty label="Institutional Type" value={selectedOrg.type} />
            <AdminDetailProperty label="Administrative Email" value={selectedOrg.email} />
            <AdminDetailProperty label="Country / Region" value={selectedOrg.country} />
            <AdminDetailProperty label="Timezone" value={selectedOrg.timezone} />
            <AdminDetailProperty label="Campuses Registered" value={selectedOrg.campusCount} />
            <AdminDetailProperty label="Registered Date" value={new Date(selectedOrg.createdAt).toLocaleString()} />
          </div>
        )}
      </AdminDrawer>

      {/* Delete Dialog */}
      <AdminDeleteDialog
        isOpen={!!deleteOrg}
        entityName={deleteOrg?.name || ''}
        entityType="Organization"
        typedConfirmation
        onConfirm={async () => {
          if (deleteOrg) {
            await deleteOrganization(deleteOrg.id);
            setDeleteOrg(null);
          }
        }}
        onClose={() => setDeleteOrg(null)}
      />
    </AdminPage>
  );
}
