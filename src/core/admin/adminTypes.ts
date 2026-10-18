/**
 * EduCore Admin Console - Primary Domain Types
 */

export type ScopeLevel = 'platform' | 'organization' | 'campus' | 'department';

export interface TenantContext {
  scope: ScopeLevel;
  organizationId?: string;
  organizationName?: string;
  campusId?: string;
  campusName?: string;
  environment: 'production' | 'staging' | 'development';
}

// User & Identity
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  avatarUrl?: string;
  phone?: string;
  title?: string;
  departmentId?: string;
  departmentName?: string;
  organizationId?: string;
  organizationName?: string;
  campusId?: string;
  campusName?: string;
  mfaEnabled: boolean;
  mfaMethod?: 'app' | 'sms' | 'email';
  roles: string[]; // Role IDs
  groups: string[]; // Group IDs
  lastLoginAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Group
export interface UserGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  organizationId?: string;
  roles: string[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Role & Permission
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  scope: ScopeLevel;
  isSystemRole: boolean;
  permissions: string[]; // e.g., 'users.read', 'users.create'
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string; // e.g., 'users.read'
  module: string; // e.g., 'identity'
  resource: string; // e.g., 'users'
  action: 'read' | 'create' | 'update' | 'delete' | 'manage' | 'execute' | 'export';
  description: string;
  scopeAllowed: ScopeLevel[];
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
  conditions?: Record<string, any>;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  startedAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

// Organization & Campus Hierarchy
export interface Organization {
  id: string;
  name: string;
  legalName: string;
  code: string;
  status: 'active' | 'inactive' | 'archived';
  type: 'higher_education' | 'k12' | 'district' | 'vocational';
  email: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  timezone: string;
  currency: string;
  locale: string;
  campusCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  address: string;
  timezone: string;
  phone: string;
  email: string;
  administratorName: string;
  studentCount: number;
  facultyCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  campusId?: string;
  campusName?: string;
  name: string;
  code: string;
  headName: string;
  facultyCount: number;
  status: 'active' | 'inactive';
}

export interface AcademicUnit {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: 'faculty' | 'college' | 'school' | 'institute';
  deanName: string;
  programCount: number;
}

// Academic Configuration
export interface AcademicYear {
  id: string;
  organizationId: string;
  code: string; // e.g. 2026-2027
  title: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  isCurrent: boolean;
}

export interface AcademicTerm {
  id: string;
  academicYearId: string;
  academicYearCode: string;
  name: string; // Fall 2026, Spring 2027
  code: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  isRegistrationOpen: boolean;
}

export interface AcademicProgram {
  id: string;
  code: string;
  title: string;
  degreeType: 'bachelor' | 'master' | 'doctorate' | 'diploma';
  departmentName: string;
  totalCredits: number;
  durationYears: number;
  status: 'active' | 'inactive';
}

export interface AcademicGrade {
  id: string;
  code: string;
  title: string;
  level: number;
  stage: 'elementary' | 'middle' | 'high' | 'undergraduate' | 'postgraduate';
}

export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  departmentName: string;
  type: 'core' | 'elective' | 'lab';
}

export interface ClassSection {
  id: string;
  code: string;
  subjectName: string;
  termName: string;
  instructorName: string;
  roomNumber: string;
  maxCapacity: number;
  enrolledCount: number;
  status: 'active' | 'full' | 'closed';
}

// System Settings
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'integer' | 'decimal' | 'boolean' | 'enum' | 'json' | 'secret' | 'url' | 'email';
  scope: ScopeLevel;
  category: 'general' | 'regional' | 'localization' | 'branding' | 'email' | 'notifications' | 'storage' | 'security';
  description: string;
  defaultValue: any;
  secret: boolean;
  mutable: boolean;
  updatedBy: string;
  updatedAt: string;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetScopes: ScopeLevel[];
  targetOrganizations?: string[];
  environment: 'all' | 'production' | 'staging' | 'development';
  tags: string[];
  updatedBy: string;
  updatedAt: string;
}

// Workflows
export interface WorkflowDefinition {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  states: Array<{ id: string; name: string; type: 'initial' | 'intermediate' | 'terminal' }>;
  transitions: Array<{ from: string; to: string; action: string; requiredRole?: string }>;
  createdAt: string;
  updatedAt: string;
}

// Notifications
export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  channel: 'email' | 'sms' | 'in_app' | 'push' | 'webhook';
  subjectTemplate: string;
  bodyTemplate: string;
  version: number;
  status: 'active' | 'inactive';
  updatedAt: string;
}

// Integrations & Developer
export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: 'sso' | 'payment' | 'lms' | 'sftp' | 'messaging' | 'storage';
  type: 'rest' | 'oauth' | 'oidc' | 'sftp' | 'webhook' | 'mq';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSyncAt?: string;
  errorMessage?: string;
  config: Record<string, any>;
}

export interface ApiClient {
  id: string;
  clientId: string;
  name: string;
  description: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  maskedSecret: string;
  lastUsedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secretMasked: string;
  status: 'active' | 'failing' | 'disabled';
  failureCount: number;
  createdAt: string;
}

// Audit & Operations
export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'FAILED_LOGIN' | 'SUSPICIOUS_IP' | 'UNAUTHORIZED_ACCESS' | 'MFA_BYPASS_ATTEMPT' | 'PRIVILEGE_ELEVATION';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actorEmail: string;
  ipAddress: string;
  location?: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface AdminJob {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error?: string;
  initiatedBy: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  description: string;
  status: 'enabled' | 'disabled';
  lastRunAt?: string;
  lastRunResult?: 'success' | 'failure';
  nextRunAt: string;
}

export interface SystemHealthComponent {
  id: string;
  name: string;
  category: 'api' | 'database' | 'queue' | 'cache' | 'storage' | 'integration';
  status: 'healthy' | 'degraded' | 'unavailable' | 'unknown';
  latencyMs: number;
  message?: string;
  lastCheckedAt: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalCampuses: number;
  totalStudents: number;
  totalAdministrators: number;
  pendingApprovals: number;
  failedJobs: number;
  integrationFailures: number;
  securityEventsCount: number;
  systemHealthStatus: 'healthy' | 'degraded' | 'unavailable';
  uptimePercentage: number;
}
