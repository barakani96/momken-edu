import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Modal,
  TextInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { Add, Checkmark, Close } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { TermEnrollmentWizard } from './TermEnrollmentWizard';

export const EnrollmentView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, createEnrollment, cancelEnrollment } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [term, setTerm] = useState('Fall Semester');
  const [program, setProgram] = useState(student?.program || 'General Academic Track');
  const [creditHours, setCreditHours] = useState('18');

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleCreateEnrollment = () => {
    createEnrollment(student.id, {
      enrollmentCode: `ENR-2026-F${Math.floor(100 + Math.random() * 900)}`,
      academicYear,
      term,
      program,
      enrollmentType: 'continuing',
      status: 'Enrolled',
      creditHours: parseInt(creditHours) || 16,
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Enrollment & Term Registration Hub</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Managing academic term registrations for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setWizardOpen(true)}>
              Launch Term Registration Wizard
            </Button>
            <Button kind="tertiary" size="sm" onClick={() => setModalOpen(true)}>
              Quick Term Add
            </Button>
          </div>
        </div>
      </Tile>

      <Grid>
        {student.enrollments.map((e) => (
          <Column key={e.id} sm={4} md={8} lg={8}>
            <Tile style={{ marginBottom: '1rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>{e.enrollmentCode}</h4>
                  <p style={{ margin: '0.25rem 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                    {e.academicYear} - {e.term}
                  </p>
                </div>
                <Tag type={e.status === 'Enrolled' ? 'green' : 'red'}>{e.status}</Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0', fontSize: '0.875rem' }}>
                <div><strong>Program:</strong> {e.program}</div>
                <div><strong>Credit Hours Registered:</strong> {e.creditHours} hrs</div>
                <div><strong>Registration Date:</strong> {e.enrollmentDate}</div>
                {e.notes && <div style={{ color: 'var(--cds-support-01)' }}>{e.notes}</div>}
              </div>

              {e.status === 'Enrolled' && (
                <Button
                  kind="danger--ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Cancel this term enrollment registration?')) {
                      cancelEnrollment(student.id, e.id, 'Cancelled by Academic Advisor');
                    }
                  }}
                >
                  Cancel Term Registration
                </Button>
              )}
            </Tile>
          </Column>
        ))}
      </Grid>

      <Modal
        open={modalOpen}
        modalHeading="Register New Term Enrollment"
        primaryButtonText="Confirm Registration"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleCreateEnrollment}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select id="enr-ay" labelText="Academic Year *" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            <SelectItem value="2026-2027" text="2026-2027" />
            <SelectItem value="2027-2028" text="2027-2028" />
          </Select>
          <Select id="enr-term" labelText="Academic Term *" value={term} onChange={(e) => setTerm(e.target.value)}>
            <SelectItem value="Fall Semester" text="Fall Semester" />
            <SelectItem value="Spring Semester" text="Spring Semester" />
            <SelectItem value="Summer Term" text="Summer Term" />
          </Select>
          <TextInput id="enr-prog" labelText="Program *" value={program} onChange={(e) => setProgram(e.target.value)} />
          <TextInput id="enr-credits" labelText="Credit Hours *" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} />
        </div>
      </Modal>

      <TermEnrollmentWizard
        student={student}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
};
