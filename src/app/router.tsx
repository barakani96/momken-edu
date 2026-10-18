import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/shell/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Showcase } from './pages/Showcase';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from '../ui/layout/ProtectedRoute';
import { EntityPage, hasResource } from '../components/dynamic-ui';

// Layout & Authorization Guards
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminAuthorizationGate } from '../components/auth/AdminAuthorizationGate';

// Admin Console Views
import { AdminDashboard } from './admin/views/AdminDashboard';
import { OrganizationsPage } from './admin/views/organization/OrganizationsPage';
import { UsersPage } from './admin/views/identity/UsersPage';
import { IAMConsolePage } from './admin/views/identity/IAMConsolePage';
import { UserDetailPage } from './admin/views/identity/UserDetailPage';
import { RolesPage } from './admin/views/access/RolesPage';
import { GeneralSettingsPage } from './admin/views/system/GeneralSettingsPage';
import { NavigationManagementPage } from './admin/views/system/NavigationManagementPage';
import { FeatureFlagsPage } from './admin/views/feature-management/FeatureFlagsPage';
import { AuditLogsPage } from './admin/views/audit/AuditLogsPage';
import { JobsPage } from './admin/views/operations/JobsPage';
import { ConsoleSettingsPage } from './admin/views/administration/ConsoleSettingsPage';
import { NotificationsPage } from './admin/views/platform/NotificationsPage';
import { WorkflowsPage } from './admin/views/platform/WorkflowsPage';

// Portals
import { SisLayout } from '../components/layout/SisLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { StudentDashboard } from './student/views/StudentDashboard';
import { StudentCoursesPage } from './student/views/StudentCoursesPage';
import { StudentSchedulePage } from './student/views/StudentSchedulePage';
import { StudentRecordsPage } from './student/views/StudentRecordsPage';
import { StudentProfilePage } from './student/views/StudentProfilePage';
import { InstructorLayout } from '../components/layout/InstructorLayout';
import { InstructorDashboard } from './instructor/views/InstructorDashboard';
import { GuardianLayout } from '../components/layout/GuardianLayout';
import { GuardianDashboard } from './guardian/views/GuardianDashboard';

// Initialize all application modules and register resources
import './modules';

import { SisPage } from '@schools/module-sis';

export const router = createBrowserRouter([
  {
    path: '/sis',
    element: (
      <ProtectedRoute>
        <SisLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/sis/dashboard" replace /> },
      // 1. Core Student Registry & 360
      { path: 'dashboard', element: <SisPage viewKey="dashboard" /> },
      { path: 'directory', element: <SisPage viewKey="directory" /> },
      { path: 'registration', element: <SisPage viewKey="registration" /> },
      { path: 'profile', element: <SisPage viewKey="profile" /> },
      { path: 'profile/:studentId', element: <SisPage viewKey="profile" /> },
      { path: 'students/:studentId', element: <SisPage viewKey="profile" /> },
      { path: 'guardians', element: <SisPage viewKey="guardians" /> },

      // 2. Admissions & Student Lifecycle
      { path: 'admissions', element: <SisPage viewKey="admissions" /> },
      { path: 'enrollment', element: <SisPage viewKey="enrollment" /> },
      { path: 'placement', element: <SisPage viewKey="placement" /> },
      { path: 'lifecycle', element: <SisPage viewKey="lifecycle" /> },
      { path: 'transfers', element: <SisPage viewKey="transfers" /> },
      { path: 'withdrawal', element: <SisPage viewKey="withdrawal" /> },
      { path: 'graduation', element: <SisPage viewKey="graduation" /> },

      // 3. Academics, Schedule & Behavior
      { path: 'academics', element: <SisPage viewKey="academics" /> },
      { path: 'attendance', element: <SisPage viewKey="attendance" /> },
      { path: 'timetable', element: <SisPage viewKey="timetable" /> },
      { path: 'exams', element: <SisPage viewKey="exams" /> },
      { path: 'discipline', element: <SisPage viewKey="discipline" /> },

      // 4. Campus Services & Finance
      { path: 'finance', element: <SisPage viewKey="finance" /> },
      { path: 'hr', element: <SisPage viewKey="hr" /> },
      { path: 'library', element: <SisPage viewKey="library" /> },
      { path: 'transport', element: <SisPage viewKey="transport" /> },
      { path: 'hostel', element: <SisPage viewKey="hostel" /> },
      { path: 'clinic', element: <SisPage viewKey="clinic" /> },
      { path: 'inventory', element: <SisPage viewKey="inventory" /> },
      { path: 'communications', element: <SisPage viewKey="communications" /> },

      // 5. Documents, Data & Security Governance
      { path: 'documents', element: <SisPage viewKey="documents" /> },
      { path: 'import-export', element: <SisPage viewKey="import-export" /> },
      { path: 'reports', element: <SisPage viewKey="reports" /> },
      { path: 'admin-console', element: <SisPage viewKey="admin-console" /> },

      // Dynamic & Nested Domain Fallback Routes
      { path: ':domain/:subview', element: <SisPage /> },
      { path: ':subview', element: <SisPage /> },
      { path: '*', element: <SisPage /> },
    ]
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute>
        <SisLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/sis/directory" replace /> },
      { path: ':studentId', element: <SisPage viewKey="profile" /> },
      { path: '*', element: <Navigate to="/sis/directory" replace /> },
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'courses', element: <StudentCoursesPage /> },
      { path: 'schedule', element: <StudentSchedulePage /> },
      { path: 'records', element: <StudentRecordsPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
      { path: '*', element: <StudentDashboard /> },
    ]
  },
  {
    path: '/instructor',
    element: (
      <ProtectedRoute>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <InstructorDashboard /> },
      { path: '*', element: <InstructorDashboard /> },
    ]
  },
  {
    path: '/guardian',
    element: (
      <ProtectedRoute>
        <GuardianLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <GuardianDashboard /> },
      { path: '*', element: <GuardianDashboard /> },
    ]
  },
  {
    path: '/admin',
    element: (
      <AdminAuthorizationGate>
        <AdminLayout />
      </AdminAuthorizationGate>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'organization/organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'organization/campuses',
        element: <OrganizationsPage />,
      },
      {
        path: 'organization/departments',
        element: <OrganizationsPage />,
      },
      {
        path: 'organization/academic-units',
        element: <OrganizationsPage />,
      },
      {
        path: 'identity/users',
        element: <IAMConsolePage />,
      },
      {
        path: 'identity/users/:id',
        element: <UserDetailPage />,
      },
      {
        path: 'identity/groups',
        element: <IAMConsolePage />,
      },
      {
        path: 'access/roles',
        element: <IAMConsolePage />,
      },
      {
        path: 'access/effective-access',
        element: <UserDetailPage />,
      },
      {
        path: 'access/policies',
        element: <IAMConsolePage />,
      },
      {
        path: 'access/sessions',
        element: <IAMConsolePage />,
      },
      {
        path: 'academic/*',
        element: <AdminDashboard />,
      },
      {
        path: 'sis/config',
        element: <Navigate to="/sis/admin-console" replace />,
      },
      {
        path: 'sis/enrollment',
        element: <Navigate to="/sis/enrollment" replace />,
      },
      {
        path: 'sis/admissions',
        element: <Navigate to="/sis/admissions" replace />,
      },
      {
        path: 'sis/*',
        element: <Navigate to="/sis/dashboard" replace />,
      },
      {
        path: 'system/general',
        element: <GeneralSettingsPage />,
      },
      {
        path: 'system/navigation',
        element: <NavigationManagementPage />,
      },
      {
        path: 'system/*',
        element: <GeneralSettingsPage />,
      },
      {
        path: 'workflow/*',
        element: <AdminDashboard />,
      },
      {
        path: 'integrations/*',
        element: <AdminDashboard />,
      },
      {
        path: 'developer/*',
        element: <AdminDashboard />,
      },
      {
        path: 'feature-management/flags',
        element: <FeatureFlagsPage />,
      },
      {
        path: 'platform/notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'platform/workflows',
        element: <WorkflowsPage />,
      },
      {
        path: 'audit/logs',
        element: <AuditLogsPage />,
      },
      {
        path: 'audit/security-events',
        element: <AuditLogsPage />,
      },
      {
        path: 'operations/jobs',
        element: <JobsPage />,
      },
      {
        path: 'operations/health',
        element: <AdminDashboard />,
      },
      {
        path: 'administration/console-settings',
        element: <ConsoleSettingsPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'showcase',
        element: <Showcase />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: ':resource',
        element: <EntityPageWrapper />,
      },
      {
        path: ':resource/new',
        element: <EntityPageWrapper />,
      },
      {
        path: ':resource/:id',
        element: <EntityPageWrapper />,
      },
      {
        path: ':resource/:id/edit',
        element: <EntityPageWrapper />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// Wrapper component to extract resource param, validate existence, and pass to EntityPage
function EntityPageWrapper() {
  const { resource } = useParams();
  if (!resource || !hasResource(resource)) {
    return <NotFound />;
  }

  return <EntityPage resource={resource} />;
}
