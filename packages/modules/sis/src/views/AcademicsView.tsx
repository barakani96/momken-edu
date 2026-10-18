import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { Add, Education, Document, Printer } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const AcademicsView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('MATH101');
  const [assessmentType, setAssessmentType] = useState('Midterm');
  const [score, setScore] = useState(85);
  const [weight, setWeight] = useState(25);

  const [subjects, setSubjects] = useState([
    { code: 'MATH101', nameEn: 'Mathematics I', nameAr: 'الرياضيات ١', credits: 4, grade: 'A+' },
    { code: 'SCI102', nameEn: 'General Science', nameAr: 'العلوم العامة', credits: 3, grade: 'B+' },
    { code: 'ARA101', nameEn: 'Arabic Language', nameAr: 'اللغة العربية', credits: 3, grade: 'A' },
    { code: 'ENG101', nameEn: 'English Grammar', nameAr: 'قواعد اللغة الإنجليزية', credits: 3, grade: 'A-' },
    { code: 'HIS101', nameEn: 'Islamic History', nameAr: 'التاريخ الإسلامي', credits: 2, grade: 'A+' },
  ]);

  const [assessments, setAssessments] = useState([
    { id: '1', subjectCode: 'MATH101', type: 'Homework 1', score: 95, weight: 10, date: '2026-09-01' },
    { id: '2', subjectCode: 'MATH101', type: 'Quiz 1', score: 88, weight: 15, date: '2026-09-05' },
    { id: '3', subjectCode: 'SCI102', type: 'Lab Report 1', score: 82, weight: 20, date: '2026-09-03' },
    { id: '4', subjectCode: 'ARA101', type: 'Oral Exam', score: 98, weight: 15, date: '2026-09-07' },
  ]);

  const handleAddAssessment = () => {
    const newAss = {
      id: Date.now().toString(),
      subjectCode: selectedSubject,
      type: assessmentType,
      score: Number(score),
      weight: Number(weight),
      date: new Date().toISOString().split('T')[0],
    };
    setAssessments([...assessments, newAss]);
    setAssessmentModalOpen(false);
  };

  const calculateGpa = () => {
    return activeStudent?.gpa || 3.8;
  };

  const handlePrintTranscript = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Academic Transcript - ${activeStudent?.firstName} ${activeStudent?.lastName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; direction: ltr; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3f51b5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-placeholder { font-size: 24px; font-weight: bold; color: #3f51b5; }
            .student-info { margin-bottom: 30px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { backgroundColor: #f2f2f2; }
            .gpa { font-size: 18px; font-weight: bold; margin-top: 30px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">EDUCORE MONOLITH ERP</div>
            <div>OFFICIAL ACADEMIC TRANSCRIPT</div>
          </div>
          <div class="student-info">
            <h2>${activeStudent?.firstName} ${activeStudent?.lastName}</h2>
            <p><strong>Student Number:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</p>
            <p><strong>Grade Level:</strong> ${activeStudent?.gradeLevel || 'Grade 10'}</p>
            <p><strong>Campus:</strong> ${activeStudent?.campus || 'Main Taiz Campus'}</p>
            <p><strong>Enrollment Date:</strong> ${activeStudent?.enrollmentDate || '2026-09-01'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name (EN)</th>
                <th>اسم المادة (AR)</th>
                <th>Credits</th>
                <th>Letter Grade</th>
              </tr>
            </thead>
            <tbody>
              ${subjects.map(s => `
                <tr>
                  <td>${s.code}</td>
                  <td>${s.nameEn}</td>
                  <td>${s.nameAr}</td>
                  <td>${s.credits}</td>
                  <td><strong>${s.grade}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="gpa">
            Cumulative GPA: ${calculateGpa()} / 4.0
          </div>
          <p style="margin-top: 50px; text-align: center; font-size: 12px; color: #777;">
            This transcript is digitally generated and certified by the Registrar Office on ${new Date().toLocaleDateString()}.
          </p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Academics & Gradebook</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Manage subject credit weightings, input assessment grades, and print certified transcripts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setAssessmentModalOpen(true)}>
              Record Grade / Assessment
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Printer} onClick={handlePrintTranscript}>
              Print Official Transcript
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Cumulative GPA</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-interactive-01)' }}>
              {calculateGpa()}
            </div>
            <Tag type="green" size="sm">Excellent Academic Standing</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Total Registered Credits</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0' }}>
              {subjects.reduce((acc, curr) => acc + curr.credits, 0)} Hrs
            </div>
            <Tag type="blue" size="sm">Full-Time Load</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Coursework Completion</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-02)' }}>
              94.5%
            </div>
            <Tag type="warm-gray" size="sm">No Outstanding Incompletes</Tag>
          </Tile>
        </Column>
      </Grid>

      <Grid>
        <Column sm={4} md={8} lg={8}>
          <Tile>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Education size={18} />
              Subject Curricula & Letter Grades
            </h4>
            <Table size="lg">
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Subject Name (EN)</TableHeader>
                  <TableHeader>اسم المادة (AR)</TableHeader>
                  <TableHeader>Credits</TableHeader>
                  <TableHeader>Grade</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((sub) => (
                  <TableRow key={sub.code}>
                    <TableCell style={{ fontWeight: 600 }}>{sub.code}</TableCell>
                    <TableCell>{sub.nameEn}</TableCell>
                    <TableCell style={{ direction: 'rtl', textAlign: 'right' }}>{sub.nameAr}</TableCell>
                    <TableCell>{sub.credits} Hrs</TableCell>
                    <TableCell>
                      <Tag type="blue" size="sm" style={{ fontWeight: 600 }}>{sub.grade}</Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Document size={18} />
              Recent Assessment Log
            </h4>
            <Table size="lg">
              <TableHead>
                <TableRow>
                  <TableHeader>Subject</TableHeader>
                  <TableHeader>Assessment</TableHeader>
                  <TableHeader>Score</TableHeader>
                  <TableHeader>Weight</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.map((ass) => (
                  <TableRow key={ass.id}>
                    <TableCell style={{ fontWeight: 600 }}>{ass.subjectCode}</TableCell>
                    <TableCell>{ass.type}</TableCell>
                    <TableCell>
                      <strong style={{ color: ass.score >= 90 ? 'var(--cds-support-02)' : 'var(--cds-text-primary)' }}>
                        {ass.score}%
                      </strong>
                    </TableCell>
                    <TableCell>{ass.weight}%</TableCell>
                    <TableCell>{ass.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tile>
        </Column>
      </Grid>

      <Modal
        open={assessmentModalOpen}
        modalHeading="Record New Assessment Grade"
        primaryButtonText="Save Assessment"
        secondaryButtonText="Cancel"
        onRequestClose={() => setAssessmentModalOpen(false)}
        onRequestSubmit={handleAddAssessment}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <Select
            id="subject-select"
            labelText="Select Course / Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <SelectItem key={s.code} value={s.code} text={`${s.code} - ${s.nameEn}`} />
            ))}
          </Select>

          <TextInput
            id="assessment-type"
            labelText="Assessment / Exam Title"
            placeholder="e.g. Midterm, Pop Quiz, Final Project"
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
          />

          <NumberInput
            id="score-input"
            label="Achieved Score (%)"
            min={0}
            max={100}
            value={score}
            onChange={(_, { value }) => setScore(Number(value))}
          />

          <NumberInput
            id="weight-input"
            label="Assessment Weight in Term (%)"
            min={1}
            max={100}
            value={weight}
            onChange={(_, { value }) => setWeight(Number(value))}
          />
        </div>
      </Modal>
    </div>
  );
};
