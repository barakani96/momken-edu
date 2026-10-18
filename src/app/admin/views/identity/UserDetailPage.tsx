/**
 * EduCore Admin Console - User Profile & Permission Lineage Inspector (`/admin/identity/users/:id`)
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, Tile } from '@carbon/react';
import { UserAdmin, View } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { AdminAuthEngine } from '../../../../core/admin/adminAuth';
import { auditLogger } from '../../../../core/auditLogger';
import { AdminPage, AdminSection } from '../../../../ui/admin/AdminPage';
import { AdminStatusBadge } from '../../../../ui/admin/AdminStatusBadge';
import { AdminDetailProperty } from '../../../../ui/admin/AdminDetailPanel';
import { AdminAuditTimeline } from '../../../../ui/admin/AdminAuditTimeline';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, roles, groups, sessions, toggleUserStatus } = useAdminStore();
  const { t } = useTranslation();

  const [isImpersonating, setIsImpersonating] = useState(false);

  const user = users.find((u) => u.id === id);

  if (!user) {
    return (
      <AdminPage
        title={t('admin.userDetail.notFoundTitle', 'User Not Found')}
        breadcrumbs={[
          { label: t('shell.nav.users', 'Users'), href: '/admin/identity/users' },
          { label: t('admin.userDetail.notFoundTitle', 'Not Found') },
        ]}
      >
        <Tile style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>{t('admin.userDetail.notFoundDesc', 'Requested User Account Does Not Exist')}</h3>
          <Button style={{ marginTop: '1rem' }} onClick={() => navigate('/admin/identity/users')}>
            {t('admin.userDetail.returnBtn', 'Return to Users Directory')}
          </Button>
        </Tile>
      </AdminPage>
    );
  }

  // Calculate effective permissions lineage
  const effectiveLineage = AdminAuthEngine.getEffectivePermissionsLineage(user.roles, roles, user.groups);
  const userSessions = sessions.filter((s) => s.userId === user.id);

  const handleImpersonate = () => {
    setIsImpersonating(true);
    auditLogger.logAction('admin-identity', `Impersonate User Session (${user.email})`, {
      targetUserId: user.id,
      targetUserEmail: user.email,
    });
  };

  return (
    <AdminPage
      title={user.fullName}
      description={`User ID: ${user.id} • ${user.email}`}
      breadcrumbs={[
        { label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' },
        { label: t('shell.nav.users', 'Users'), href: '/admin/identity/users' },
        { label: user.fullName },
      ]}
      actions={
        <div className="cds-flex cds-items-center cds-gap-02">
          <Button
            kind={user.status === 'active' ? 'danger--tertiary' : 'tertiary'}
            size="md"
            onClick={async () => {
              const newStatus = user.status === 'active' ? 'suspended' : 'active';
              await toggleUserStatus(user.id, newStatus);
            }}
          >
            {user.status === 'active' ? t('admin.userDetail.suspendBtn', 'Suspend Account') : t('admin.userDetail.activateBtn', 'Activate Account')}
          </Button>

          <Button
            kind="primary"
            size="md"
            renderIcon={UserAdmin}
            onClick={handleImpersonate}
          >
            {t('admin.userDetail.impersonateBtn', 'Impersonate Session')}
          </Button>
        </div>
      }
    >
      {isImpersonating && (
        <div
          className="cds-flex cds-items-center cds-justify-between"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--cds-support-warning-subtle)',
            border: '1px solid var(--cds-support-warning)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
              {t('admin.userDetail.impersonatingActive', 'Active Support Impersonation Session')}
            </strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
              {t('admin.userDetail.impersonatingActiveDesc', { name: user.fullName, email: user.email })}
            </p>
          </div>
          <Button kind="ghost" size="sm" onClick={() => setIsImpersonating(false)}>
            {t('admin.userDetail.impersonatingEnd', 'End Impersonation Session')}
          </Button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div
        className="cds-flex cds-items-center cds-justify-between cds-flex-wrap cds-gap-03"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '2px',
          marginBottom: '1.5rem',
        }}
      >
        <div className="cds-flex cds-items-center cds-gap-03">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--cds-interactive)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="cds-flex cds-items-center cds-gap-02">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
                {user.fullName}
              </h2>
              <AdminStatusBadge status={user.status} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
              {user.title || 'Administrator'} • {user.organizationName || 'EduCore Platform'}
            </p>
          </div>
        </div>

        <div className="cds-flex cds-items-center cds-gap-02">
          <Tag type={user.mfaEnabled ? 'green' : 'red'} size="md">
            MFA: {user.mfaEnabled ? `ENFORCED (${user.mfaMethod?.toUpperCase()})` : 'NOT ENFORCED'}
          </Tag>
        </div>
      </div>

      {/* Tabs */}
      <Tabs>
        <TabList aria-label="User profile detail tabs">
          <Tab>{t('admin.userDetail.tabProfile', 'Profile Details')}</Tab>
          <Tab>{t('admin.userDetail.tabRoles', 'Assigned Roles & Groups')}</Tab>
          <Tab>{t('admin.userDetail.tabAccess', 'Effective Access Matrix')} ({effectiveLineage.length})</Tab>
          <Tab>{t('admin.userDetail.tabSessions', 'Active Sessions')} ({userSessions.length})</Tab>
          <Tab>{t('admin.userDetail.tabAudit', 'Security & Audit Trail')}</Tab>
        </TabList>

        <div style={{ marginTop: '1rem' }}>
          <TabPanels>
            {/* 1. Profile Details */}
            <TabPanel>
              <AdminSection title={t('admin.userDetail.metadataTitle', 'Account & Identity Metadata')}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <AdminDetailProperty label="Username" value={user.username} />
                  <AdminDetailProperty label="Email Address" value={user.email} />
                  <AdminDetailProperty label="Job Title" value={user.title} />
                  <AdminDetailProperty label="Organization" value={user.organizationName} />
                  <AdminDetailProperty label="Campus" value={user.campusName || 'All Campuses (Global)'} />
                  <AdminDetailProperty label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
                  <AdminDetailProperty label="Last Login IP" value={user.lastLoginIp || '—'} />
                  <AdminDetailProperty label="Account Created" value={new Date(user.createdAt).toLocaleString()} />
                </div>
              </AdminSection>
            </TabPanel>

            {/* 2. Assigned Roles & Groups */}
            <TabPanel>
              <AdminSection title={t('admin.userDetail.assignedRoles', 'Assigned Roles')}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {user.roles.map((rId) => {
                    const roleObj = roles.find((r) => r.id === rId || r.code === rId);
                    return (
                      <Tile key={rId} style={{ minWidth: '240px', backgroundColor: 'var(--cds-layer-02)' }}>
                        <div className="cds-flex cds-items-center cds-justify-between">
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                            {roleObj ? roleObj.name : rId}
                          </span>
                          <Tag type="purple" size="sm">
                            {roleObj?.scope.toUpperCase() || 'SCOPE'}
                          </Tag>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.375rem', marginBottom: 0 }}>
                          {roleObj?.description}
                        </p>
                      </Tile>
                    );
                  })}
                </div>
              </AdminSection>

              <AdminSection title={t('admin.userDetail.groupMemberships', 'Group Memberships')}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {user.groups.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>User is not assigned to any custom groups.</p>
                  ) : (
                    user.groups.map((gId) => {
                      const groupObj = groups.find((g) => g.id === gId || g.code === gId);
                      return (
                        <Tag key={gId} type="blue" size="md">
                          {groupObj ? groupObj.name : gId}
                        </Tag>
                      );
                    })
                  )}
                </div>
              </AdminSection>
            </TabPanel>

            {/* 3. Effective Access Matrix */}
            <TabPanel>
              <AdminSection
                title={t('admin.userDetail.effectiveMatrixTitle', 'Calculated Effective Permission Lineage')}
                description={t('admin.userDetail.effectiveMatrixDesc', 'Resolved permission tree showing exactly which roles or group rules grant each privilege.')}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--cds-border-subtle)', textAlign: 'left', backgroundColor: 'var(--cds-layer-02)' }}>
                        <th style={{ padding: '0.75rem' }}>Permission Code</th>
                        <th style={{ padding: '0.75rem' }}>Module</th>
                        <th style={{ padding: '0.75rem' }}>Description</th>
                        <th style={{ padding: '0.75rem' }}>Granted Via Roles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveLineage.map((node) => (
                        <tr key={node.code} style={{ borderBottom: '1px solid var(--cds-border-subtle)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>{node.code}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <Tag type="teal" size="sm">
                              {node.module.toUpperCase()}
                            </Tag>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--cds-text-secondary)' }}>{node.description}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {node.grantedVia.map((gv, i) => (
                              <Tag key={i} type="purple" size="sm">
                                {gv.roleName}
                              </Tag>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminSection>
            </TabPanel>

            {/* 4. Active Sessions */}
            <TabPanel>
              <AdminSection title={t('admin.userDetail.activeSessionsTitle', 'Active User Sessions')}>
                {userSessions.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>No active login sessions recorded for this user.</p>
                ) : (
                  userSessions.map((sess) => (
                    <Tile key={sess.id} style={{ marginBottom: '0.75rem', backgroundColor: 'var(--cds-layer-02)' }}>
                      <div className="cds-flex cds-items-center cds-justify-between">
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                            IP: {sess.ipAddress} • {sess.location}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                            Device: {sess.device} • User Agent: {sess.userAgent}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '0.25rem' }}>
                            Started: {new Date(sess.startedAt).toLocaleString()} • Last Active: {new Date(sess.lastActiveAt).toLocaleString()}
                          </div>
                        </div>
                        <Button kind="tertiary" size="sm">
                          Terminate Session
                        </Button>
                      </div>
                    </Tile>
                  ))
                )}
              </AdminSection>
            </TabPanel>

            {/* 5. Security & Audit */}
            <TabPanel>
              <AdminSection title={t('admin.userDetail.timelineTitle', 'User Activity Audit Timeline')}>
                <AdminAuditTimeline
                  events={[
                    {
                      id: '1',
                      timestamp: user.updatedAt,
                      actor: 'admin@educore.edu',
                      action: 'Update Profile & Roles',
                      module: 'admin-identity',
                      details: { assignedRoles: user.roles },
                    },
                    {
                      id: '2',
                      timestamp: user.createdAt,
                      actor: 'superadmin',
                      action: 'Provision User Account',
                      module: 'admin-identity',
                      details: { email: user.email },
                    },
                  ]}
                />
              </AdminSection>
            </TabPanel>
          </TabPanels>
        </div>
      </Tabs>
    </AdminPage>
  );
}
