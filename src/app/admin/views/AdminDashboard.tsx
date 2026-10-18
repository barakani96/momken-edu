/**
 * EduCore Admin Console - Main Dashboard Overview (`/admin`)
 * Built using IBM Carbon patterns (Grid, Tiles, Metrics, Data Tables).
 * Fetches real API data via adminApi client with loading and error states.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Tag,
  Tile,
  Dropdown,
  Loading,
  InlineNotification,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  User,
  Enterprise,
  Security,
  Search,
  Settings,
  Flag,
  Renew,
  UserAdmin,
  ArrowRight,
  Task,
  Flash,
} from '@carbon/icons-react';

import { useAdminStore } from '../../../core/admin/adminStore';
import { useBreakpoint } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import {
  AdminPage,
  AdminSection,
  AdminEmptyState,
} from '../../../ui/admin/AdminPage';
import { AdminMetricCard, AdminHealthIndicator } from '../../../ui/admin/AdminMetricCard';
import { AdminStatusBadge } from '../../../ui/admin/AdminStatusBadge';
import { PermissionGate } from '../../../components/auth/PermissionGate';
import {
  adminApi,
  DashboardMetricsResponse,
} from '../../../services/adminApi';
import { SystemHealthComponent, AdminUser, AdminJob } from '../../../core/admin/adminTypes';
import { AuditLogEntry } from '../../../core/auditLogger';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // i18n
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  // API Data States
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [healthList, setHealthList] = useState<SystemHealthComponent[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>([]);
  const [activeUsersList, setActiveUsersList] = useState<AdminUser[]>([]);
  const [jobsList, setJobsList] = useState<AdminJob[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Safe array guards for robustness
  const safeHealthList = Array.isArray(healthList) ? healthList : [];
  const safeAuditLogsList = Array.isArray(auditLogsList) ? auditLogsList : [];
  const safeActiveUsersList = Array.isArray(activeUsersList) ? activeUsersList : [];
  const safeJobsList = Array.isArray(jobsList) ? jobsList : [];

  const {
    tenantContext,
    setTenantContext,
    resetToDefaults,
  } = useAdminStore();

  // Fetch Dashboard data from Central API Client
  const fetchDashboardData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [m, h, logs, users, jobs] = await Promise.all([
        adminApi.getDashboardMetrics(),
        adminApi.getSystemHealth(),
        adminApi.getRecentAuditLogs(8),
        adminApi.getActiveUsers(),
        adminApi.getAdminJobs(),
      ]);

      setMetrics(m);
      setHealthList(h);
      setAuditLogsList(logs);
      setActiveUsersList(users);
      setJobsList(jobs);
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to sync platform administration telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenantContext.scope, tenantContext.organizationId]);

  const tenantOptions = [
    { id: 'platform', label: t('admin.dashboardConsole.globalPlatformContext', 'Global Platform Context (All Tenants)') },
    { id: 'org_main', label: t('admin.dashboardConsole.educoreGlobalUniv', 'EduCore Global University (Main Org)') },
    { id: 'org_alnoor', label: t('admin.dashboardConsole.alnoorAcademy', 'Al-Noor International Academy') },
  ];

  return (
    <AdminPage
      title={t('admin.dashboardConsole.title', 'Platform Administration Dashboard')}
      description={t('admin.dashboardConsole.description', 'Monitor system health, manage institutional tenants, enforce security access policies, and audit operations across all EduCore services.')}
      breadcrumbs={[{ label: t('shell.nav.adminConsole', 'Admin Console'), href: '/admin' }, { label: t('admin.nav.overview', isAr ? 'نظرة عامة' : 'Overview') }]}
      actions={
        <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap">
          {/* Global Search Trigger */}
          <Button
            kind="tertiary"
            size="md"
            renderIcon={Search}
            onClick={() => setIsCommandOpen(true)}
          >
            {t('admin.dashboardConsole.commandSearch', 'Command Search (Ctrl+K)')}
          </Button>

          {/* PermissionGate Protected Resync Control */}
          <PermissionGate permission="system.manage" role="role_platform_admin">
            <Button
              kind="ghost"
              size="md"
              renderIcon={Renew}
              onClick={fetchDashboardData}
            >
              {t('admin.dashboardConsole.syncTelemetry', 'Sync Telemetry')}
            </Button>
          </PermissionGate>

          {/* Reset Seed Data */}
          <PermissionGate role={['admin', 'role_platform_admin']}>
            <Button
              kind="ghost"
              size="md"
              renderIcon={Renew}
              onClick={() => {
                resetToDefaults();
                fetchDashboardData();
              }}
            >
              {t('admin.dashboardConsole.resetDemoData', 'Reset Demo Data')}
            </Button>
          </PermissionGate>
        </div>
      }
    >
      {/* Fetch Error Banner */}
      {fetchError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <InlineNotification
            kind="error"
            title={t('admin.dashboardConsole.telemetryApiFault', 'Telemetry API Fault')}
            subtitle={fetchError}
          />
          <Button kind="ghost" size="sm" onClick={fetchDashboardData} style={{ marginTop: '0.5rem' }}>
            {t('admin.dashboardConsole.retrySync', 'Retry Sync')}
          </Button>
        </div>
      )}

      {/* Tenant Context & Environment Banner */}
      <div
        className="cds-flex cds-items-center cds-justify-between cds-flex-wrap cds-gap-03"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--cds-layer-02)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '2px',
          marginBottom: '1.5rem',
        }}
      >
        <div className="cds-flex cds-items-center cds-gap-03 cds-flex-wrap">
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', display: 'block' }}>
              {t('admin.dashboardConsole.activeTenantScope', 'Active Tenant Scope')}
            </span>
            <div style={{ width: '100%', minWidth: '260px', maxWidth: '340px', marginTop: '0.25rem' }}>
              <Dropdown
                id="tenant-context-dropdown-dash"
                titleText={t('admin.dashboardConsole.tenantScopeContext', 'Tenant Scope Context')}
                label={t('admin.dashboardConsole.selectTenantScope', 'Select Tenant Scope')}
                items={tenantOptions}
                itemToString={(item) => (item ? item.label : '')}
                selectedItem={
                  tenantOptions.find(
                    (tOpt) => tOpt.id === tenantContext.organizationId || (tenantContext.scope === 'platform' && tOpt.id === 'platform')
                  ) || tenantOptions[0]
                }
                onChange={({ selectedItem }) => {
                  if (!selectedItem) return;
                  if (selectedItem.id === 'platform') {
                    setTenantContext({ scope: 'platform', organizationId: undefined });
                  } else {
                    setTenantContext({ scope: 'organization', organizationId: selectedItem.id, organizationName: selectedItem.label });
                  }
                }}
                size="sm"
              />
            </div>
          </div>

          <div style={{ paddingInlineStart: '1rem', borderInlineStart: '1px solid var(--cds-border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', display: 'block' }}>
              {t('admin.dashboardConsole.environment', 'Environment')}
            </span>
            <Tag type="green" size="md" style={{ marginTop: '0.25rem' }}>
              {t('admin.dashboardConsole.production', 'PRODUCTION (v11.4.2)')}
            </Tag>
          </div>
        </div>

        <div className="cds-flex cds-items-center cds-gap-02">
          <Tag type="cool-gray" size="md">
            {t('admin.dashboardConsole.datacenters', 'Riyadh / Boston Datacenters')}
          </Tag>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Loading active withOverlay={false} description={t('admin.dashboardConsole.fetchingTelemetry', 'Fetching administrative telemetry...')} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
            {t('admin.dashboardConsole.connectingGateway', 'Connecting to EduCore Admin API gateway...')}
          </p>
        </div>
      ) : (
        <>
          {/* Primary Key Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <AdminMetricCard
              title={t('admin.dashboardConsole.activeUserAccounts', 'Active User Accounts')}
              value={metrics?.activeUsersCount ?? safeActiveUsersList.length}
              subtitle={isAr 
                ? `الإجمالي: ${metrics?.totalUsersCount || 0} (تم فرض التحقق الثنائي MFA بنسبة ${metrics?.mfaAdoptionRate || 0}%)` 
                : `Total: ${metrics?.totalUsersCount || 0} (${metrics?.mfaAdoptionRate || 0}% MFA enforced)`}
              icon={<User size={20} />}
              onClick={() => navigate('/admin/identity/users')}
            />
            <AdminMetricCard
              title={t('admin.dashboardConsole.institutionalOrgs', 'Institutional Organizations')}
              value={metrics?.organizationsCount ?? 2}
              subtitle={t('admin.dashboardConsole.registeredDomains', 'Registered university domains')}
              icon={<Enterprise size={20} />}
              onClick={() => navigate('/admin/organization/organizations')}
            />
            <AdminMetricCard
              title={t('admin.dashboardConsole.securityAlerts', 'Security Threats / Alerts')}
              value={metrics?.unresolvedSecurityAlerts ?? 0}
              subtitle={
                (metrics?.unresolvedSecurityAlerts ?? 0) > 0
                  ? t('admin.dashboardConsole.requiresReview', 'Requires administrative review')
                  : t('admin.dashboardConsole.allResolved', 'All security events resolved')
              }
              kind={(metrics?.unresolvedSecurityAlerts ?? 0) > 0 ? 'warning' : 'success'}
              icon={<Security size={20} />}
              onClick={() => navigate('/admin/audit/security-events')}
            />
            <AdminMetricCard
              title={t('admin.dashboardConsole.infrastructureHealth', 'Infrastructure Health')}
              value={isAr 
                ? (metrics?.systemHealthStatus === 'degraded' ? t('admin.dashboardConsole.degraded', 'degraded') : t('admin.dashboardConsole.healthy', 'healthy')) 
                : (metrics?.systemHealthStatus || 'healthy').toUpperCase()}
              subtitle={isAr 
                ? `${safeHealthList.filter((h) => h.status === 'healthy').length} / ${safeHealthList.length} من المكونات تعمل بشكل ممتاز` 
                : `${safeHealthList.filter((h) => h.status === 'healthy').length} / ${safeHealthList.length} operational components`}
              kind={metrics?.systemHealthStatus === 'degraded' ? 'warning' : 'success'}
              icon={<Flash size={20} />}
              onClick={() => navigate('/admin/operations/health')}
            />
          </div>

          {/* Grid Layout: System Health Status & Recent Audit Logs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '2fr 1fr',
              gap: '1.5rem',
            }}
          >
            {/* Left Column: Health & Recent Audit Trail */}
            <div>
              {/* Infrastructure Health Status Summary */}
              <AdminSection title={t('admin.dashboardConsole.systemHealthStatus', 'System & Service Health Status')}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  {safeHealthList.map((hc) => (
                    <Tile key={hc.id} style={{ backgroundColor: 'var(--cds-layer-02)', padding: '1rem' }}>
                      <AdminHealthIndicator status={hc.status} label={hc.name} latencyMs={hc.latencyMs} />
                      {hc.message && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--cds-support-warning)', margin: '0.5rem 0 0' }}>
                          {hc.message}
                        </p>
                      )}
                    </Tile>
                  ))}
                </div>

                <div className="cds-flex cds-justify-end">
                  <Button kind="ghost" size="sm" renderIcon={ArrowRight} onClick={() => navigate('/admin/operations/health')}>
                    {t('admin.dashboardConsole.diagnosticsLogs', 'Diagnostics & Health Logs')}
                  </Button>
                </div>
              </AdminSection>

              {/* Recent Audit Logs Data Table */}
              <AdminSection
                title={t('admin.dashboardConsole.recentAuditLogs', 'Recent Audit Logs')}
                actions={
                  <Button kind="tertiary" size="sm" onClick={() => navigate('/admin/audit/logs')}>
                    {t('admin.dashboardConsole.viewAuditTrail', 'View Full Audit Trail')}
                  </Button>
                }
              >
                {safeAuditLogsList.length === 0 ? (
                  <AdminEmptyState title={isAr ? "لا توجد سجلات تدقيق مسجلة" : "No audit entries recorded"} />
                ) : (
                  <Table size="sm">
                    <TableHead>
                      <TableRow>
                        <TableHeader>{t('admin.dashboardConsole.timestamp', 'Timestamp')}</TableHeader>
                        <TableHeader>{t('admin.dashboardConsole.userActor', 'User / Actor')}</TableHeader>
                        <TableHeader>{t('admin.dashboardConsole.action', 'Action')}</TableHeader>
                        <TableHeader>{t('admin.dashboardConsole.module', 'Module')}</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safeAuditLogsList.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </TableCell>
                          <TableCell style={{ fontWeight: 600 }}>{log.actor || 'admin@educore.edu'}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <Tag type="blue" size="sm">
                              {log.moduleId || 'system'}
                            </Tag>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AdminSection>
            </div>

            {/* Right Column: Quick Admin Controls & Tasks */}
            <div>
              <AdminSection title={t('admin.dashboardConsole.adminActions', 'Administrative Actions')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <PermissionGate permission="users.read">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={UserAdmin}
                      onClick={() => navigate('/admin/identity/users')}
                    >
                      {t('admin.dashboardConsole.userDirectory', 'User & Account Directory')}
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="organization.read">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={Enterprise}
                      onClick={() => navigate('/admin/organization/organizations')}
                    >
                      {t('admin.dashboardConsole.orgsCampuses', 'Organizations & Campuses')}
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="roles.read">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={Security}
                      onClick={() => navigate('/admin/access/roles')}
                    >
                      {t('admin.dashboardConsole.rbacRoles', 'RBAC Roles & Matrix')}
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="settings.read">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={Settings}
                      onClick={() => navigate('/admin/system/general')}
                    >
                      {t('admin.dashboardConsole.systemConfig', 'System Configuration')}
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="feature_flags.manage">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={Flag}
                      onClick={() => navigate('/admin/feature-management/flags')}
                    >
                      {t('admin.dashboardConsole.featureFlags', 'Feature Flag Toggles')}
                    </Button>
                  </PermissionGate>

                  <PermissionGate permission="jobs.manage">
                    <Button
                      kind="tertiary"
                      className="cds-w-full cds-justify-start"
                      renderIcon={Task}
                      onClick={() => navigate('/admin/operations/jobs')}
                    >
                      {t('admin.dashboardConsole.bgOperations', 'Background Job Operations')}
                    </Button>
                  </PermissionGate>
                </div>
              </AdminSection>

              {/* Background Tasks Overview */}
              <AdminSection title={t('admin.dashboardConsole.bgOperationsQueue', 'Background Operations Queue')}>
                {safeJobsList.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="cds-flex cds-items-center cds-justify-between"
                    style={{
                      padding: '0.625rem 0.875rem',
                      backgroundColor: 'var(--cds-layer-02)',
                      border: '1px solid var(--cds-border-subtle)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                        {job.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                        {t('admin.dashboardConsole.initiatedBy', 'Initiated by:')} {job.initiatedBy}
                      </div>
                    </div>
                    <AdminStatusBadge status={job.status} />
                  </div>
                ))}
              </AdminSection>
            </div>
          </div>
        </>
      )}
    </AdminPage>
  );
}

export default AdminDashboard;
