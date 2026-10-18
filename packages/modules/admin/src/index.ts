/**
 * @schools/module-admin — Authoritative Multi-Tenant Platform & IAM Module
 * Enforces AGENTS.md §13:
 * - Authoritative Owner of: Organization, Campus, Department, AcademicUnit, User, Role, AccessPolicy, FeatureFlag, SystemAuditLog, Workflow
 */

import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export const ADMIN_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.admin;

export { AdminDashboard } from '../../../../src/app/admin/views/AdminDashboard';
export { OrganizationsPage } from '../../../../src/app/admin/views/organization/OrganizationsPage';
export { UsersPage } from '../../../../src/app/admin/views/identity/UsersPage';
export { IAMConsolePage } from '../../../../src/app/admin/views/identity/IAMConsolePage';
export { UserDetailPage } from '../../../../src/app/admin/views/identity/UserDetailPage';
export { RolesPage } from '../../../../src/app/admin/views/access/RolesPage';
export { GeneralSettingsPage } from '../../../../src/app/admin/views/system/GeneralSettingsPage';
export { FeatureFlagsPage } from '../../../../src/app/admin/views/feature-management/FeatureFlagsPage';
export { AuditLogsPage } from '../../../../src/app/admin/views/audit/AuditLogsPage';
export { JobsPage } from '../../../../src/app/admin/views/operations/JobsPage';
export { ConsoleSettingsPage } from '../../../../src/app/admin/views/administration/ConsoleSettingsPage';
export { NotificationsPage } from '../../../../src/app/admin/views/platform/NotificationsPage';
export { WorkflowsPage } from '../../../../src/app/admin/views/platform/WorkflowsPage';
