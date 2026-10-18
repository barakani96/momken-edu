/**
 * EduCore Admin Console - Roles & Permissions Management View
 */

import React, { useState } from 'react';
import { Button, Modal, TextInput, Select, SelectItem, Checkbox, Tag } from '@carbon/react';
import { Add, Edit, TrashCan, View, Locked } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { ADMIN_PERMISSIONS } from '../../../../core/admin/adminPermissions';
import { Role } from '../../../../core/admin/adminTypes';
import { AdminPage } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';
import { AdminDeleteDialog } from '../../../../ui/admin/AdminConfirmationDialog';

import { useTranslation } from 'react-i18next';

export function RolesPage() {
  const { roles, createRole, updateRole, deleteRole } = useAdminStore();
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTargetRole, setDeleteTargetRole] = useState<Role | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<Role['scope']>('organization');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['users.read', 'settings.read']);

  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setScope('organization');
    setSelectedPermissions(['users.read', 'settings.read']);
  };

  const handleCreateRole = async () => {
    if (!name.trim()) return;
    await createRole({
      name,
      code: code || `ROLE_${Date.now().toString().slice(-4)}`,
      description,
      scope,
      permissions: selectedPermissions,
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const togglePermission = (permCode: string) => {
    if (selectedPermissions.includes(permCode)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permCode));
    } else {
      setSelectedPermissions([...selectedPermissions, permCode]);
    }
  };

  const columns: ColumnDef<Role>[] = [
    { key: 'name', header: t('admin.rolesConsole.roleName', 'Role Name') },
    { key: 'code', header: t('admin.rolesConsole.roleCode', 'Role Code') },
    { key: 'scope', header: t('admin.rolesConsole.scopeLevel', 'Scope Level'), render: (row) => <Tag type="purple" size="sm">{row.scope.toUpperCase()}</Tag> },
    { key: 'isSystemRole', header: t('admin.rolesConsole.type', 'Type'), render: (row) => (row.isSystemRole ? <Tag type="cool-gray" size="sm">{t('admin.rolesConsole.systemRole', 'SYSTEM ROLE')}</Tag> : <Tag type="blue" size="sm">{t('admin.rolesConsole.customRole', 'CUSTOM ROLE')}</Tag>) },
    { key: 'permissions', header: t('admin.rolesConsole.grantedPerms', 'Granted Permissions'), render: (row) => `${row.permissions.length} permissions` },
    { key: 'userCount', header: t('admin.rolesConsole.assignedUsers', 'Assigned Users') },
  ];

  return (
    <AdminPage
      title={t('admin.rolesConsole.title', 'Roles & Permission Matrices')}
      description={t('admin.rolesConsole.description', 'Define granular Role-Based Access Control (RBAC) roles, assign scope boundaries, and map permissions across modules.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('shell.nav.roles', 'Roles') }]}
      actions={
        <Button renderIcon={Add} onClick={() => setIsCreateModalOpen(true)}>
          {t('admin.rolesConsole.createBtn', 'Create Custom Role')}
        </Button>
      }
    >
      <AdminDataTable
        title={t('admin.rolesConsole.matrixTitle', 'Role Definitions Matrix')}
        description={t('admin.rolesConsole.matrixDesc', 'List of system-defined and custom administrative roles across platform, organization, and campus scopes.')}
        columns={columns}
        data={roles}
        searchPlaceholder={t('admin.rolesConsole.search', 'Search roles by name or code...')}
        rowActions={(row) =>
          !row.isSystemRole ? (
            <Button
              kind="ghost"
              size="sm"
              renderIcon={TrashCan}
              hasIconOnly
              iconDescription={t('admin.rolesConsole.deleteDesc', 'Delete custom role')}
              onClick={() => setDeleteTargetRole(row)}
            />
          ) : (
            <Tag type="cool-gray" size="sm">
              {t('admin.rolesConsole.protected', 'PROTECTED')}
            </Tag>
          )
        }
      />

      {/* Create Role Modal */}
      <Modal
        open={isCreateModalOpen}
        modalHeading={t('admin.rolesConsole.modalTitle', 'Create Custom Administrative Role')}
        modalLabel={t('admin.rolesConsole.modalLabel', 'Access Control Engine')}
        primaryButtonText={t('admin.rolesConsole.createBtn', 'Create Role')}
        secondaryButtonText={t('ui.actions.cancel', 'Cancel')}
        onRequestSubmit={handleCreateRole}
        onRequestClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        size="lg"
      >
        <div className="cds-flex cds-flex-col cds-gap-03" style={{ padding: '0.5rem 0' }}>
          <TextInput
            id="role-name-input"
            labelText={t('admin.rolesConsole.roleName', 'Role Name *')}
            placeholder="e.g., Regional Finance Auditor"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            id="role-code-input"
            labelText={t('admin.rolesConsole.roleCode', 'Role Code Identifier *')}
            placeholder="e.g., ROLE_FINANCE_AUDITOR"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextInput
            id="role-desc-input"
            labelText={t('admin.rolesConsole.roleDesc', 'Role Description')}
            placeholder="Detailed administrative responsibilities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            id="role-scope-select"
            labelText={t('admin.rolesConsole.scopeHierarchy', 'Scope Hierarchy')}
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
          >
            <SelectItem value="platform" text={t('admin.rolesConsole.scopePlatform', 'Platform Level (All Tenants)')} />
            <SelectItem value="organization" text={t('admin.rolesConsole.scopeOrg', 'Organization Level')} />
            <SelectItem value="campus" text={t('admin.rolesConsole.scopeCampus', 'Campus Level')} />
          </Select>

          {/* Permissions Matrix Checklist */}
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              {t('admin.rolesConsole.selectPerms', 'Select Granted Permissions:')}
            </span>
            <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--cds-border-subtle)', padding: '0.75rem', backgroundColor: 'var(--cds-layer-01)' }}>
              {ADMIN_PERMISSIONS.map((p) => (
                <div key={p.id} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    id={`perm-chk-${p.id}`}
                    labelText={`${p.code} (${p.description})`}
                    checked={selectedPermissions.includes(p.code)}
                    onChange={() => togglePermission(p.code)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <AdminDeleteDialog
        isOpen={!!deleteTargetRole}
        entityName={deleteTargetRole?.name || ''}
        entityType="Role"
        onConfirm={async () => {
          if (deleteTargetRole) {
            await deleteRole(deleteTargetRole.id);
            setDeleteTargetRole(null);
          }
        }}
        onClose={() => setDeleteTargetRole(null)}
      />
    </AdminPage>
  );
}
