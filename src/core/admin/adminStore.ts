/**
 * EduCore Admin Console - Central Store & Reactive State Engine
 */

import { create } from 'zustand';
import { auditLogger } from '../auditLogger';
import {
  AdminUser,
  UserGroup,
  Role,
  AccessPolicy,
  Organization,
  Campus,
  Department,
  AcademicUnit,
  AcademicYear,
  AcademicTerm,
  AcademicProgram,
  AcademicGrade,
  AcademicSubject,
  ClassSection,
  SystemSetting,
  FeatureFlag,
  WorkflowDefinition,
  NotificationTemplate,
  Integration,
  ApiClient,
  SecurityEvent,
  AdminJob,
  ScheduledTask,
  SystemHealthComponent,
  TenantContext,
  UserSession,
} from './adminTypes';

import {
  SEED_ORGANIZATIONS,
  SEED_CAMPUSES,
  SEED_DEPARTMENTS,
  SEED_ACADEMIC_UNITS,
  SEED_USERS,
  SEED_GROUPS,
  SEED_ROLES,
  SEED_ACCESS_POLICIES,
  SEED_SESSIONS,
  SEED_ACADEMIC_YEARS,
  SEED_ACADEMIC_TERMS,
  SEED_PROGRAMS,
  SEED_GRADES,
  SEED_SUBJECTS,
  SEED_SECTIONS,
  SEED_SYSTEM_SETTINGS,
  SEED_FEATURE_FLAGS,
  SEED_WORKFLOWS,
  SEED_NOTIFICATION_TEMPLATES,
  SEED_INTEGRATIONS,
  SEED_API_CLIENTS,
  SEED_SECURITY_EVENTS,
  SEED_JOBS,
  SEED_SCHEDULED_TASKS,
  SEED_HEALTH_COMPONENTS,
} from './adminSeedData';

export interface AdminStoreState {
  // Tenant Context
  tenantContext: TenantContext;
  setTenantContext: (context: Partial<TenantContext>) => void;

  // Entities
  organizations: Organization[];
  campuses: Campus[];
  departments: Department[];
  academicUnits: AcademicUnit[];
  users: AdminUser[];
  groups: UserGroup[];
  roles: Role[];
  policies: AccessPolicy[];
  sessions: UserSession[];
  academicYears: AcademicYear[];
  academicTerms: AcademicTerm[];
  academicPrograms: AcademicProgram[];
  academicGrades: AcademicGrade[];
  academicSubjects: AcademicSubject[];
  classSections: ClassSection[];
  systemSettings: SystemSetting[];
  featureFlags: FeatureFlag[];
  workflows: WorkflowDefinition[];
  notificationTemplates: NotificationTemplate[];
  integrations: Integration[];
  apiClients: ApiClient[];
  securityEvents: SecurityEvent[];
  jobs: AdminJob[];
  scheduledTasks: ScheduledTask[];
  healthComponents: SystemHealthComponent[];

  // User CRUD
  createUser: (user: Partial<AdminUser>) => Promise<AdminUser>;
  updateUser: (id: string, changes: Partial<AdminUser>) => Promise<AdminUser>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string, newStatus: AdminUser['status']) => Promise<void>;

  // Organization CRUD
  createOrganization: (org: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (id: string, changes: Partial<Organization>) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;

  // Campus CRUD
  createCampus: (cmp: Partial<Campus>) => Promise<Campus>;
  updateCampus: (id: string, changes: Partial<Campus>) => Promise<Campus>;
  deleteCampus: (id: string) => Promise<void>;

  // Role CRUD
  createRole: (role: Partial<Role>) => Promise<Role>;
  updateRole: (id: string, changes: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;

  // Setting Mutations
  updateSystemSetting: (id: string, newValue: any) => Promise<SystemSetting>;

  // Feature Flag Mutations
  toggleFeatureFlag: (id: string, enabled?: boolean) => Promise<FeatureFlag>;
  updateFeatureFlag: (id: string, changes: Partial<FeatureFlag>) => Promise<FeatureFlag>;

  // Workflow Mutations
  createWorkflow: (wf: Partial<WorkflowDefinition>) => Promise<WorkflowDefinition>;
  updateWorkflow: (id: string, changes: Partial<WorkflowDefinition>) => Promise<WorkflowDefinition>;

  // Integration Mutations
  updateIntegration: (id: string, changes: Partial<Integration>) => Promise<Integration>;
  testIntegrationConnection: (id: string) => Promise<{ success: boolean; message: string }>;

  // Job Actions
  retryJob: (id: string) => Promise<void>;
  cancelJob: (id: string) => Promise<void>;

  // Reset to Seed Data
  resetToDefaults: () => void;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  tenantContext: {
    scope: 'platform',
    environment: 'production',
  },

  setTenantContext: (context) => {
    set((prev) => ({
      tenantContext: { ...prev.tenantContext, ...context },
    }));
    auditLogger.logAction('admin-shell', 'Switch Tenant Context', context);
  },

  organizations: SEED_ORGANIZATIONS,
  campuses: SEED_CAMPUSES,
  departments: SEED_DEPARTMENTS,
  academicUnits: SEED_ACADEMIC_UNITS,
  users: SEED_USERS,
  groups: SEED_GROUPS,
  roles: SEED_ROLES,
  policies: SEED_ACCESS_POLICIES,
  sessions: SEED_SESSIONS,
  academicYears: SEED_ACADEMIC_YEARS,
  academicTerms: SEED_ACADEMIC_TERMS,
  academicPrograms: SEED_PROGRAMS,
  academicGrades: SEED_GRADES,
  academicSubjects: SEED_SUBJECTS,
  classSections: SEED_SECTIONS,
  systemSettings: SEED_SYSTEM_SETTINGS,
  featureFlags: SEED_FEATURE_FLAGS,
  workflows: SEED_WORKFLOWS,
  notificationTemplates: SEED_NOTIFICATION_TEMPLATES,
  integrations: SEED_INTEGRATIONS,
  apiClients: SEED_API_CLIENTS,
  securityEvents: SEED_SECURITY_EVENTS,
  jobs: SEED_JOBS,
  scheduledTasks: SEED_SCHEDULED_TASKS,
  healthComponents: SEED_HEALTH_COMPONENTS,

  // User CRUD
  createUser: async (user) => {
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      username: user.username || `user_${Date.now().toString().slice(-4)}`,
      email: user.email || 'user@educore.edu',
      fullName: user.fullName || 'New Admin User',
      status: user.status || 'active',
      title: user.title || 'Administrator',
      organizationId: user.organizationId || 'org_main',
      organizationName: user.organizationName || 'EduCore Global University',
      campusId: user.campusId,
      campusName: user.campusName,
      mfaEnabled: user.mfaEnabled ?? false,
      roles: user.roles || ['role_campus_admin'],
      groups: user.groups || [],
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ users: [newUser, ...state.users] }));

    auditLogger.logStateChange('admin-identity', 'AdminUser', 'create', {
      userId: newUser.id,
      email: newUser.email,
      roles: newUser.roles,
    });

    return newUser;
  },

  updateUser: async (id, changes) => {
    let updated: AdminUser | null = null;
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id === id) {
          updated = { ...u, ...changes, updatedAt: new Date().toISOString() };
          return updated;
        }
        return u;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-identity', 'AdminUser', 'update', {
        userId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`User ${id} not found`);
  },

  deleteUser: async (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));

    auditLogger.logStateChange('admin-identity', 'AdminUser', 'delete', { userId: id });
  },

  toggleUserStatus: async (id, newStatus) => {
    await get().updateUser(id, { status: newStatus });
  },

  // Organization CRUD
  createOrganization: async (org) => {
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: org.name || 'New Organization',
      legalName: org.legalName || org.name || 'New Organization Inc.',
      code: org.code || `ORG-${Date.now().toString().slice(-3)}`,
      status: org.status || 'active',
      type: org.type || 'higher_education',
      email: org.email || 'contact@org.edu',
      phone: org.phone || '+1 555-0000',
      website: org.website || 'https://org.edu',
      address: org.address || 'Global Campus Plaza',
      country: org.country || 'United States',
      timezone: org.timezone || 'UTC',
      currency: org.currency || 'USD',
      locale: org.locale || 'en-US',
      campusCount: 1,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ organizations: [newOrg, ...state.organizations] }));

    auditLogger.logStateChange('admin-organization', 'Organization', 'create', {
      orgId: newOrg.id,
      name: newOrg.name,
    });

    return newOrg;
  },

  updateOrganization: async (id, changes) => {
    let updated: Organization | null = null;
    set((state) => ({
      organizations: state.organizations.map((o) => {
        if (o.id === id) {
          updated = { ...o, ...changes, updatedAt: new Date().toISOString() };
          return updated;
        }
        return o;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-organization', 'Organization', 'update', {
        orgId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Organization ${id} not found`);
  },

  deleteOrganization: async (id) => {
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== id),
    }));

    auditLogger.logStateChange('admin-organization', 'Organization', 'delete', { orgId: id });
  },

  // Campus CRUD
  createCampus: async (cmp) => {
    const newCampus: Campus = {
      id: `cmp_${Date.now()}`,
      organizationId: cmp.organizationId || 'org_main',
      organizationName: cmp.organizationName || 'EduCore Global University',
      name: cmp.name || 'New Campus',
      code: cmp.code || 'CMP-NEW',
      status: cmp.status || 'active',
      address: cmp.address || 'Campus Address',
      timezone: cmp.timezone || 'UTC',
      phone: cmp.phone || '+1 555-0100',
      email: cmp.email || 'campus@educore.edu',
      administratorName: cmp.administratorName || 'Dean of Campus',
      studentCount: 0,
      facultyCount: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ campuses: [newCampus, ...state.campuses] }));

    auditLogger.logStateChange('admin-organization', 'Campus', 'create', {
      campusId: newCampus.id,
      name: newCampus.name,
    });

    return newCampus;
  },

  updateCampus: async (id, changes) => {
    let updated: Campus | null = null;
    set((state) => ({
      campuses: state.campuses.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...changes };
          return updated;
        }
        return c;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-organization', 'Campus', 'update', {
        campusId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Campus ${id} not found`);
  },

  deleteCampus: async (id) => {
    set((state) => ({
      campuses: state.campuses.filter((c) => c.id !== id),
    }));

    auditLogger.logStateChange('admin-organization', 'Campus', 'delete', { campusId: id });
  },

  // Role CRUD
  createRole: async (role) => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: role.name || 'Custom Role',
      code: role.code || `ROLE_${Date.now().toString().slice(-4)}`,
      description: role.description || 'Custom administrative role',
      scope: role.scope || 'organization',
      isSystemRole: false,
      permissions: role.permissions || ['users.read', 'settings.read'],
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ roles: [...state.roles, newRole] }));

    auditLogger.logStateChange('admin-access', 'Role', 'create', {
      roleId: newRole.id,
      code: newRole.code,
      permissions: newRole.permissions,
    });

    return newRole;
  },

  updateRole: async (id, changes) => {
    let updated: Role | null = null;
    set((state) => ({
      roles: state.roles.map((r) => {
        if (r.id === id) {
          updated = { ...r, ...changes, updatedAt: new Date().toISOString() };
          return updated;
        }
        return r;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-access', 'Role', 'update', {
        roleId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Role ${id} not found`);
  },

  deleteRole: async (id) => {
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id && !r.isSystemRole),
    }));

    auditLogger.logStateChange('admin-access', 'Role', 'delete', { roleId: id });
  },

  // Setting Mutations
  updateSystemSetting: async (id, newValue) => {
    let updated: SystemSetting | null = null;
    set((state) => ({
      systemSettings: state.systemSettings.map((s) => {
        if (s.id === id) {
          updated = {
            ...s,
            value: newValue,
            updatedBy: 'current_admin@educore.edu',
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return s;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-configuration', 'SystemSetting', 'update', {
        settingKey: (updated as SystemSetting).key,
        newValue,
      });
      return updated;
    }
    throw new Error(`Setting ${id} not found`);
  },

  // Feature Flag Mutations
  toggleFeatureFlag: async (id, enabled) => {
    let updated: FeatureFlag | null = null;
    set((state) => ({
      featureFlags: state.featureFlags.map((ff) => {
        if (ff.id === id) {
          const newStatus = enabled !== undefined ? enabled : !ff.enabled;
          updated = {
            ...ff,
            enabled: newStatus,
            updatedBy: 'current_admin@educore.edu',
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return ff;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-feature-management', 'FeatureFlag', 'update', {
        flagKey: (updated as FeatureFlag).key,
        enabled: (updated as FeatureFlag).enabled,
      });
      return updated;
    }
    throw new Error(`Feature flag ${id} not found`);
  },

  updateFeatureFlag: async (id, changes) => {
    let updated: FeatureFlag | null = null;
    set((state) => ({
      featureFlags: state.featureFlags.map((ff) => {
        if (ff.id === id) {
          updated = {
            ...ff,
            ...changes,
            updatedBy: 'current_admin@educore.edu',
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }
        return ff;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-feature-management', 'FeatureFlag', 'update', {
        flagId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Feature flag ${id} not found`);
  },

  // Workflow Mutations
  createWorkflow: async (wf) => {
    const newWf: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      code: wf.code || `WF-${Date.now().toString().slice(-4)}`,
      name: wf.name || 'New Custom Workflow',
      module: wf.module || 'general',
      description: wf.description || 'Institutional approval workflow',
      status: wf.status || 'draft',
      version: 1,
      states: wf.states || [
        { id: 'st_init', name: 'Draft Initiated', type: 'initial' },
        { id: 'st_done', name: 'Approved & Completed', type: 'terminal' },
      ],
      transitions: wf.transitions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ workflows: [...state.workflows, newWf] }));

    auditLogger.logStateChange('admin-workflow', 'WorkflowDefinition', 'create', {
      wfId: newWf.id,
      name: newWf.name,
    });

    return newWf;
  },

  updateWorkflow: async (id, changes) => {
    let updated: WorkflowDefinition | null = null;
    set((state) => ({
      workflows: state.workflows.map((w) => {
        if (w.id === id) {
          updated = { ...w, ...changes, updatedAt: new Date().toISOString() };
          return updated;
        }
        return w;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-workflow', 'WorkflowDefinition', 'update', {
        wfId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Workflow ${id} not found`);
  },

  // Integration Mutations
  updateIntegration: async (id, changes) => {
    let updated: Integration | null = null;
    set((state) => ({
      integrations: state.integrations.map((i) => {
        if (i.id === id) {
          updated = { ...i, ...changes, lastSyncAt: new Date().toISOString() };
          return updated;
        }
        return i;
      }),
    }));

    if (updated) {
      auditLogger.logStateChange('admin-integrations', 'Integration', 'update', {
        integrationId: id,
        changes,
      });
      return updated;
    }
    throw new Error(`Integration ${id} not found`);
  },

  testIntegrationConnection: async (id) => {
    const integration = get().integrations.find((i) => i.id === id);
    if (!integration) throw new Error(`Integration ${id} not found`);

    const isSuccess = integration.id !== 'int_banner_sftp';
    const newStatus = isSuccess ? 'connected' : 'error';
    const newMsg = isSuccess ? 'Handshake successful (HTTP 200 OK)' : 'Socket connection timeout on port 22';

    await get().updateIntegration(id, {
      status: newStatus,
      errorMessage: isSuccess ? undefined : newMsg,
    });

    auditLogger.logAction('admin-integrations', `Test Integration (${integration.name})`, {
      id,
      result: newStatus,
    });

    return { success: isSuccess, message: newMsg };
  },

  // Job Actions
  retryJob: async (id) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id === id) {
          return {
            ...j,
            status: 'running',
            progress: 10,
            error: undefined,
            startedAt: new Date().toISOString(),
          };
        }
        return j;
      }),
    }));

    auditLogger.logAction('admin-operations', `Retry Job ${id}`);

    // Simulate completion
    setTimeout(() => {
      set((state) => ({
        jobs: state.jobs.map((j) => {
          if (j.id === id) {
            return {
              ...j,
              status: 'completed',
              progress: 100,
              completedAt: new Date().toISOString(),
            };
          }
          return j;
        }),
      }));
    }, 2500);
  },

  cancelJob: async (id) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id === id) {
          return { ...j, status: 'cancelled' };
        }
        return j;
      }),
    }));

    auditLogger.logAction('admin-operations', `Cancel Job ${id}`);
  },

  resetToDefaults: () => {
    set({
      organizations: SEED_ORGANIZATIONS,
      campuses: SEED_CAMPUSES,
      departments: SEED_DEPARTMENTS,
      academicUnits: SEED_ACADEMIC_UNITS,
      users: SEED_USERS,
      groups: SEED_GROUPS,
      roles: SEED_ROLES,
      policies: SEED_ACCESS_POLICIES,
      sessions: SEED_SESSIONS,
      academicYears: SEED_ACADEMIC_YEARS,
      academicTerms: SEED_ACADEMIC_TERMS,
      academicPrograms: SEED_PROGRAMS,
      academicGrades: SEED_GRADES,
      academicSubjects: SEED_SUBJECTS,
      classSections: SEED_SECTIONS,
      systemSettings: SEED_SYSTEM_SETTINGS,
      featureFlags: SEED_FEATURE_FLAGS,
      workflows: SEED_WORKFLOWS,
      notificationTemplates: SEED_NOTIFICATION_TEMPLATES,
      integrations: SEED_INTEGRATIONS,
      apiClients: SEED_API_CLIENTS,
      securityEvents: SEED_SECURITY_EVENTS,
      jobs: SEED_JOBS,
      scheduledTasks: SEED_SCHEDULED_TASKS,
      healthComponents: SEED_HEALTH_COMPONENTS,
    });
    auditLogger.logAction('admin-shell', 'Reset Admin Store to Default Seed Data');
  },
}));
