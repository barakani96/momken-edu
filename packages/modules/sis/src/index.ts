/**
 * @schools/module-sis — Authoritative Student Information System Module
 * Standalone package containing:
 * - Module API (`sisApi`, `sisApiHandlers`)
 * - DB Schemas & Reactive Store (`useSisStore`, schemas, Zod validation)
 * - View & UI Components (`SisPage`, 360 profile, document vault, registration wizards, all views)
 */

import { sisManifest } from './manifest';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export { sisManifest };
export const SIS_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.sis;

export * from './types';
export * as sisSchema from './db/schema';
export * as sisSchemas from './schemas';
export * from './components';
export * from './db/store';
export * from './api/sisApi';

// Export local UI views and page
export { SisPage } from './SisPage';
export * from './views/SisDashboardView';
export * from './views/StudentDirectoryView';
export * from './views/StudentProfileView';
export * from './views/StudentRegistrationWizard';
export * from './views/TermEnrollmentWizard';
export * from './views/AdmissionsView';
export * from './views/EnrollmentView';
export * from './views/DocumentsView';
export * from './views/DocumentInspectorModal';
export * from './views/GuardianFamilyView';
export * from './views/AcademicPlacementView';
export * from './views/LifecycleStatusView';
export * from './views/TransferView';
export * from './views/WithdrawalView';
export * from './views/GraduationView';
export * from './views/ImportExportView';
export * from './views/ReportsView';
export * from './views/AdminConsoleView';

// Cross-domain module integration views (Academics, Finance, HR, Library, etc.)
export * from './views/AcademicsView';
export * from './views/AttendanceView';
export * from './views/TimetableView';
export * from './views/ExamsView';
export * from './views/DisciplineView';
export * from './views/FinanceView';
export * from './views/HrView';
export * from './views/LibraryView';
export * from './views/TransportView';
export * from './views/HostelView';
export * from './views/ClinicView';
export * from './views/InventoryView';
export * from './views/CommunicationsView';
