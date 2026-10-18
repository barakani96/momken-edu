import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  ProgressBar,
  ClickableTile,
  Section,
} from '@carbon/react';
import {
  UserFollow,
  CheckmarkOutline,
  Time,
  UserAdmin,
  Document,
  Group,
  Flow,
  Education,
  Warning,
  ArrowRight,
  Filter,
} from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { useBreakpoint } from '@schools/ui';

export const SisDashboardView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { students, setActiveTab, setActiveStudentId } = useSisStore();

  const goToView = (tab: string) => {
    setActiveTab(tab);
    navigate(`/sis/${tab}`);
  };

  const total = students.length;
  const activeEnrolled = students.filter((s) => s.status === 'active' || s.status === 'enrolled').length;
  const pendingApplicants = students.filter((s) => s.status === 'applicant' || s.status === 'admitted').length;
  const graduatedWithdrawn = students.filter((s) => s.status === 'graduated' || s.status === 'withdrawn').length;

  const maleCount = students.filter((s) => s.gender === 'Male').length;
  const femaleCount = students.filter((s) => s.gender === 'Female').length;

  // Pending items queues
  const pendingTransfers = students.flatMap((s) => s.transfers.filter((tr) => tr.status === 'under_review' || tr.status === 'initiated'));
  const pendingWithdrawals = students.flatMap((s) => s.withdrawals.filter((w) => w.status === 'under_review' || w.status === 'initiated'));
  const pendingDocs = students.flatMap((s) => s.documents.filter((d) => d.status === 'Pending'));

  return (
    <div style={{ padding: '0.5rem 0 1rem' }}>
      {/* Top Banner */}
      <Tile
        style={{
          marginBottom: '1.25rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: isMobile ? '1.125rem' : '1.25rem' }}>
              {t('sis.title')}
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              {t('sis.description')}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto',
              gap: '0.5rem',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Button
              kind="primary"
              size="sm"
              renderIcon={UserFollow}
              onClick={() => goToView('registration')}
              style={{ width: '100%', maxWidth: '100%', minHeight: '2.75rem' }}
            >
              {t('sis.registerStudent')}
            </Button>
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Flow}
              onClick={() => goToView('import-export')}
              style={{ width: '100%', maxWidth: '100%', minHeight: '2.75rem' }}
            >
              {t('sis.importExportBtn')}
            </Button>
          </div>
        </div>
      </Tile>

      {/* KPI Tiles */}
      <div className="cds-grid-cols-4-responsive" style={{ marginBottom: '1.25rem' }}>
        <Tile style={{ height: '100%', position: 'relative', border: '1px solid var(--cds-border-subtle-01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              {t('sis.kpis.totalStudents')}
            </span>
            <Group size={20} style={{ fill: 'var(--cds-interactive-01)', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', fontVariantNumeric: 'tabular-nums' }}>
            {total}
          </div>
          <Tag type="blue" size="sm">Active Roster</Tag>
        </Tile>

        <Tile style={{ height: '100%', border: '1px solid var(--cds-border-subtle-01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              {t('sis.kpis.activeEnrolled')}
            </span>
            <CheckmarkOutline size={20} style={{ fill: 'var(--cds-support-02)', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', fontVariantNumeric: 'tabular-nums' }}>
            {activeEnrolled}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
            {total > 0 ? Math.round((activeEnrolled / total) * 100) : 0}% of Total Headcount
          </div>
        </Tile>

        <Tile style={{ height: '100%', border: '1px solid var(--cds-border-subtle-01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              {t('sis.kpis.pendingApplicants')}
            </span>
            <Time size={20} style={{ fill: 'var(--cds-support-03)', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', fontVariantNumeric: 'tabular-nums' }}>
            {pendingApplicants}
          </div>
          <Tag type="warm-gray" size="sm">Action Required</Tag>
        </Tile>

        <Tile style={{ height: '100%', border: '1px solid var(--cds-border-subtle-01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              {t('sis.kpis.graduatedWithdrawn')}
            </span>
            <Education size={20} style={{ fill: 'var(--cds-support-04)', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', fontVariantNumeric: 'tabular-nums' }}>
            {graduatedWithdrawn}
          </div>
          <Tag type="gray" size="sm">Archived Records</Tag>
        </Tile>
      </div>

      {/* Analytics & Operational Queues */}
      <div className="cds-grid-cols-2-responsive" style={{ marginBottom: '1.25rem' }}>
        {/* Left Column: Demographics & Campus Breakdown */}
        <Tile style={{ border: '1px solid var(--cds-border-subtle-01)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Gender & Enrollment Demographics
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Male Headcount</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {maleCount} ({total ? Math.round((maleCount / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <ProgressBar label="Male Headcount" hideLabel value={total ? (maleCount / total) * 100 : 0} max={100} size="small" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Female Headcount</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {femaleCount} ({total ? Math.round((femaleCount / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <ProgressBar label="Female Headcount" hideLabel value={total ? (femaleCount / total) * 100 : 0} max={100} size="small" />
              </div>
            </div>
          </div>

          <h5 style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Grade Level Distribution
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((gr) => {
              const count = students.filter((s) => s.gradeLevel === gr).length;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={gr} style={{ fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
                    <span>{gr}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count} students ({pct}%)</span>
                  </div>
                  <ProgressBar label={gr} hideLabel value={pct} max={100} size="small" />
                </div>
              );
            })}
          </div>
        </Tile>

        {/* Right Column: Operational Queues */}
        <Tile style={{ border: '1px solid var(--cds-border-subtle-01)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Warning size={18} style={{ fill: 'var(--cds-support-03)', flexShrink: 0 }} />
            Operational Queues & Data Quality Alerts
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ClickableTile onClick={() => goToView('transfers')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Pending Transfer Approvals ({pendingTransfers.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                    Campus transfer requests awaiting registrar review.
                  </div>
                </div>
                <ArrowRight size={16} style={{ flexShrink: 0 }} />
              </div>
            </ClickableTile>

            <ClickableTile onClick={() => goToView('withdrawal')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Pending Withdrawal Clearances ({pendingWithdrawals.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                    Student clearance & transcript release approvals.
                  </div>
                </div>
                <ArrowRight size={16} style={{ flexShrink: 0 }} />
              </div>
            </ClickableTile>

            <ClickableTile onClick={() => goToView('documents')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Unverified Student Documents ({pendingDocs.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                    Uploaded passports, birth certificates, and transcripts needing audit.
                  </div>
                </div>
                <ArrowRight size={16} style={{ flexShrink: 0 }} />
              </div>
            </ClickableTile>
          </div>
        </Tile>
      </div>

      {/* Recent Roster Snapshot */}
      <Tile style={{ border: '1px solid var(--cds-border-subtle-01)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Student Registrations</h4>
          <Button kind="ghost" size="sm" onClick={() => goToView('directory')}>
            View Full Directory
          </Button>
        </div>

        {isMobile ? (
          /* Mobile-First Touch Student Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {students.slice(0, 5).map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'var(--cds-layer-02)',
                  border: '1px solid var(--cds-border-subtle-01)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cds-text-primary)' }}>
                      {s.firstName} {s.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {s.studentNumber} · {s.gradeLevel} ({s.classSection})
                    </div>
                  </div>
                  <Tag type={s.status === 'active' ? 'green' : s.status === 'applicant' ? 'warm-gray' : 'blue'} size="sm">
                    {s.status.toUpperCase()}
                  </Tag>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  {s.campus} · {s.program}
                </div>
                <Button
                  kind="tertiary"
                  size="sm"
                  onClick={() => {
                    setActiveStudentId(s.id);
                    goToView('profile');
                  }}
                  style={{ width: '100%', maxWidth: '100%', minHeight: '2.5rem', marginTop: '0.25rem' }}
                >
                  View 360° Profile
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--cds-border-subtle-01)', textAlign: 'start' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Student ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Campus</th>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Grade</th>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'start' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--cds-border-subtle-01)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.studentNumber}</td>
                    <td style={{ padding: '0.5rem' }}>{s.firstName} {s.lastName}</td>
                    <td style={{ padding: '0.5rem' }}>{s.campus}</td>
                    <td style={{ padding: '0.5rem' }}>{s.gradeLevel}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <Tag type={s.status === 'active' ? 'green' : s.status === 'applicant' ? 'warm-gray' : 'blue'}>
                        {s.status.toUpperCase()}
                      </Tag>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveStudentId(s.id);
                          goToView('profile');
                        }}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tile>
    </div>
  );
};
