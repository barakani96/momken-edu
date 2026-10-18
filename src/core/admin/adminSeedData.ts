/**
 * EduCore Admin Console - Comprehensive Institutional Seed Data
 */

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
  UserSession,
} from './adminTypes';

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_main',
    name: 'EduCore Global University',
    legalName: 'EduCore Higher Education Foundation Inc.',
    code: 'EDU-MAIN',
    status: 'active',
    type: 'higher_education',
    email: 'admin@educore.edu',
    phone: '+1 (555) 019-2831',
    website: 'https://educore.edu',
    address: '100 University Avenue, Boston, MA 02115',
    country: 'United States',
    timezone: 'America/New_York',
    currency: 'USD',
    locale: 'en-US',
    campusCount: 3,
    userCount: 1420,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2026-08-10T12:30:00Z',
  },
  {
    id: 'org_alnoor',
    name: 'Al-Noor International Academy',
    legalName: 'Al-Noor Educational Systems LLC',
    code: 'ALN-K12',
    status: 'active',
    type: 'k12',
    email: 'info@alnoor.edu.sa',
    phone: '+966 11 482 9900',
    website: 'https://alnoor.edu.sa',
    address: 'King Fahd Road, Riyadh 12211, Saudi Arabia',
    country: 'Saudi Arabia',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    locale: 'ar-SA',
    campusCount: 2,
    userCount: 890,
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
];

export const SEED_CAMPUSES: Campus[] = [
  {
    id: 'cmp_boston',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    name: 'Main Boston Campus',
    code: 'BOS-MAIN',
    status: 'active',
    address: '100 University Avenue, Boston, MA 02115',
    timezone: 'America/New_York',
    phone: '+1 (555) 019-2831',
    email: 'boston.campus@educore.edu',
    administratorName: 'Dr. Sarah Jenkins',
    studentCount: 920,
    facultyCount: 110,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'cmp_tech',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    name: 'Innovation & Technology Park',
    code: 'BOS-TECH',
    status: 'active',
    address: '450 Technology Square, Cambridge, MA 02139',
    timezone: 'America/New_York',
    phone: '+1 (555) 019-8800',
    email: 'techpark@educore.edu',
    administratorName: 'Prof. Michael Chang',
    studentCount: 500,
    facultyCount: 65,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'cmp_riyadh',
    organizationId: 'org_alnoor',
    organizationName: 'Al-Noor International Academy',
    name: 'Riyadh Primary & Secondary Campus',
    code: 'RUH-01',
    status: 'active',
    address: 'Olaya District, Riyadh 12211, Saudi Arabia',
    timezone: 'Asia/Riyadh',
    phone: '+966 11 482 9901',
    email: 'riyadh@alnoor.edu.sa',
    administratorName: 'Eng. Tariq Al-Mansoor',
    studentCount: 890,
    facultyCount: 95,
    createdAt: '2024-06-01T08:00:00Z',
  },
];

export const SEED_DEPARTMENTS: Department[] = [
  { id: 'dept_cs', organizationId: 'org_main', campusId: 'cmp_boston', campusName: 'Main Boston Campus', name: 'Computer Science & Software Engineering', code: 'CSSE', headName: 'Dr. Alan Turing', facultyCount: 42, status: 'active' },
  { id: 'dept_bus', organizationId: 'org_main', campusId: 'cmp_boston', campusName: 'Main Boston Campus', name: 'School of Business & Economics', code: 'BUS', headName: 'Dr. Elena Rostova', facultyCount: 38, status: 'active' },
  { id: 'dept_med', organizationId: 'org_main', campusId: 'cmp_tech', campusName: 'Innovation & Technology Park', name: 'Biomedical Engineering & Health Sciences', code: 'BME', headName: 'Dr. Robert Vance', facultyCount: 28, status: 'active' },
];

export const SEED_ACADEMIC_UNITS: AcademicUnit[] = [
  { id: 'unit_eng', organizationId: 'org_main', name: 'Faculty of Engineering & Technology', code: 'FET', type: 'faculty', deanName: 'Prof. Katherine Johnson', programCount: 12 },
  { id: 'unit_bus', organizationId: 'org_main', name: 'College of Business Administration', code: 'CBA', type: 'college', deanName: 'Prof. Marcus Brody', programCount: 8 },
];

export const SEED_USERS: AdminUser[] = [
  {
    id: 'usr_platform_admin',
    username: 'superadmin',
    email: 'admin@educore.edu',
    fullName: 'Alexander Wright',
    status: 'active',
    title: 'Chief Technology Officer & Platform Administrator',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    campusId: 'cmp_boston',
    campusName: 'Main Boston Campus',
    mfaEnabled: true,
    mfaMethod: 'app',
    roles: ['role_platform_admin'],
    groups: ['grp_superadmins'],
    lastLoginAt: '2026-09-12T18:00:00Z',
    lastLoginIp: '192.168.1.100',
    failedLoginAttempts: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-09-12T18:00:00Z',
  },
  {
    id: 'usr_org_admin',
    username: 'orgadmin_riyadh',
    email: 'tariq@alnoor.edu.sa',
    fullName: 'Eng. Tariq Al-Mansoor',
    status: 'active',
    title: 'Executive Managing Director',
    organizationId: 'org_alnoor',
    organizationName: 'Al-Noor International Academy',
    campusId: 'cmp_riyadh',
    campusName: 'Riyadh Primary & Secondary Campus',
    mfaEnabled: true,
    mfaMethod: 'app',
    roles: ['role_org_admin'],
    groups: ['grp_org_admins'],
    lastLoginAt: '2026-09-12T14:20:00Z',
    lastLoginIp: '212.138.45.10',
    failedLoginAttempts: 0,
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2026-09-10T09:15:00Z',
  },
  {
    id: 'usr_campus_admin',
    username: 'sjenkins',
    email: 'sjenkins@educore.edu',
    fullName: 'Dr. Sarah Jenkins',
    status: 'active',
    title: 'Dean of Academic Operations',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    campusId: 'cmp_boston',
    campusName: 'Main Boston Campus',
    mfaEnabled: true,
    mfaMethod: 'sms',
    roles: ['role_campus_admin'],
    groups: ['grp_campus_admins'],
    lastLoginAt: '2026-09-11T16:45:00Z',
    lastLoginIp: '72.14.201.2',
    failedLoginAttempts: 0,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'usr_auditor',
    username: 'auditor_compliance',
    email: 'compliance@educore.edu',
    fullName: 'Victoria Sterling',
    status: 'active',
    title: 'Lead System Auditor & Data Protection Officer',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    mfaEnabled: true,
    mfaMethod: 'app',
    roles: ['role_auditor'],
    groups: ['grp_auditors'],
    lastLoginAt: '2026-09-12T10:10:00Z',
    lastLoginIp: '18.220.12.50',
    failedLoginAttempts: 0,
    createdAt: '2024-05-15T08:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z',
  },
  {
    id: 'usr_support_admin',
    username: 'tech_support',
    email: 'support.lead@educore.edu',
    fullName: 'David Miller',
    status: 'active',
    title: 'Tier-3 Technical Support Engineer',
    organizationId: 'org_main',
    organizationName: 'EduCore Global University',
    mfaEnabled: false,
    roles: ['role_support_admin'],
    groups: ['grp_support'],
    lastLoginAt: '2026-09-12T17:30:00Z',
    lastLoginIp: '192.168.1.105',
    failedLoginAttempts: 0,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2026-09-12T17:30:00Z',
  },
];

export const SEED_GROUPS: UserGroup[] = [
  { id: 'grp_superadmins', name: 'Global Platform Administrators', code: 'GLOBAL_ADMINS', description: 'Unrestricted enterprise administrative access across all tenants and campuses', roles: ['role_platform_admin'], memberCount: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'grp_org_admins', name: 'Organization Executive Directors', code: 'ORG_DIRECTORS', description: 'Tenant-scoped administrative access over organization resources', roles: ['role_org_admin'], memberCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'grp_campus_admins', name: 'Campus Deans & Managers', code: 'CAMPUS_DEANS', description: 'Campus-level administrative access over academic sections and rosters', roles: ['role_campus_admin'], memberCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'grp_auditors', name: 'Security & Compliance Auditors', code: 'AUDITORS', description: 'Read-only inspection access for security logs, audit events, and compliance reports', roles: ['role_auditor'], memberCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const SEED_ROLES: Role[] = [
  { id: 'role_platform_admin', name: 'Platform Super Administrator', code: 'PLATFORM_SUPER_ADMIN', description: 'Full read/write/manage permissions across all EduCore platform tenants', scope: 'platform', isSystemRole: true, permissions: ['users.read', 'users.create', 'users.update', 'users.delete', 'users.impersonate', 'roles.read', 'roles.manage', 'policies.manage', 'orgs.read', 'orgs.manage', 'academic.read', 'academic.manage', 'settings.read', 'settings.manage', 'featureflags.manage', 'workflow.manage', 'notifications.manage', 'integrations.manage', 'developer.manage', 'audit.read', 'operations.manage'], userCount: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role_org_admin', name: 'Organization Administrator', code: 'ORG_ADMIN', description: 'Full administrative access within assigned organization and campuses', scope: 'organization', isSystemRole: true, permissions: ['users.read', 'users.create', 'users.update', 'users.delete', 'roles.read', 'roles.manage', 'orgs.read', 'orgs.manage', 'academic.read', 'academic.manage', 'settings.read', 'settings.manage', 'workflow.manage', 'notifications.manage', 'integrations.manage', 'audit.read', 'operations.manage'], userCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role_campus_admin', name: 'Campus Administrator', code: 'CAMPUS_ADMIN', description: 'Administrative operations restricted to a specific campus', scope: 'campus', isSystemRole: true, permissions: ['users.read', 'users.update', 'roles.read', 'orgs.read', 'academic.read', 'settings.read', 'audit.read', 'operations.manage'], userCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role_auditor', name: 'Compliance Auditor', code: 'COMPLIANCE_AUDITOR', description: 'Read-only access to audit logs, security events, and compliance exports', scope: 'platform', isSystemRole: true, permissions: ['users.read', 'roles.read', 'orgs.read', 'academic.read', 'settings.read', 'audit.read'], userCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role_support_admin', name: 'Technical Support Administrator', code: 'SUPPORT_ADMIN', description: 'User diagnostic and impersonation access for technical troubleshooting', scope: 'platform', isSystemRole: false, permissions: ['users.read', 'users.update', 'users.impersonate', 'roles.read', 'orgs.read', 'academic.read', 'settings.read', 'audit.read'], userCount: 1, createdAt: '2025-01-10T09:00:00Z', updatedAt: '2025-01-10T09:00:00Z' },
];

export const SEED_ACCESS_POLICIES: AccessPolicy[] = [
  { id: 'pol_mfa_enforce', name: 'Enforce MFA for Administrators', description: 'Mandates multi-factor authentication for all users holding administrative roles', effect: 'allow', actions: ['*'], resources: ['admin/*'], conditions: { mfaRequired: true }, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'pol_ip_whitelist', name: 'Corporate IP Subnet Restriction', description: 'Restricts sensitive configuration changes to approved corporate IP ranges', effect: 'allow', actions: ['settings.manage', 'developer.manage'], resources: ['system/settings', 'developer/*'], conditions: { allowedSubnets: ['192.168.1.0/24', '10.0.0.0/16'] }, status: 'active', createdAt: '2024-03-15T00:00:00Z' },
];

export const SEED_SESSIONS: UserSession[] = [
  { id: 'sess_01', userId: 'usr_platform_admin', userName: 'Alexander Wright', userEmail: 'admin@educore.edu', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0', location: 'Boston, MA, USA', device: 'MacBook Pro', startedAt: '2026-09-12T17:00:00Z', lastActiveAt: '2026-09-12T18:25:00Z', expiresAt: '2026-09-12T21:00:00Z', isCurrent: true },
  { id: 'sess_02', userId: 'usr_org_admin', userName: 'Eng. Tariq Al-Mansoor', userEmail: 'tariq@alnoor.edu.sa', ipAddress: '212.138.45.10', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0', location: 'Riyadh, Saudi Arabia', device: 'Windows Desktop', startedAt: '2026-09-12T14:20:00Z', lastActiveAt: '2026-09-12T16:10:00Z', expiresAt: '2026-09-12T18:20:00Z' },
];

export const SEED_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay_2026_2027', organizationId: 'org_main', code: 'AY-2026-2027', title: 'Academic Year 2026 - 2027', startDate: '2026-09-01', endDate: '2027-06-30', status: 'active', isCurrent: true },
  { id: 'ay_2025_2026', organizationId: 'org_main', code: 'AY-2025-2026', title: 'Academic Year 2025 - 2026', startDate: '2025-09-01', endDate: '2026-06-30', status: 'closed', isCurrent: false },
];

export const SEED_ACADEMIC_TERMS: AcademicTerm[] = [
  { id: 'term_fall2026', academicYearId: 'ay_2026_2027', academicYearCode: 'AY-2026-2027', name: 'Fall Semester 2026', code: '2026-FALL', startDate: '2026-09-01', endDate: '2026-12-20', status: 'active', isRegistrationOpen: true },
  { id: 'term_spring2027', academicYearId: 'ay_2026_2027', academicYearCode: 'AY-2026-2027', name: 'Spring Semester 2027', code: '2027-SPRING', startDate: '2027-01-15', endDate: '2027-05-30', status: 'draft', isRegistrationOpen: false },
];

export const SEED_PROGRAMS: AcademicProgram[] = [
  { id: 'prog_bs_cs', code: 'BS-CS', title: 'Bachelor of Science in Computer Science', degreeType: 'bachelor', departmentName: 'Computer Science & Software Engineering', totalCredits: 128, durationYears: 4, status: 'active' },
  { id: 'prog_mba', code: 'MBA', title: 'Master of Business Administration', degreeType: 'master', departmentName: 'School of Business & Economics', totalCredits: 48, durationYears: 2, status: 'active' },
];

export const SEED_GRADES: AcademicGrade[] = [
  { id: 'gr_g10', code: 'GRADE-10', title: 'Grade 10 High School', level: 10, stage: 'high' },
  { id: 'gr_g11', code: 'GRADE-11', title: 'Grade 11 High School', level: 11, stage: 'high' },
  { id: 'gr_ug1', code: 'UG-1', title: 'Undergraduate Freshman (Year 1)', level: 13, stage: 'undergraduate' },
];

export const SEED_SUBJECTS: AcademicSubject[] = [
  { id: 'sub_cs101', code: 'CS101', name: 'Introduction to Algorithms & Data Structures', creditHours: 4, departmentName: 'Computer Science & Software Engineering', type: 'core' },
  { id: 'sub_mgt201', code: 'MGT201', name: 'Organizational Behavior & Leadership', creditHours: 3, departmentName: 'School of Business & Economics', type: 'core' },
];

export const SEED_SECTIONS: ClassSection[] = [
  { id: 'sec_cs101_01', code: 'CS101-SEC01', subjectName: 'CS101: Data Structures', termName: 'Fall Semester 2026', instructorName: 'Prof. Katherine Johnson', roomNumber: 'Turing Hall 302', maxCapacity: 40, enrolledCount: 38, status: 'active' },
  { id: 'sec_mgt201_01', code: 'MGT201-SEC01', subjectName: 'MGT201: Leadership', termName: 'Fall Semester 2026', instructorName: 'Dr. Elena Rostova', roomNumber: 'Brody Auditorium 101', maxCapacity: 60, enrolledCount: 60, status: 'full' },
];

export const SEED_SYSTEM_SETTINGS: SystemSetting[] = [
  { id: 'set_inst_name', key: 'system.institution.name', value: 'EduCore Global University', type: 'string', scope: 'platform', category: 'general', description: 'Official institution display name across all portals', defaultValue: 'EduCore University', secret: false, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-09-01T10:00:00Z' },
  { id: 'set_default_locale', key: 'system.localization.default_locale', value: 'en-US', type: 'enum', scope: 'platform', category: 'localization', description: 'System-wide fallback language and locale format', defaultValue: 'en-US', secret: false, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-08-15T12:00:00Z' },
  { id: 'set_supported_locales', key: 'system.localization.supported_locales', value: ['en-US', 'ar-SA', 'es-ES', 'fr-FR'], type: 'json', scope: 'platform', category: 'localization', description: 'List of active locales supported by UI translation engines', defaultValue: ['en-US'], secret: false, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-08-15T12:00:00Z' },
  { id: 'set_session_timeout', key: 'system.security.session_timeout_minutes', value: 30, type: 'integer', scope: 'platform', category: 'security', description: 'Inactivity session timeout in minutes before automatic logoff', defaultValue: 30, secret: false, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-09-10T14:00:00Z' },
  { id: 'set_smtp_host', key: 'system.email.smtp_host', value: 'smtp.sendgrid.net', type: 'url', scope: 'platform', category: 'email', description: 'SMTP host server address for transactional communications', defaultValue: 'localhost', secret: false, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-07-20T11:00:00Z' },
  { id: 'set_smtp_key', key: 'system.email.smtp_api_key', value: 'SG.eX9a8B7c6D5e4F3g2H1i0J.SecretKeyStringHidden', type: 'secret', scope: 'platform', category: 'email', description: 'Secret authentication key for transactional email provider', defaultValue: '', secret: true, mutable: true, updatedBy: 'admin@educore.edu', updatedAt: '2026-07-20T11:00:00Z' },
];

export const SEED_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff_ai_summaries', key: 'enable_ai_student_summaries', name: 'Gemini AI Student Performance Insights', description: 'Enables automated AI summarization of student academic trends in faculty dashboard', enabled: true, rolloutPercentage: 100, targetScopes: ['platform', 'organization'], environment: 'all', tags: ['ai', 'sis', 'beta'], updatedBy: 'admin@educore.edu', updatedAt: '2026-09-10T08:30:00Z' },
  { id: 'ff_online_payments', key: 'enable_stripe_online_tuition', name: 'Stripe Gateway Tuition Payments', description: 'Allows parents and students to pay tuition invoices via credit card / Apple Pay', enabled: true, rolloutPercentage: 100, targetScopes: ['organization'], environment: 'production', tags: ['finance', 'payments'], updatedBy: 'tariq@alnoor.edu.sa', updatedAt: '2026-08-01T10:00:00Z' },
  { id: 'ff_new_gradebook', key: 'enable_v2_gradebook_matrix', name: 'Interactive Gradebook v2 Matrix', description: 'Enables real-time spreadsheet-like inline grade editing for faculty', enabled: false, rolloutPercentage: 25, targetScopes: ['campus'], environment: 'staging', tags: ['academics', 'v2'], updatedBy: 'admin@educore.edu', updatedAt: '2026-09-05T15:00:00Z' },
];

export const SEED_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_student_admission',
    code: 'WF-SIS-ADM-01',
    name: 'Student Admission & Enrollment Approval Workflow',
    module: 'sis',
    description: 'Multi-stage approval process for incoming student applications from registration to campus assignment',
    status: 'active',
    version: 2,
    states: [
      { id: 'st_submitted', name: 'Application Submitted', type: 'initial' },
      { id: 'st_review', name: 'Document Review', type: 'intermediate' },
      { id: 'st_interview', name: 'Interview Scheduled', type: 'intermediate' },
      { id: 'st_approved', name: 'Admission Approved', type: 'terminal' },
      { id: 'st_rejected', name: 'Application Rejected', type: 'terminal' },
    ],
    transitions: [
      { from: 'st_submitted', to: 'st_review', action: 'Verify Documents', requiredRole: 'CAMPUS_ADMIN' },
      { from: 'st_review', to: 'st_interview', action: 'Pass Document Audit', requiredRole: 'CAMPUS_ADMIN' },
      { from: 'st_interview', to: 'st_approved', action: 'Approve Admission', requiredRole: 'ORG_ADMIN' },
      { from: 'st_interview', to: 'st_rejected', action: 'Reject Application', requiredRole: 'ORG_ADMIN' },
    ],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'wf_grade_override',
    code: 'WF-ACAD-GRD-02',
    name: 'Final Grade Correction & Appeal Workflow',
    module: 'academics',
    description: 'Requires department head and dean signature before modifying posted transcripts',
    status: 'active',
    version: 1,
    states: [
      { id: 'st_requested', name: 'Correction Requested', type: 'initial' },
      { id: 'st_dept_review', name: 'Department Head Review', type: 'intermediate' },
      { id: 'st_completed', name: 'Grade Updated on Transcript', type: 'terminal' },
    ],
    transitions: [
      { from: 'st_requested', to: 'st_dept_review', action: 'Submit Evidence', requiredRole: 'CAMPUS_ADMIN' },
      { from: 'st_dept_review', to: 'st_completed', action: 'Sign Grade Change Order', requiredRole: 'ORG_ADMIN' },
    ],
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z',
  },
];

export const SEED_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 'ntf_welcome_user', code: 'USER_WELCOME_EMAIL', name: 'New User Welcome & Onboarding', channel: 'email', subjectTemplate: 'Welcome to {{institutionName}} EduCore Portal', bodyTemplate: 'Dear {{fullName}},\n\nYour user account has been successfully created. Click below to activate your password:\n\n{{activationUrl}}', version: 1, status: 'active', updatedAt: '2026-08-01T10:00:00Z' },
  { id: 'ntf_invoice_issued', code: 'FINANCE_INVOICE_ISSUED', name: 'Tuition Fee Invoice Notification', channel: 'email', subjectTemplate: 'Tuition Invoice {{invoiceNumber}} Issued for {{studentName}}', bodyTemplate: 'Dear Guardian,\n\nInvoice {{invoiceNumber}} for amount {{amount}} {{currency}} is due on {{dueDate}}.', version: 2, status: 'active', updatedAt: '2026-08-20T11:30:00Z' },
  { id: 'ntf_mfa_sms', code: 'SECURITY_MFA_SMS', name: 'MFA Security Verification Code', channel: 'sms', subjectTemplate: '', bodyTemplate: 'Your EduCore verification code is: {{code}}. Do not share this with anyone. Valid for 5 minutes.', version: 1, status: 'active', updatedAt: '2026-01-15T08:00:00Z' },
];

export const SEED_INTEGRATIONS: Integration[] = [
  { id: 'int_google_workspace', name: 'Google Workspace & Identity SSO', provider: 'Google Cloud Platform', category: 'sso', type: 'oidc', status: 'connected', lastSyncAt: '2026-09-12T18:00:00Z', config: { clientId: '728192039-educore.apps.googleusercontent.com', domain: 'educore.edu', enforceDomainMatch: true } },
  { id: 'int_stripe', name: 'Stripe Gateway Billing Engine', provider: 'Stripe Inc.', category: 'payment', type: 'rest', status: 'connected', lastSyncAt: '2026-09-12T17:45:00Z', config: { publishableKey: 'pk_live_51M3a8b...Hidden', webhookEnabled: true } },
  { id: 'int_canvas_lms', name: 'Canvas LMS Course Roster Sync', provider: 'Instructure Canvas', category: 'lms', type: 'rest', status: 'connected', lastSyncAt: '2026-09-12T16:00:00Z', config: { lmsUrl: 'https://canvas.educore.edu', autoSyncFrequencyHours: 6 } },
  { id: 'int_banner_sftp', name: 'Legacy ERP SFTP Batch Importer', provider: 'Ellucian Banner', category: 'sftp', type: 'sftp', status: 'error', errorMessage: 'Connection timed out on sftp.legacy.educore.edu:22', lastSyncAt: '2026-09-11T02:00:00Z', config: { host: 'sftp.legacy.educore.edu', port: 22, username: 'sftp_educore' } },
];

export const SEED_API_CLIENTS: ApiClient[] = [
  { id: 'cli_mobile_app', clientId: 'app_mobile_ios_android_v3', name: 'EduCore Mobile App Client (iOS / Android)', description: 'OAuth2 client for mobile student and faculty application', scopes: ['users.read', 'academic.read', 'notifications.read'], status: 'active', maskedSecret: 'sec_live_9a87***masked', lastUsedAt: '2026-09-12T18:20:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'cli_biometric_gate', clientId: 'iot_campus_turnstiles', name: 'Campus Gate Biometric Attendance IoT Agent', description: 'M2M API Client for automated campus turnstile entry logging', scopes: ['students.read', 'attendance.create'], status: 'active', maskedSecret: 'sec_live_12b4***masked', lastUsedAt: '2026-09-12T18:24:00Z', expiresAt: '2028-01-01T00:00:00Z', createdAt: '2025-06-01T00:00:00Z' },
];

export const SEED_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec_ev_01', timestamp: '2026-09-12T16:30:00Z', eventType: 'FAILED_LOGIN', severity: 'medium', actorEmail: 'unknown_admin@external.org', ipAddress: '185.220.101.5', location: 'Frankfurt, Germany', details: '3 consecutive failed password attempts for user superadmin', status: 'open' },
  { id: 'sec_ev_02', timestamp: '2026-09-12T12:15:00Z', eventType: 'PRIVILEGE_ELEVATION', severity: 'high', actorEmail: 'admin@educore.edu', ipAddress: '192.168.1.100', location: 'Boston, MA, USA', details: 'Assigned PLATFORM_SUPER_ADMIN role to user usr_platform_admin', status: 'resolved' },
  { id: 'sec_ev_03', timestamp: '2026-09-11T20:40:00Z', eventType: 'UNAUTHORIZED_ACCESS', severity: 'low', actorEmail: 'guest_user@educore.edu', ipAddress: '72.14.201.2', location: 'New York, NY, USA', details: 'Attempted to invoke forbidden endpoint /api/v1/admin/audit/logs', status: 'resolved' },
];

export const SEED_JOBS: AdminJob[] = [
  { id: 'job_batch_enroll', name: 'Fall 2026 Mass Course Registration Sync', type: 'ENROLLMENT_BATCH', status: 'completed', progress: 100, initiatedBy: 'admin@educore.edu', startedAt: '2026-09-12T02:00:00Z', completedAt: '2026-09-12T02:05:12Z', durationMs: 312000 },
  { id: 'job_tuition_calc', name: 'Semester Tuition Fee Auto-Generation', type: 'FINANCE_CALCULATION', status: 'completed', progress: 100, initiatedBy: 'tariq@alnoor.edu.sa', startedAt: '2026-09-11T18:00:00Z', completedAt: '2026-09-11T18:02:45Z', durationMs: 165000 },
  { id: 'job_sftp_import', name: 'Legacy Banner Student Roster Importer', type: 'SFTP_IMPORT', status: 'failed', progress: 42, error: 'Connection reset by peer during chunk 42 of 100', initiatedBy: 'system_scheduler', startedAt: '2026-09-11T02:00:00Z', completedAt: '2026-09-11T02:01:30Z', durationMs: 90000 },
];

export const SEED_SCHEDULED_TASKS: ScheduledTask[] = [
  { id: 'task_nightly_backup', name: 'Database Snapshot & Encryption Backup', cronExpression: '0 2 * * *', description: 'Performs encrypted PostgreSQL snapshot and syncs to cold cloud storage', status: 'enabled', lastRunAt: '2026-09-12T02:00:00Z', lastRunResult: 'success', nextRunAt: '2026-09-13T02:00:00Z' },
  { id: 'task_audit_archive', name: 'Audit Log Retention Archival (>90 days)', cronExpression: '0 3 1 * *', description: 'Compresses and exports audit log records older than 90 days to immutable storage', status: 'enabled', lastRunAt: '2026-09-01T03:00:00Z', lastRunResult: 'success', nextRunAt: '2026-10-01T03:00:00Z' },
];

export const SEED_HEALTH_COMPONENTS: SystemHealthComponent[] = [
  { id: 'hc_api', name: 'Core REST API Gateway', category: 'api', status: 'healthy', latencyMs: 24, lastCheckedAt: '2026-09-12T18:25:00Z' },
  { id: 'hc_db', name: 'PostgreSQL Primary Cluster (Multi-AZ)', category: 'database', status: 'healthy', latencyMs: 12, lastCheckedAt: '2026-09-12T18:25:00Z' },
  { id: 'hc_redis', name: 'Redis Cache & Session Store', category: 'cache', status: 'healthy', latencyMs: 3, lastCheckedAt: '2026-09-12T18:25:00Z' },
  { id: 'hc_queue', name: 'RabbitMQ Background Job Queue', category: 'queue', status: 'healthy', latencyMs: 18, lastCheckedAt: '2026-09-12T18:25:00Z' },
  { id: 'hc_sftp', name: 'Ellucian Banner SFTP Connector', category: 'integration', status: 'degraded', latencyMs: 840, message: 'High network latency & transient socket timeouts', lastCheckedAt: '2026-09-12T18:25:00Z' },
];
