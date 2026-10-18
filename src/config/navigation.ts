import {
  Dashboard,
  Enterprise,
  UserAdmin,
  Security,
  Settings,
  Flag,
  Task,
  Tools,
  Group,
  Renew,
  DataShare,
  Education,
  Course,
  Calendar,
  Catalog,
  UserProfile,
  Network_3,
  CheckmarkOutline,
  ChartBar,
  UserFollow,
  Flow,
  Document,
  Download,
  Edit,
  Wallet,
  Partnership,
  Chat,
  Delivery,
  Home,
  Activity,
  Warning,
  Archive,
  Terminal
} from '@carbon/icons-react';
import type { UserRole } from '../auth/auth.types';

export type { UserRole };


export interface NavItemConfig {
  id: string;
  kind?: 'item' | 'divider' | 'header';
  label?: string;
  path?: string;
  icon: React.ComponentType<any>;
  permission?: string;
  role?: string;
  roles?: UserRole[];
  defaultExpanded?: boolean;
  children?: Array<{
    id: string;
    label: string;
    path: string;
    permission?: string;
    role?: string;
    roles?: UserRole[];
  }>;
}

export const ADMIN_NAVIGATION: NavItemConfig[] = [
  {
    id: 'nav_dashboard',
    label: 'Dashboard Overview',
    path: '/admin',
    icon: Dashboard,
    roles: ['admin'],
  },
  {
    id: 'nav_sis',
    label: 'Student Information System',
    path: '/sis/dashboard',
    icon: Group,
    roles: ['admin'],
    defaultExpanded: false,
    children: [
      { id: 'nav_sis_dashboard', label: 'SIS Portal Overview', path: '/sis/dashboard', roles: ['admin'] },
      { id: 'nav_sis_directory', label: 'Student Directory', path: '/sis/directory', roles: ['admin'] },
      { id: 'nav_sis_profile', label: 'Student 360° Profile', path: '/sis/profile', roles: ['admin'] },
      { id: 'nav_sis_admissions', label: 'Admissions & Enrollment', path: '/sis/admissions', roles: ['admin'] },
      { id: 'nav_sis_academics', label: 'Academics & Gradebook', path: '/sis/academics', roles: ['admin'] },
      { id: 'nav_sis_finance', label: 'Finance & Billing Hub', path: '/sis/finance', roles: ['admin'] },
      { id: 'nav_sis_audit', label: 'SIS Security & Audit', path: '/sis/admin-console', roles: ['admin'] },
    ],
  },
  { id: 'div_1', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_1', kind: 'header', label: 'Core Administration', path: '', icon: Dashboard },
  {
    id: 'nav_org',
    label: 'Organization & Campuses',
    path: '/admin/organization/organizations',
    icon: Enterprise,
    permission: 'organization.read',
    roles: ['admin'],
    children: [
      { id: 'nav_org_list', label: 'Organizations', path: '/admin/organization/organizations', roles: ['admin'] },
      { id: 'nav_campuses', label: 'Campuses', path: '/admin/organization/campuses', roles: ['admin'] },
      { id: 'nav_departments', label: 'Departments', path: '/admin/organization/departments', roles: ['admin'] },
      { id: 'nav_units', label: 'Academic Units', path: '/admin/organization/academic-units', roles: ['admin'] },
    ],
  },
  {
    id: 'nav_identity',
    label: 'Identity & Accounts',
    path: '/admin/identity/users',
    icon: UserAdmin,
    permission: 'users.read',
    roles: ['admin'],
    children: [
      { id: 'nav_users', label: 'User Directory', path: '/admin/identity/users', roles: ['admin'] },
      { id: 'nav_groups', label: 'User Groups', path: '/admin/identity/groups', roles: ['admin'] },
    ],
  },
  {
    id: 'nav_access',
    label: 'Access Control & RBAC',
    path: '/admin/access/roles',
    icon: Security,
    permission: 'roles.read',
    roles: ['admin'],
    children: [
      { id: 'nav_roles', label: 'Roles Matrix', path: '/admin/access/roles', roles: ['admin'] },
      { id: 'nav_policies', label: 'Access Policies', path: '/admin/access/policies', roles: ['admin'] },
      { id: 'nav_sessions', label: 'Active Sessions', path: '/admin/access/sessions', roles: ['admin'] },
    ],
  },
  { id: 'div_2', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_2', kind: 'header', label: 'System & Compliance', path: '', icon: Dashboard },
  {
    id: 'nav_system',
    label: 'System & Configuration',
    path: '/admin/system/general',
    icon: Settings,
    permission: 'settings.read',
    roles: ['admin'],
  },
  {
    id: 'nav_feature_flags',
    label: 'Feature Management',
    path: '/admin/feature-management/flags',
    icon: Flag,
    permission: 'feature_flags.manage',
    roles: ['admin'],
  },
  {
    id: 'nav_audit',
    label: 'Audit & Compliance',
    path: '/admin/audit/logs',
    icon: Group,
    permission: 'audit.read',
    roles: ['admin'],
  },
  {
    id: 'nav_platform',
    label: 'Platform Services',
    path: '/admin/platform/notifications',
    icon: DataShare,
    permission: 'settings.read',
    roles: ['admin'],
    children: [
      { id: 'nav_notifications', label: 'Notifications Engine', path: '/admin/platform/notifications', roles: ['admin'] },
      { id: 'nav_workflows', label: 'Workflows & Approvals', path: '/admin/platform/workflows', roles: ['admin'] },
    ],
  },
  {
    id: 'nav_operations',
    label: 'Task Operations',
    path: '/admin/operations/jobs',
    icon: Task,
    permission: 'jobs.manage',
    roles: ['admin'],
  },
  { id: 'div_3', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_3', kind: 'header', label: 'Advanced', path: '', icon: Dashboard },
  {
    id: 'nav_console',
    label: 'Console Settings',
    path: '/admin/administration/console-settings',
    icon: Tools,
    roles: ['admin'],
  },
];

export const STUDENT_NAVIGATION: NavItemConfig[] = [
  {
    id: 'student_dashboard',
    label: 'Dashboard',
    path: '/student',
    icon: Education,
    roles: ['student'],
  },
  { id: 'div_student_1', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_student_1', kind: 'header', label: 'Academics', path: '', icon: Dashboard },
  {
    id: 'student_courses',
    label: 'My Courses',
    path: '/student/courses',
    icon: Course,
    roles: ['student'],
  },
  {
    id: 'student_schedule',
    label: 'Schedule',
    path: '/student/schedule',
    icon: Calendar,
    roles: ['student'],
  },
  {
    id: 'student_records',
    label: 'Academic Records',
    path: '/student/records',
    icon: Catalog,
    roles: ['student'],
  },
  { id: 'div_student_2', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_student_2', kind: 'header', label: 'Account', path: '', icon: Dashboard },
  {
    id: 'student_profile',
    label: 'Profile',
    path: '/student/profile',
    icon: UserProfile,
    roles: ['student'],
  },
];

export const INSTRUCTOR_NAVIGATION: NavItemConfig[] = [
  {
    id: 'instructor_dashboard',
    label: 'Dashboard',
    path: '/instructor',
    icon: Network_3,
    roles: ['instructor'],
  },
  { id: 'div_inst_1', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_inst_1', kind: 'header', label: 'Teaching', path: '', icon: Dashboard },
  {
    id: 'instructor_classes',
    label: 'My Classes',
    path: '/instructor/classes',
    icon: Catalog,
    roles: ['instructor'],
  },
  {
    id: 'instructor_grading',
    label: 'Grading',
    path: '/instructor/grading',
    icon: CheckmarkOutline,
    roles: ['instructor'],
  },
  {
    id: 'instructor_schedule',
    label: 'Schedule',
    path: '/instructor/schedule',
    icon: Calendar,
    roles: ['instructor'],
  },
  { id: 'div_inst_2', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_inst_2', kind: 'header', label: 'Account', path: '', icon: Dashboard },
  {
    id: 'instructor_profile',
    label: 'Profile',
    path: '/instructor/profile',
    icon: UserProfile,
    roles: ['instructor'],
  },
];

export const GUARDIAN_NAVIGATION: NavItemConfig[] = [
  {
    id: 'guardian_dashboard',
    label: 'Family Overview',
    path: '/guardian',
    icon: Group,
    roles: ['guardian'],
  },
  { id: 'div_guard_1', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_guard_1', kind: 'header', label: 'Children & Academics', path: '', icon: Dashboard },
  {
    id: 'guardian_children',
    label: 'Children & Attendance',
    path: '/guardian/children',
    icon: Education,
    roles: ['guardian'],
  },
  { id: 'div_guard_2', kind: 'divider', label: '', path: '', icon: Dashboard },
  { id: 'head_guard_2', kind: 'header', label: 'Finance & School', path: '', icon: Dashboard },
  {
    id: 'guardian_tuition',
    label: 'Tuition & Invoices',
    path: '/guardian/tuition',
    icon: Catalog,
    roles: ['guardian'],
  },
  {
    id: 'guardian_communications',
    label: 'School Communications',
    path: '/guardian/communications',
    icon: DataShare,
    roles: ['guardian'],
  },
];

export const SIS_NAVIGATION: NavItemConfig[] = [
  { id: 'head_sis_core', kind: 'header', label: 'Student Registry & 360', path: '', icon: ChartBar },
  {
    id: 'dashboard',
    label: 'SIS Dashboard',
    path: '/sis/dashboard',
    icon: ChartBar,
    roles: ['sis', 'admin'],
  },
  {
    id: 'directory',
    label: 'Student Directory',
    path: '/sis/directory',
    icon: Group,
    roles: ['sis', 'admin'],
  },
  {
    id: 'profile',
    label: 'Student 360° Profile',
    path: '/sis/profile',
    icon: UserProfile,
    roles: ['sis', 'admin'],
  },
  {
    id: 'registration',
    label: 'New Student Registration',
    path: '/sis/registration',
    icon: UserFollow,
    roles: ['sis', 'admin'],
  },
  { id: 'div_sis_1', kind: 'divider', label: '', path: '', icon: ChartBar },
  { id: 'head_sis_lifecycle', kind: 'header', label: 'Admissions & Lifecycle', path: '', icon: ChartBar },
  {
    id: 'sis_admissions_menu',
    label: 'Admissions & Enrollment',
    path: '/sis/admissions',
    icon: UserFollow,
    roles: ['sis', 'admin'],
    defaultExpanded: true,
    children: [
      { id: 'admissions', label: 'Admissions Office', path: '/sis/admissions' },
      { id: 'enrollment', label: 'Term Enrollment', path: '/sis/enrollment' },
      { id: 'placement', label: 'Academic Placement', path: '/sis/placement' },
      { id: 'guardians', label: 'Guardians & Family Hub', path: '/sis/guardians' },
    ],
  },
  {
    id: 'sis_mobility_menu',
    label: 'Lifecycle, Transfers & Exit',
    path: '/sis/lifecycle',
    icon: Flow,
    roles: ['sis', 'admin'],
    children: [
      { id: 'lifecycle', label: 'Student Lifecycle & Status', path: '/sis/lifecycle' },
      { id: 'transfers', label: 'Student Transfers', path: '/sis/transfers' },
      { id: 'withdrawal', label: 'Student Withdrawal', path: '/sis/withdrawal' },
      { id: 'graduation', label: 'Graduation & Clearance', path: '/sis/graduation' },
    ],
  },
  { id: 'div_sis_2', kind: 'divider', label: '', path: '', icon: ChartBar },
  { id: 'head_sis_academics', kind: 'header', label: 'Academics & Attendance', path: '', icon: ChartBar },
  {
    id: 'sis_academics_menu',
    label: 'Academics & Assessments',
    path: '/sis/academics',
    icon: Education,
    roles: ['sis', 'admin'],
    defaultExpanded: true,
    children: [
      { id: 'academics', label: 'Academics & Gradebook', path: '/sis/academics' },
      { id: 'exams', label: 'Examinations & Control', path: '/sis/exams' },
      { id: 'timetable', label: 'Weekly Timetable Matrix', path: '/sis/timetable' },
    ],
  },
  {
    id: 'sis_attendance_menu',
    label: 'Attendance & Behavior',
    path: '/sis/attendance',
    icon: Calendar,
    roles: ['sis', 'admin'],
    children: [
      { id: 'attendance', label: 'Attendance & Truancy', path: '/sis/attendance' },
      { id: 'discipline', label: 'Discipline & Behavior', path: '/sis/discipline' },
    ],
  },
  { id: 'div_sis_3', kind: 'divider', label: '', path: '', icon: ChartBar },
  { id: 'head_sis_services', kind: 'header', label: 'Campus Services & Finance', path: '', icon: ChartBar },
  {
    id: 'sis_finance_hr_menu',
    label: 'Finance, HR & Comms',
    path: '/sis/finance',
    icon: Wallet,
    roles: ['sis', 'admin'],
    children: [
      { id: 'finance', label: 'Finance & Billing Hub', path: '/sis/finance' },
      { id: 'hr', label: 'HR & Faculty Directory', path: '/sis/hr' },
      { id: 'communications', label: 'Communications Hub', path: '/sis/communications' },
    ],
  },
  {
    id: 'sis_campus_ops_menu',
    label: 'Campus Operations',
    path: '/sis/library',
    icon: Home,
    roles: ['sis', 'admin'],
    children: [
      { id: 'library', label: 'Library & Catalog', path: '/sis/library' },
      { id: 'transport', label: 'Transport & Fleet', path: '/sis/transport' },
      { id: 'hostel', label: 'Hostel & Dormitories', path: '/sis/hostel' },
      { id: 'clinic', label: 'Clinic & Healthcare', path: '/sis/clinic' },
      { id: 'inventory', label: 'Inventory & Assets', path: '/sis/inventory' },
    ],
  },
  { id: 'div_sis_4', kind: 'divider', label: '', path: '', icon: ChartBar },
  { id: 'head_sis_governance', kind: 'header', label: 'Documents, Data & Reports', path: '', icon: ChartBar },
  {
    id: 'sis_governance_menu',
    label: 'Documents, Data & Audit',
    path: '/sis/documents',
    icon: Document,
    roles: ['sis', 'admin'],
    children: [
      { id: 'documents', label: 'Document Vault', path: '/sis/documents' },
      { id: 'import-export', label: 'Import / Export Wizard', path: '/sis/import-export' },
      { id: 'reports', label: 'Reports & Analytics', path: '/sis/reports' },
      { id: 'admin-console', label: 'SIS Security & Audit', path: '/sis/admin-console' },
    ],
  },
];

export const CENTRAL_NAVIGATION: Record<UserRole, NavItemConfig[]> = {
  admin: ADMIN_NAVIGATION,
  sis: SIS_NAVIGATION,
  student: STUDENT_NAVIGATION,
  instructor: INSTRUCTOR_NAVIGATION,
  guardian: GUARDIAN_NAVIGATION,
};

/**
 * Dynamically filter navigation links based on user role and permissions
 */
export function getNavigationForRole(
  activeRole: UserRole,
  userPermissions: string[] = []
): NavItemConfig[] {
  const rawList = CENTRAL_NAVIGATION[activeRole] || ADMIN_NAVIGATION;

  return rawList
    .filter((item) => {
      if (item.kind === 'divider' || item.kind === 'header') return true;
      if (item.roles && item.roles.length > 0 && !item.roles.includes(activeRole)) {
        return false;
      }
      if (item.permission && userPermissions.length > 0) {
        const hasWildcard = userPermissions.some(
          (p) => p === 'read:*' || p === 'write:*' || p === 'admin'
        );
        if (!hasWildcard && !userPermissions.includes(item.permission)) {
          return false;
        }
      }
      return true;
    })
    .map((item) => {
      if (!item.children || item.children.length === 0) return item;
      return {
        ...item,
        children: item.children.filter((child) => {
          if (child.roles && child.roles.length > 0 && !child.roles.includes(activeRole)) {
            return false;
          }
          if (child.permission && userPermissions.length > 0) {
            const hasWildcard = userPermissions.some(
              (p) => p === 'read:*' || p === 'write:*' || p === 'admin'
            );
            if (!hasWildcard && !userPermissions.includes(child.permission)) {
              return false;
            }
          }
          return true;
        }),
      };
    });
}

