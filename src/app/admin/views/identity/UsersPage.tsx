/**
 * EduCore Admin Console - User Account Management View
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, TextInput, Select, SelectItem, Tag } from '@carbon/react';
import { Add, View, TrashCan } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { AdminUser } from '../../../../core/admin/adminTypes';
import { AdminPage } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';
import { AdminDeleteDialog } from '../../../../ui/admin/AdminConfirmationDialog';

export function UsersPage() {
  const navigate = useNavigate();
  const { users, roles, createUser, deleteUser } = useAdminStore();
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState('role_campus_admin');

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setUsername('');
    setTitle('');
    setSelectedRole('role_campus_admin');
  };

  const handleCreateUser = async () => {
    if (!fullName.trim() || !email.trim()) return;
    const created = await createUser({
      fullName,
      email,
      username: username || email.split('@')[0],
      title,
      roles: [selectedRole],
      status: 'active',
      mfaEnabled: true,
    });
    setIsCreateModalOpen(false);
    resetForm();
    navigate(`/admin/identity/users/${created.id}`);
  };

  const columns: ColumnDef<AdminUser>[] = [
    { key: 'fullName', header: t('admin.usersConsole.fullName', 'Full Name') },
    { key: 'email', header: t('admin.usersConsole.email', 'Email Address') },
    { key: 'title', header: t('admin.usersConsole.jobTitle', 'Job Title / Role Title') },
    { key: 'status', header: t('admin.usersConsole.status', 'Account Status') },
    {
      key: 'roles',
      header: t('admin.usersConsole.assignedRoles', 'Assigned Roles'),
      render: (row) =>
        row.roles.map((rId) => {
          const r = roles.find((role) => role.id === rId || role.code === rId);
          return (
            <Tag key={rId} type="purple" size="sm">
              {r ? r.name : rId}
            </Tag>
          );
        }),
    },
    { key: 'organizationName', header: t('admin.usersConsole.organization', 'Organization') },
    {
      key: 'mfaEnabled',
      header: t('admin.usersConsole.mfa', 'MFA'),
      render: (row) => (row.mfaEnabled ? t('admin.usersConsole.mfaEnforced', 'Enforced') : t('admin.usersConsole.mfaDisabled', 'Disabled')),
    },
  ];

  return (
    <AdminPage
      title={t('admin.usersConsole.title', 'User Directory & Identity Accounts')}
      description={t('admin.usersConsole.description', 'Manage enterprise administrative users, identity profiles, multi-factor authentication requirements, and role assignments.')}
      breadcrumbs={[
        { label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' },
        { label: t('shell.nav.users', 'Users') },
      ]}
      actions={
        <Button renderIcon={Add} onClick={() => setIsCreateModalOpen(true)}>
          {t('admin.usersConsole.createBtn', 'Create User Account')}
        </Button>
      }
    >
      <AdminDataTable
        title={t('admin.usersConsole.tableTitle', 'Active User Directory')}
        description={t('admin.usersConsole.tableDesc', 'List of all registered administrators, managers, and system auditors across all institutional tenants.')}
        columns={columns}
        data={users}
        searchPlaceholder={t('admin.usersConsole.search', 'Search users by name, email, or role...')}
        onDeleteSelected={async (ids) => {
          for (const id of ids) {
            await deleteUser(id);
          }
        }}
        rowActions={(row) => (
          <div className="cds-flex cds-items-center cds-gap-01">
            <Button
              kind="ghost"
              size="sm"
              renderIcon={View}
              hasIconOnly
              iconDescription={t('admin.usersConsole.inspectUser', 'Inspect user profile & permissions')}
              onClick={() => navigate(`/admin/identity/users/${row.id}`)}
            />
            <Button
              kind="ghost"
              size="sm"
              renderIcon={TrashCan}
              hasIconOnly
              iconDescription={t('admin.usersConsole.deleteUser', 'Delete user account')}
              onClick={() => setDeleteTargetUser(row)}
            />
          </div>
        )}
      />

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        modalHeading={t('admin.usersConsole.provisionTitle', 'Provision New User Account')}
        modalLabel={t('admin.usersConsole.provisionLabel', 'Identity Administration')}
        primaryButtonText={t('admin.usersConsole.provisionBtn', 'Provision Account')}
        secondaryButtonText={t('ui.actions.cancel', 'Cancel')}
        onRequestSubmit={handleCreateUser}
        onRequestClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
      >
        <div className="cds-flex cds-flex-col cds-gap-03" style={{ padding: '0.5rem 0' }}>
          <TextInput
            id="user-fullname-input"
            labelText={t('admin.usersConsole.fullNameLabel', 'Full Name *')}
            placeholder={t('ui.placeholders.fullName', 'e.g., Dr. Sarah Jenkins')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextInput
            id="user-email-input"
            labelText={t('admin.usersConsole.emailLabel', 'Institutional Email Address *')}
            placeholder="sjenkins@educore.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            id="user-title-input"
            labelText={t('admin.usersConsole.jobLabel', 'Job Title / Department Role')}
            placeholder={t('ui.placeholders.jobTitle', 'e.g., Dean of Academic Operations')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            id="user-role-select"
            labelText={t('admin.usersConsole.roleLabel', 'Primary Administrative Role')}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id} text={`${r.name} (${r.scope.toUpperCase()})`} />
            ))}
          </Select>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <AdminDeleteDialog
        isOpen={!!deleteTargetUser}
        entityName={deleteTargetUser?.fullName || ''}
        entityType={t('admin.usersConsole.userType', 'User Account')}
        typedConfirmation
        onConfirm={async () => {
          if (deleteTargetUser) {
            await deleteUser(deleteTargetUser.id);
            setDeleteTargetUser(null);
          }
        }}
        onClose={() => setDeleteTargetUser(null)}
      />
    </AdminPage>
  );
}
