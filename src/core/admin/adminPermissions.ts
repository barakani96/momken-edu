/**
 * EduCore Admin Console - Granular RBAC Permissions Registry
 */

import { Permission, ScopeLevel } from './adminTypes';

export const ADMIN_PERMISSIONS: Permission[] = [
  // Identity & Access
  { id: 'p_users_read', code: 'users.read', module: 'identity', resource: 'users', action: 'read', description: 'View user list, details, and active sessions', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_users_create', code: 'users.create', module: 'identity', resource: 'users', action: 'create', description: 'Create new user accounts and profile details', scopeAllowed: ['platform', 'organization'] },
  { id: 'p_users_update', code: 'users.update', module: 'identity', resource: 'users', action: 'update', description: 'Modify user profiles, statuses, and contact information', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_users_delete', code: 'users.delete', module: 'identity', resource: 'users', action: 'delete', description: 'Deactivate, suspend, or purge user accounts', scopeAllowed: ['platform', 'organization'] },
  { id: 'p_users_impersonate', code: 'users.impersonate', module: 'identity', resource: 'users', action: 'execute', description: 'Impersonate user session for authorized support', scopeAllowed: ['platform'] },

  // Roles & Policies
  { id: 'p_roles_read', code: 'roles.read', module: 'access', resource: 'roles', action: 'read', description: 'View system roles and permission matrices', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_roles_manage', code: 'roles.manage', module: 'access', resource: 'roles', action: 'manage', description: 'Create, edit, clone, and assign roles and permissions', scopeAllowed: ['platform', 'organization'] },
  { id: 'p_policies_manage', code: 'policies.manage', module: 'access', resource: 'policies', action: 'manage', description: 'Configure ABAC security policies and access rules', scopeAllowed: ['platform'] },

  // Organization & Campus
  { id: 'p_orgs_read', code: 'orgs.read', module: 'organization', resource: 'organizations', action: 'read', description: 'View institutional structure, campuses, and departments', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_orgs_manage', code: 'orgs.manage', module: 'organization', resource: 'organizations', action: 'manage', description: 'Create, update, and manage organizations and campuses', scopeAllowed: ['platform', 'organization'] },

  // Academic & SIS Config
  { id: 'p_academic_read', code: 'academic.read', module: 'academic', resource: 'academic_config', action: 'read', description: 'View academic years, terms, and programs', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_academic_manage', code: 'academic.manage', module: 'academic', resource: 'academic_config', action: 'manage', description: 'Configure academic years, terms, grading periods, and SIS rules', scopeAllowed: ['platform', 'organization'] },

  // System Configuration
  { id: 'p_settings_read', code: 'settings.read', module: 'configuration', resource: 'system_settings', action: 'read', description: 'View system settings and localization options', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_settings_manage', code: 'settings.manage', module: 'configuration', resource: 'system_settings', action: 'manage', description: 'Update system settings, branding, email, and storage', scopeAllowed: ['platform', 'organization'] },

  // Feature Flags
  { id: 'p_featureflags_manage', code: 'featureflags.manage', module: 'feature_management', resource: 'feature_flags', action: 'manage', description: 'Create, toggle, and manage feature rollout flags', scopeAllowed: ['platform'] },

  // Workflow & Notifications
  { id: 'p_workflow_manage', code: 'workflow.manage', module: 'workflow', resource: 'workflows', action: 'manage', description: 'Define workflows, approval steps, and automation rules', scopeAllowed: ['platform', 'organization'] },
  { id: 'p_notifications_manage', code: 'notifications.manage', module: 'notifications', resource: 'templates', action: 'manage', description: 'Manage notification templates and delivery channels', scopeAllowed: ['platform', 'organization'] },

  // Integrations & Developer
  { id: 'p_integrations_manage', code: 'integrations.manage', module: 'integrations', resource: 'integrations', action: 'manage', description: 'Configure external integrations, REST clients, and webhooks', scopeAllowed: ['platform', 'organization'] },
  { id: 'p_developer_manage', code: 'developer.manage', module: 'developer', resource: 'api_keys', action: 'manage', description: 'Issue and revoke API keys and OAuth client credentials', scopeAllowed: ['platform'] },

  // Audit & Operations
  { id: 'p_audit_read', code: 'audit.read', module: 'audit', resource: 'audit_logs', action: 'read', description: 'Inspect audit logs, security events, and history', scopeAllowed: ['platform', 'organization', 'campus'] },
  { id: 'p_operations_manage', code: 'operations.manage', module: 'operations', resource: 'jobs', action: 'manage', description: 'Manage background jobs, imports, exports, and scheduled tasks', scopeAllowed: ['platform', 'organization'] },
];

export const SYSTEM_ROLE_PERMISSIONS: Record<string, string[]> = {
  role_platform_admin: ADMIN_PERMISSIONS.map((p) => p.code),
  role_org_admin: [
    'users.read', 'users.create', 'users.update', 'users.delete',
    'roles.read', 'roles.manage',
    'orgs.read', 'orgs.manage',
    'academic.read', 'academic.manage',
    'settings.read', 'settings.manage',
    'workflow.manage', 'notifications.manage',
    'integrations.manage',
    'audit.read', 'operations.manage'
  ],
  role_campus_admin: [
    'users.read', 'users.update',
    'roles.read',
    'orgs.read',
    'academic.read',
    'settings.read',
    'audit.read',
    'operations.manage'
  ],
  role_auditor: [
    'users.read',
    'roles.read',
    'orgs.read',
    'academic.read',
    'settings.read',
    'audit.read'
  ],
  role_support_admin: [
    'users.read', 'users.update', 'users.impersonate',
    'roles.read',
    'orgs.read',
    'academic.read',
    'settings.read',
    'audit.read'
  ]
};
