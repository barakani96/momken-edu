import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Modal,
  Select,
  SelectItem,
  TextInput,
} from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const AcademicPlacementView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, changePlacement } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [campus, setCampus] = useState(student?.campus || 'Main Riyadh Campus');
  const [gradeLevel, setGradeLevel] = useState(student?.gradeLevel || 'Grade 10');
  const [classSection, setClassSection] = useState(student?.classSection || 'Sec-10A');
  const [cohort, setCohort] = useState(student?.cohort || '2027-Cohort');
  const [program, setProgram] = useState(student?.program || 'General Academic Track');

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleUpdatePlacement = () => {
    changePlacement(student.id, {
      campus,
      academicYear: '2026-2027',
      term: 'Fall Semester',
      program,
      gradeLevel,
      classSection,
      cohort,
      startDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.placement.title')}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Current & historical academic placements for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Edit} onClick={() => setModalOpen(true)}>
            {t('sis.placement.changeBtn')}
          </Button>
        </div>
      </Tile>

      {/* Active Placement Tile */}
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-02)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontWeight: 600 }}>{t('sis.placement.currentPlacement')}</h4>
          <Tag type="green">ACTIVE PLACEMENT</Tag>
        </div>

        <Grid>
          <Column sm={4} md={4} lg={4}>
            <div><strong>Campus:</strong> {student.campus}</div>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <div><strong>Program:</strong> {student.program}</div>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <div><strong>Grade & Section:</strong> {student.gradeLevel} ({student.classSection})</div>
          </Column>
          <Column sm={4} md={4} lg={4}>
            <div><strong>Cohort:</strong> {student.cohort}</div>
          </Column>
        </Grid>
      </Tile>

      {/* Historical Placements */}
      <Tile>
        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('sis.placement.placementHistory')}</h4>
        {student.placements.map((p) => (
          <Tile key={p.id} style={{ marginBottom: '0.75rem', background: 'var(--cds-layer-01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{p.campus} - {p.gradeLevel} ({p.classSection})</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                  Program: {p.program} | Cohort: {p.cohort} | Academic Year: {p.academicYear}
                </div>
              </div>
              {p.isCurrent ? <Tag type="green">Current</Tag> : <Tag type="gray">Archived</Tag>}
            </div>
          </Tile>
        ))}
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Update Academic Placement"
        primaryButtonText="Save New Placement"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleUpdatePlacement}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select id="pl-campus" labelText="Campus Assignment" value={campus} onChange={(e) => setCampus(e.target.value)}>
            <SelectItem value="Main Riyadh Campus" text="Main Riyadh Campus" />
            <SelectItem value="Jeddah International Campus" text="Jeddah International Campus" />
            <SelectItem value="Dammam Academy" text="Dammam Academy" />
          </Select>

          <TextInput id="pl-prog" labelText="Program" value={program} onChange={(e) => setProgram(e.target.value)} />
          <TextInput id="pl-grade" labelText="Grade Level" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
          <TextInput id="pl-sec" labelText="Class Section" value={classSection} onChange={(e) => setClassSection(e.target.value)} />
          <TextInput id="pl-cohort" labelText="Cohort" value={cohort} onChange={(e) => setCohort(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};
