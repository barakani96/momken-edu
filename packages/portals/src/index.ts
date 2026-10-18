/**
 * @schools/portals — Role-Based Institutional Portals Package
 * Exports Portal Registry, Role Layouts, and Portal Views for Student, Instructor, Guardian, SIS, and Admin.
 */

export * from '../../../src/core/portals/portalRegistry';
export { SisLayout } from '../../../src/components/layout/SisLayout';
export { AdminLayout } from '../../../src/components/layout/AdminLayout';
export { StudentLayout } from '../../../src/components/layout/StudentLayout';
export { InstructorLayout } from '../../../src/components/layout/InstructorLayout';
export { GuardianLayout } from '../../../src/components/layout/GuardianLayout';

// Student Portal Views
export { StudentDashboard } from '../../../src/app/student/views/StudentDashboard';
export { StudentCoursesPage } from '../../../src/app/student/views/StudentCoursesPage';
export { StudentSchedulePage } from '../../../src/app/student/views/StudentSchedulePage';
export { StudentRecordsPage } from '../../../src/app/student/views/StudentRecordsPage';
export { StudentProfilePage } from '../../../src/app/student/views/StudentProfilePage';

// Instructor Portal Views
export { InstructorDashboard } from '../../../src/app/instructor/views/InstructorDashboard';

// Guardian Portal Views
export { GuardianDashboard } from '../../../src/app/guardian/views/GuardianDashboard';
