import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button } from '@carbon/react';
import { UserFollow } from '@carbon/icons-react';
import { PortalShell } from '../../ui/layout/PortalShell';
import { useSisStore } from '@schools/module-sis';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * Standalone SIS Portal Layout
 * Wraps the Student Information System (SIS) inside a dedicated Carbon v11 PortalShell
 * with full hierarchical SideNav, breadcrumb trail, and global Active Student 360 switcher.
 */
export function SisLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { students, activeStudentId, setActiveStudentId, setActiveTab } = useSisStore();

  const studentOptions = students.map((student) => ({
    id: student.id,
    label: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
  }));

  const selectedStudentOption =
    studentOptions.find((opt) => opt.id === activeStudentId) || studentOptions[0];

  const headerActions = !isMobile ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: '250px' }}>
        <Dropdown
          id="sis-global-active-student-switcher"
          titleText=""
          label={t('portals.sis.selectStudent')}
          size="sm"
          items={studentOptions}
          itemToString={(item) => (item ? item.label : '')}
          selectedItem={selectedStudentOption}
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              setActiveStudentId(selectedItem.id);
            }
          }}
        />
      </div>
      <Button
        kind="primary"
        size="sm"
        renderIcon={UserFollow}
        onClick={() => {
          setActiveTab('registration');
          navigate('/sis/registration');
        }}
      >
        {t('portals.sis.registerStudentBtn')}
      </Button>
    </div>
  ) : undefined;

  return (
    <PortalShell
      portalId="sis"
      showBreadcrumbs={true}
      headerActions={headerActions}
    >
      <Outlet />
    </PortalShell>
  );
}

export default SisLayout;
