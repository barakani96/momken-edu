import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useShell } from '../../components/shell/ShellContext';
import {
  Tile,
  ClickableTile,
  Button,
  Tag,
  SkeletonText,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  CheckmarkOutline,
  UserMultiple,
  Education,
  Catalog,
  Building,
  DocumentAdd,
  ArrowRight,
  Settings as SettingsIcon,
  Events,
  ArrowUpRight,
  ArrowDownRight,
} from '@carbon/icons-react';
import { PageLayout } from '../../ui/layout/PageLayout';
import { ResponsiveGrid } from '../../ui/layout/ResponsiveGrid';
import { hasResource, getResource } from '../../components/dynamic-ui';
import { SystemPerformanceChart } from '../../components/dashboard/SystemPerformanceChart';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveContext } = useShell();

  // Performance telemetry hook
  usePerformanceMonitor('Dashboard', { thresholdMs: 40, initialThresholdMs: 200 });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentsCount: 0,
    admissionsCount: 0,
    coursesCount: 0,
    sectionsCount: 0,
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [activeSections, setActiveSections] = useState<any[]>([]);

  useEffect(() => {
    setActiveContext({
      entity: 'System Overview',
      component: 'Dashboard',
    });
  }, [setActiveContext]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [studentsRes, admissionsRes, coursesRes, sectionsRes] = await Promise.all([
          hasResource('students') ? getResource('students').dataProvider.list() : Promise.resolve({ total: 0, data: [] }),
          hasResource('admissions') ? getResource('admissions').dataProvider.list() : Promise.resolve({ total: 0, data: [] }),
          hasResource('courses') ? getResource('courses').dataProvider.list() : Promise.resolve({ total: 0, data: [] }),
          hasResource('sections') ? getResource('sections').dataProvider.list() : Promise.resolve({ total: 0, data: [] }),
        ]);

        if (!isMounted) return;

        setStats({
          studentsCount: studentsRes.total || 0,
          admissionsCount: admissionsRes.total || 0,
          coursesCount: coursesRes.total || 0,
          sectionsCount: sectionsRes.total || 0,
        });
        setRecentAdmissions((admissionsRes.data || []).slice(0, 4));
        setActiveSections((sectionsRes.data || []).slice(0, 4));
      } catch (e) {
        console.error('Error loading dashboard stats:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStageTagType = (stage: string) => {
    switch (stage) {
      case 'Accepted':
        return 'green';
      case 'Interview':
        return 'cyan';
      case 'Under Review':
        return 'purple';
      case 'Waitlisted':
        return 'warm-gray';
      case 'Rejected':
        return 'red';
      default:
        return 'cool-gray';
    }
  };

  return (
    <PageLayout
      title={t('dashboard.title', 'Application Dashboard')}
      description="Real-time institutional oversight, domain operations, and administrative control."
      breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      contentWidth="full"
    >
      {/* KPI Metric Cards with Trend Indicators */}
      <div style={{ marginBottom: '2rem' }}>
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4, xlg: 4 }} gap="spacing05">
          {/* Active Students */}
          <Tile className="cds-tile-responsive">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                Enrolled Students
              </span>
              <UserMultiple size={20} style={{ fill: 'var(--cds-icon-primary)' }} />
            </div>
            {loading ? (
              <SkeletonText width="60px" heading />
            ) : (
              <div style={{ fontSize: '2.25rem', fontWeight: 300, marginBottom: '0.5rem', lineHeight: 1 }}>
                {stats.studentsCount}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag type="green" size="sm" renderIcon={CheckmarkOutline}>
                Active Cohort
              </Tag>
              {/* Positive Trend Indicator */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-support-success, #24a148)',
                }}
              >
                <ArrowUpRight size={14} />
                <span>+12.4%</span>
              </span>
            </div>
          </Tile>

          {/* Admissions Pipeline */}
          <Tile className="cds-tile-responsive">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                Admissions Pipeline
              </span>
              <DocumentAdd size={20} style={{ fill: 'var(--cds-icon-primary)' }} />
            </div>
            {loading ? (
              <SkeletonText width="60px" heading />
            ) : (
              <div style={{ fontSize: '2.25rem', fontWeight: 300, marginBottom: '0.5rem', lineHeight: 1 }}>
                {stats.admissionsCount}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag type="purple" size="sm">
                Under Review
              </Tag>
              {/* Positive Trend Indicator */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-support-success, #24a148)',
                }}
              >
                <ArrowUpRight size={14} />
                <span>+28.6%</span>
              </span>
            </div>
          </Tile>

          {/* Active Courses */}
          <Tile className="cds-tile-responsive">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                Course Catalog
              </span>
              <Catalog size={20} style={{ fill: 'var(--cds-icon-primary)' }} />
            </div>
            {loading ? (
              <SkeletonText width="60px" heading />
            ) : (
              <div style={{ fontSize: '2.25rem', fontWeight: 300, marginBottom: '0.5rem', lineHeight: 1 }}>
                {stats.coursesCount}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag type="blue" size="sm">
                Approved
              </Tag>
              {/* Positive Trend Indicator */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-support-success, #24a148)',
                }}
              >
                <ArrowUpRight size={14} />
                <span>+5.2%</span>
              </span>
            </div>
          </Tile>

          {/* Scheduled Sections */}
          <Tile className="cds-tile-responsive">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.32px',
                }}
              >
                Class Sections
              </span>
              <Building size={20} style={{ fill: 'var(--cds-icon-primary)' }} />
            </div>
            {loading ? (
              <SkeletonText width="60px" heading />
            ) : (
              <div style={{ fontSize: '2.25rem', fontWeight: 300, marginBottom: '0.5rem', lineHeight: 1 }}>
                {stats.sectionsCount}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag type="teal" size="sm">
                Timetable Active
              </Tag>
              {/* Downward Trend Indicator (Optimization) */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--cds-support-error, #da1e28)',
                }}
              >
                <ArrowDownRight size={14} />
                <span>-2.1%</span>
              </span>
            </div>
          </Tile>
        </ResponsiveGrid>
      </div>

      {/* Real-time System Performance Chart with Full-Screen Toggle */}
      <SystemPerformanceChart />


      {/* Module Navigation Quick Launchers */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--cds-text-primary)' }}>
          Operational Modules
        </h2>
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3, xlg: 3 }} gap="spacing05">
          {/* SIS Card */}
          <ClickableTile
            onClick={() => navigate('/students')}
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Education size={24} style={{ fill: 'var(--cds-interactive-01)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Student Information System</h3>
              </div>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                Authoritative institutional records for student demographics, admissions pipelines, and family guardians.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--cds-link-primary)', fontWeight: 500 }}>
                Manage Students & Admissions
              </span>
              <ArrowRight size={16} style={{ fill: 'var(--cds-link-primary)' }} />
            </div>
          </ClickableTile>

          {/* Academics Card */}
          <ClickableTile
            onClick={() => navigate('/courses')}
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Catalog size={24} style={{ fill: 'var(--cds-interactive-01)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Academics & Curriculum</h3>
              </div>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                Approved institutional course catalog, standardized learning goals, period sections, and instructor rooms.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--cds-link-primary)', fontWeight: 500 }}>
                Manage Courses & Sections
              </span>
              <ArrowRight size={16} style={{ fill: 'var(--cds-link-primary)' }} />
            </div>
          </ClickableTile>

          {/* Administration Card */}
          <ClickableTile
            onClick={() => navigate('/settings')}
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <SettingsIcon size={24} style={{ fill: 'var(--cds-interactive-01)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>System Administration</h3>
              </div>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                Platform configuration, role-based access permissions, multilingual localization, and appearance preferences.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--cds-link-primary)', fontWeight: 500 }}>
                Configure System Settings
              </span>
              <ArrowRight size={16} style={{ fill: 'var(--cds-link-primary)' }} />
            </div>
          </ClickableTile>
        </ResponsiveGrid>
      </div>

      {/* Operational Grids: Recent Admissions & Active Sections */}
      <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 2, xlg: 2 }} gap="spacing06">
        {/* Recent Admissions */}
        <Tile style={{ padding: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                Recent Admissions Applications
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                Incoming student candidates awaiting review or interview.
              </p>
            </div>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={ArrowRight}
              onClick={() => navigate('/admissions')}
            >
              View All
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>App #</TableHeader>
                  <TableHeader>Applicant</TableHeader>
                  <TableHeader>Grade</TableHeader>
                  <TableHeader>Score</TableHeader>
                  <TableHeader>Stage</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAdmissions.map((adm) => (
                  <TableRow
                    key={adm.id}
                    onClick={() => navigate(`/admissions/${adm.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell style={{ fontWeight: 500 }}>{adm.appNumber}</TableCell>
                    <TableCell>{adm.applicantName || adm.name}</TableCell>
                    <TableCell>{adm.targetGrade}</TableCell>
                    <TableCell>{adm.entranceScore}%</TableCell>
                    <TableCell>
                      <Tag type={getStageTagType(adm.stage)} size="sm">
                        {adm.stage}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tile>

        {/* Timetable / Sections */}
        <Tile style={{ padding: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                Active Class Sections
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                Current term timetable periods, faculty, and room assignments.
              </p>
            </div>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={ArrowRight}
              onClick={() => navigate('/sections')}
            >
              View All
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>Section</TableHeader>
                  <TableHeader>Course</TableHeader>
                  <TableHeader>Instructor</TableHeader>
                  <TableHeader>Room</TableHeader>
                  <TableHeader>Capacity</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeSections.map((sec) => (
                  <TableRow
                    key={sec.id}
                    onClick={() => navigate(`/sections/${sec.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell style={{ fontWeight: 500 }}>{sec.sectionCode}</TableCell>
                    <TableCell>{sec.courseName || sec.name}</TableCell>
                    <TableCell>{sec.instructor}</TableCell>
                    <TableCell>{sec.room}</TableCell>
                    <TableCell>
                      <span style={{ fontSize: '0.875rem' }}>
                        {sec.enrolled} / {sec.capacity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tile>
      </ResponsiveGrid>
    </PageLayout>
  );
}


