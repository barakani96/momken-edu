import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tag,
  Tile,
  Button,
  Dropdown,
} from '@carbon/react';
import { useBreakpoint } from '@schools/ui';
import {
  User,
  UserFollow,
  Group,
  Flow,
  Document,
  ChartBar,
  Download,
  Education,
  Edit,
  Catalog,
  Calendar,
  Wallet,
  Partnership,
  Chat,
  Delivery,
  Home,
  Activity,
  Warning,
  Archive,
  Terminal,
} from '@carbon/icons-react';
import { useSisStore } from './sisStore';
import { SisDashboardView } from './views/SisDashboardView';
import { StudentDirectoryView } from './views/StudentDirectoryView';
import { StudentProfileView } from './views/StudentProfileView';
import { StudentRegistrationWizard } from './views/StudentRegistrationWizard';
import { GuardianFamilyView } from './views/GuardianFamilyView';
import { LifecycleStatusView } from './views/LifecycleStatusView';
import { EnrollmentView } from './views/EnrollmentView';
import { AcademicPlacementView } from './views/AcademicPlacementView';
import { TransferView } from './views/TransferView';
import { WithdrawalView } from './views/WithdrawalView';
import { GraduationView } from './views/GraduationView';
import { DocumentsView } from './views/DocumentsView';
import { ImportExportView } from './views/ImportExportView';
import { ReportsView } from './views/ReportsView';

// Integrated SIS Portal Module Views
import { AcademicsView } from './views/AcademicsView';
import { AttendanceView } from './views/AttendanceView';
import { AdmissionsView } from './views/AdmissionsView';
import { FinanceView } from './views/FinanceView';
import { HrView } from './views/HrView';
import { CommunicationsView } from './views/CommunicationsView';
import { ExamsView } from './views/ExamsView';
import { LibraryView } from './views/LibraryView';
import { TransportView } from './views/TransportView';
import { HostelView } from './views/HostelView';
import { ClinicView } from './views/ClinicView';
import { TimetableView } from './views/TimetableView';
import { DisciplineView } from './views/DisciplineView';
import { InventoryView } from './views/InventoryView';
import { AdminConsoleView } from './views/AdminConsoleView';

interface SisNavItem {
  key: string;
  labelKey: string;
  sectionKey: 'core' | 'lifecycle' | 'academics' | 'services' | 'governance';
  icon: React.ComponentType<any>;
}

const SIS_PORTAL_VIEWS: SisNavItem[] = [
  // 1. Core Student Directory & 360
  { key: 'dashboard', labelKey: 'sis.nav.dashboard', sectionKey: 'core', icon: ChartBar },
  { key: 'directory', labelKey: 'sis.nav.directory', sectionKey: 'core', icon: Group },
  { key: 'registration', labelKey: 'sis.nav.registration', sectionKey: 'core', icon: UserFollow },
  { key: 'profile', labelKey: 'sis.nav.profile', sectionKey: 'core', icon: User },
  { key: 'guardians', labelKey: 'sis.nav.guardians', sectionKey: 'core', icon: Partnership },

  // 2. Admissions & Lifecycle
  { key: 'admissions', labelKey: 'sis.nav.admissions', sectionKey: 'lifecycle', icon: UserFollow },
  { key: 'enrollment', labelKey: 'sis.nav.enrollment', sectionKey: 'lifecycle', icon: Catalog },
  { key: 'placement', labelKey: 'sis.nav.placement', sectionKey: 'lifecycle', icon: Edit },
  { key: 'lifecycle', labelKey: 'sis.nav.lifecycle', sectionKey: 'lifecycle', icon: Flow },
  { key: 'transfers', labelKey: 'sis.nav.transfers', sectionKey: 'lifecycle', icon: Flow },
  { key: 'withdrawal', labelKey: 'sis.nav.withdrawal', sectionKey: 'lifecycle', icon: Flow },
  { key: 'graduation', labelKey: 'sis.nav.graduation', sectionKey: 'lifecycle', icon: Education },

  // 3. Academics & Attendance
  { key: 'academics', labelKey: 'sis.nav.academics', sectionKey: 'academics', icon: Education },
  { key: 'attendance', labelKey: 'sis.nav.attendance', sectionKey: 'academics', icon: Calendar },
  { key: 'timetable', labelKey: 'sis.nav.timetable', sectionKey: 'academics', icon: Calendar },
  { key: 'exams', labelKey: 'sis.nav.exams', sectionKey: 'academics', icon: Document },
  { key: 'discipline', labelKey: 'sis.nav.discipline', sectionKey: 'academics', icon: Warning },

  // 4. Campus Services & Finance
  { key: 'finance', labelKey: 'sis.nav.finance', sectionKey: 'services', icon: Wallet },
  { key: 'hr', labelKey: 'sis.nav.hr', sectionKey: 'services', icon: Partnership },
  { key: 'library', labelKey: 'sis.nav.library', sectionKey: 'services', icon: Catalog },
  { key: 'transport', labelKey: 'sis.nav.transport', sectionKey: 'services', icon: Delivery },
  { key: 'hostel', labelKey: 'sis.nav.hostel', sectionKey: 'services', icon: Home },
  { key: 'clinic', labelKey: 'sis.nav.clinic', sectionKey: 'services', icon: Activity },
  { key: 'inventory', labelKey: 'sis.nav.inventory', sectionKey: 'services', icon: Archive },
  { key: 'communications', labelKey: 'sis.nav.communications', sectionKey: 'services', icon: Chat },

  // 5. Documents, Data & Reports
  { key: 'documents', labelKey: 'sis.nav.documents', sectionKey: 'governance', icon: Document },
  { key: 'import-export', labelKey: 'sis.nav.importExport', sectionKey: 'governance', icon: Download },
  { key: 'reports', labelKey: 'sis.nav.reports', sectionKey: 'governance', icon: ChartBar },
  { key: 'admin-console', labelKey: 'sis.nav.admin-console', sectionKey: 'governance', icon: Terminal },
];

const VALID_VIEW_KEYS = new Set(SIS_PORTAL_VIEWS.map((v) => v.key));

export interface SisPageProps {
  viewKey?: string;
}

export const SisPage: React.FC<SisPageProps> = ({ viewKey }) => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const { subview, studentId } = useParams<{ subview?: string; studentId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    activeStudentId,
    setActiveStudentId,
    students,
  } = useSisStore();

  // Resolve the active view key strictly from the URL route
  const currentView = React.useMemo(() => {
    if (viewKey && VALID_VIEW_KEYS.has(viewKey)) {
      return viewKey;
    }
    if (subview && VALID_VIEW_KEYS.has(subview)) {
      return subview;
    }
    const segments = location.pathname.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      if (VALID_VIEW_KEYS.has(segments[i])) {
        return segments[i];
      }
    }
    return 'dashboard';
  }, [viewKey, subview, location.pathname]);

  // Sync URL studentId param -> activeStudentId in store
  useEffect(() => {
    if (studentId && students.some((s) => s.id === studentId || s.studentNumber === studentId)) {
      const matched = students.find((s) => s.id === studentId || s.studentNumber === studentId);
      if (matched && activeStudentId !== matched.id) {
        setActiveStudentId(matched.id);
      }
    }
  }, [studentId, students, activeStudentId, setActiveStudentId]);

  // One-way sync: URL route -> Zustand store (never navigate inside useEffect)
  useEffect(() => {
    if (activeTab !== currentView) {
      setActiveTab(currentView);
    }
  }, [currentView, activeTab, setActiveTab]);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const currentViewDef =
    SIS_PORTAL_VIEWS.find((v) => v.key === currentView) || SIS_PORTAL_VIEWS[0];

  const handleTabChange = (newTabKey: string) => {
    setActiveTab(newTabKey);
    navigate(`/sis/${newTabKey}`);
  };

  const getStatusTagType = (status?: string) => {
    switch (status) {
      case 'active':
      case 'enrolled':
        return 'green';
      case 'admitted':
        return 'blue';
      case 'applicant':
        return 'warm-gray';
      case 'graduated':
        return 'purple';
      case 'withdrawn':
        return 'red';
      default:
        return 'cool-gray';
    }
  };

  const showStudentContextRibbon =
    activeStudent &&
    currentView !== 'dashboard' &&
    currentView !== 'directory' &&
    currentView !== 'registration' &&
    currentView !== 'import-export' &&
    currentView !== 'reports' &&
    currentView !== 'admin-console';

  const studentOptions = students.map((student) => ({
    id: student.id,
    label: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
  }));
  const selectedStudentOption =
    studentOptions.find((opt) => opt.id === activeStudentId) || studentOptions[0];

  return (
    <div style={{ width: '100%' }}>
      {/* Standalone SIS Portal Workspace Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.875rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <Tag type="green" size="sm">
              {t(`portals.sis.sections.${currentViewDef.sectionKey}`)}
            </Tag>
            <Tag type="teal" size="sm">
              {t('portals.sis.systemOnline')}
            </Tag>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? '1.375rem' : '1.75rem',
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            {t(currentViewDef.labelKey)}
          </h1>
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--cds-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            {t('portals.sis.subtitle')}
          </div>
        </div>

        {/* Mobile Quick Student 360 Switcher & Action Bar */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle-01)',
            }}
          >
            <Dropdown
              id="sis-mobile-active-student-switcher"
              titleText=""
              label={t('portals.sis.selectStudent')}
              size="md"
              items={studentOptions}
              itemToString={(item) => (item ? item.label : '')}
              selectedItem={selectedStudentOption}
              onChange={({ selectedItem }) => {
                if (selectedItem) {
                  setActiveStudentId(selectedItem.id);
                }
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Button
                kind="secondary"
                size="sm"
                renderIcon={User}
                onClick={() => handleTabChange('profile')}
                style={{ width: '100%', maxWidth: '100%', minHeight: '2.5rem' }}
              >
                {t('portals.sis.profileBtn')}
              </Button>
              <Button
                kind="primary"
                size="sm"
                renderIcon={UserFollow}
                onClick={() => handleTabChange('registration')}
                style={{ width: '100%', maxWidth: '100%', minHeight: '2.5rem' }}
              >
                {t('portals.sis.registerStudentBtn')}
              </Button>
            </div>
          </div>
        )}

        {/* Active Student 360 Context Ribbon */}
        {showStudentContextRibbon && (
          <Tile
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle-01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                {t('portals.sis.activeStudentLabel')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.9375rem' }}>
                  {activeStudent.firstName} {activeStudent.lastName}
                </strong>
                <Tag type="cool-gray" size="sm">
                  {activeStudent.studentNumber}
                </Tag>
                <Tag type={getStatusTagType(activeStudent.status)} size="sm">
                  {t(`sis.status.${activeStudent.status}`, activeStudent.status)}
                </Tag>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                borderInlineStart: isMobile ? 'none' : '1px solid var(--cds-border-subtle-01)',
                paddingInlineStart: isMobile ? 0 : '0.75rem',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <Tag type="blue" size="sm">
                {activeStudent.gradeLevel} • {activeStudent.classSection}
              </Tag>
              <Tag type="cyan" size="sm">
                {t('portals.sis.gpaLabel')}: {activeStudent.gpa.toFixed(2)}
              </Tag>
              {currentView !== 'profile' && (
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={User}
                  onClick={() => handleTabChange('profile')}
                >
                  {t('portals.sis.profileBtn')}
                </Button>
              )}
              {currentView !== 'documents' && (
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Document}
                  onClick={() => handleTabChange('documents')}
                >
                  {t('sis.nav.documents')}
                </Button>
              )}
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Group}
                onClick={() => handleTabChange('directory')}
              >
                {t('portals.sis.directoryBtn')}
              </Button>
            </div>
          </Tile>
        )}
      </div>

      {/* Render Active SIS Portal View */}
      {currentView === 'dashboard' && <SisDashboardView />}
      {currentView === 'directory' && <StudentDirectoryView />}
      {currentView === 'registration' && <StudentRegistrationWizard />}
      {currentView === 'profile' && <StudentProfileView />}
      {currentView === 'guardians' && <GuardianFamilyView />}
      {currentView === 'lifecycle' && <LifecycleStatusView />}
      {currentView === 'enrollment' && <EnrollmentView />}
      {currentView === 'placement' && <AcademicPlacementView />}
      {currentView === 'transfers' && <TransferView />}
      {currentView === 'withdrawal' && <WithdrawalView />}
      {currentView === 'graduation' && <GraduationView />}
      {currentView === 'documents' && <DocumentsView />}
      {currentView === 'import-export' && <ImportExportView />}
      {currentView === 'reports' && <ReportsView />}

      {/* Integrated Campus & Academic SIS Views */}
      {currentView === 'academics' && <AcademicsView />}
      {currentView === 'attendance' && <AttendanceView />}
      {currentView === 'admissions' && <AdmissionsView />}
      {currentView === 'finance' && <FinanceView />}
      {currentView === 'hr' && <HrView />}
      {currentView === 'communications' && <CommunicationsView />}
      {currentView === 'exams' && <ExamsView />}
      {currentView === 'library' && <LibraryView />}
      {currentView === 'transport' && <TransportView />}
      {currentView === 'hostel' && <HostelView />}
      {currentView === 'clinic' && <ClinicView />}
      {currentView === 'timetable' && <TimetableView />}
      {currentView === 'discipline' && <DisciplineView />}
      {currentView === 'inventory' && <InventoryView />}
      {currentView === 'admin-console' && <AdminConsoleView />}
    </div>
  );
};

export default SisPage;
