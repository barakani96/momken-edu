import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Checkbox,
  ProgressBar,
} from '@carbon/react';
import { Education, Checkmark, Close } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const GraduationView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, updateGraduationReview } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const grad = student.graduation;

  if (!grad) {
    return (
      <Tile style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <Education size={40} style={{ fill: 'var(--cds-interactive-01)', marginBottom: '1rem' }} />
        <h3>Graduation Audit Not Yet Triggered</h3>
        <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
          {student.firstName} {student.lastName} ({student.gradeLevel}) will undergo graduation clearance evaluation upon entering Grade 12 completion term.
        </p>
      </Tile>
    );
  }

  const fulfilledCount = grad.requirementsChecklist.filter((r) => r.fulfilled).length;
  const totalCount = grad.requirementsChecklist.length;
  const progressPct = totalCount ? Math.round((fulfilledCount / totalCount) * 100) : 0;

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.graduation.title')}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Academic clearance & certificate eligibility for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Tag type={grad.eligibilityStatus === 'approved' || grad.eligibilityStatus === 'graduated' ? 'purple' : 'warm-gray'}>
            {grad.eligibilityStatus.toUpperCase()}
          </Tag>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Academic Audit Progress</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {fulfilledCount} / {totalCount} Requirements Met ({progressPct}%)
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ProgressBar label="Requirements fulfilled" value={progressPct} max={100} size="small" />
            </div>

            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Graduation Cohort:</strong> {grad.graduationCohort}</div>
              <div><strong>Expected Graduation Date:</strong> {grad.graduationDate}</div>
              <div><strong>Cumulative GPA:</strong> {grad.cumulativeGpa} / 4.0</div>
              <div><strong>Credits Earned:</strong> {grad.creditsEarned} Credits</div>
              <div><strong>Certificate Issued:</strong> {grad.certificateIssued ? 'Yes (Official Diploma Generated)' : 'No'}</div>
            </div>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('sis.graduation.requirements')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {grad.requirementsChecklist.map((req) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Checkbox
                    id={req.id}
                    labelText={req.title}
                    checked={req.fulfilled}
                    readOnly
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {grad.eligibilityStatus !== 'approved' && grad.eligibilityStatus !== 'graduated' && (
                <Button
                  kind="primary"
                  size="sm"
                  renderIcon={Checkmark}
                  onClick={() => updateGraduationReview(student.id, 'approved', 'Cleared by Academic Committee')}
                >
                  {t('sis.graduation.approveGraduation')}
                </Button>
              )}

              {grad.eligibilityStatus === 'approved' && (
                <Button
                  kind="tertiary"
                  size="sm"
                  renderIcon={Education}
                  onClick={() => updateGraduationReview(student.id, 'graduated', 'Official High School Diploma Issued')}
                >
                  {t('sis.graduation.issueCertificate')}
                </Button>
              )}
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};
