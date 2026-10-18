import React, { useState } from 'react';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { Add, Printer, Calendar, UserAdmin } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const ExamsView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [exams, setExams] = useState([
    { id: '1', code: 'EXM-MATH-10', subject: 'Mathematics I', date: '2026-10-12', time: '09:00 AM - 12:00 PM', hall: 'Ibn Al-Haitham Theater', capacity: 120, assigned: 94, invigilator: 'Eng. Ahmed Al-Sabri' },
    { id: '2', code: 'EXM-SCI-10', subject: 'General Science', date: '2026-10-14', time: '09:00 AM - 11:30 AM', hall: 'Avicenna Hall 4', capacity: 40, assigned: 38, invigilator: 'Dr. Sarah Al-Waseem' },
    { id: '3', code: 'EXM-ARA-10', subject: 'Arabic Language', date: '2026-10-16', time: '10:00 AM - 12:00 PM', hall: 'Ibn Khaldun Hall', capacity: 50, assigned: 45, invigilator: 'Mr. Waleed Al-Hakimi' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('Mathematics I');
  const [examDate, setExamDate] = useState('2026-10-12');
  const [hall, setHall] = useState('Avicenna Hall 4');
  const [invigilator, setInvigilator] = useState('Dr. Sarah Al-Waseem');

  const handleCreateExam = () => {
    const newEx = {
      id: Date.now().toString(),
      code: `EXM-${subject.substring(0, 4).toUpperCase()}-${10 + exams.length}`,
      subject,
      date: examDate,
      time: '09:00 AM - 11:30 AM',
      hall,
      capacity: 50,
      assigned: 0,
      invigilator,
    };
    setExams([...exams, newEx]);
    setModalOpen(false);
  };

  const handlePrintAdmitCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Admit Ticket - ${activeStudent?.firstName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; }
            .ticket { border: 3px double #000; padding: 30px; max-width: 600px; margin: 0 auto; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .student-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .watermark { position: absolute; top: 40%; left: 10%; opacity: 0.1; font-size: 60px; font-weight: bold; transform: rotate(-30deg); pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="watermark">CONFIRMED</div>
            <div class="header">
              <h2 style="margin: 0; font-size: 20px;">OFFICIAL MID-TERM EXAM ENTRY TICKET</h2>
              <span style="font-size: 11px; text-transform: uppercase;">EduCore Ministry Control Board</span>
            </div>
            
            <div class="student-meta">
              <div><strong>Student Number:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</div>
              <div><strong>Grade Level:</strong> ${activeStudent?.gradeLevel || 'Grade 10'}</div>
              <div><strong>Full Name:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</div>
              <div><strong>Campus Unit:</strong> ${activeStudent?.campus || 'Main Taiz Branch'}</div>
            </div>

            <p style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">REGISTERED EXAMINATIONS MATRIX</p>
            <table>
              <thead>
                <tr>
                  <th>Exam Code</th>
                  <th>Course / Subject</th>
                  <th>Scheduled Date</th>
                  <th>Seating Hall Location</th>
                </tr>
              </thead>
              <tbody>
                ${exams.map(ex => `
                  <tr>
                    <td><strong>${ex.code}</strong></td>
                    <td>${ex.subject}</td>
                    <td>${ex.date}<br/><small>${ex.time}</small></td>
                    <td>${ex.hall}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <ul style="font-size: 11px; color: #555; margin-top: 25px; padding-left: 20px;">
              <li>Candidates must report to the allocated exam hall 15 minutes before slot kickoff.</li>
              <li>Calculators or mechanical electronics are strictly regulated inside Avicenna and Ibn Khaldun rooms.</li>
              <li>Government Iqama / Student ID is mandatory for invigilator vetting.</li>
            </ul>

            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
              <div>Registrar Signature:<br/><strong>Systems Control Desk</strong></div>
              <div>Controller Stamp:<br/>_________________</div>
            </div>
          </div>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Examinations & Control Board</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Design physical exams seating, assign faculty invigilator rotations, and issue entry permit vouchers.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Schedule New Exam
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Printer} onClick={handlePrintAdmitCard}>
              Print Entry Permit Ticket
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Scheduled Sessions</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>{exams.length} Slots</div>
            <Tag type="blue" size="sm">October Intake</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Assigned Halls & Rooms</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>3 Halls</div>
            <Tag type="green" size="sm">Capacity Audited</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Active Invigilators</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>4 Teachers</div>
            <Tag type="purple" size="sm">Fully Delegated</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Master Exam Control Timetable</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Exam Code</TableHeader>
              <TableHeader>Subject Course</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Duration</TableHeader>
              <TableHeader>Seating Hall</TableHeader>
              <TableHeader>Invigilator Name</TableHeader>
              <TableHeader>Allotted Capacity</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell style={{ fontWeight: 600 }}>{ex.code}</TableCell>
                <TableCell>{ex.subject}</TableCell>
                <TableCell style={{ fontWeight: 600 }}>{ex.date}</TableCell>
                <TableCell>{ex.time}</TableCell>
                <TableCell>{ex.hall}</TableCell>
                <TableCell>
                  <Tag type="teal" size="sm">{ex.invigilator}</Tag>
                </TableCell>
                <TableCell>{ex.assigned} / {ex.capacity} Desks</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Schedule Institutional Exam Slot"
        primaryButtonText="Publish Schedule"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleCreateExam}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="ex-subject"
            labelText="Course / Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextInput
            id="ex-date"
            labelText="Exam Date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <Select
            id="ex-hall"
            labelText="Allocated Seating Hall"
            value={hall}
            onChange={(e) => setHall(e.target.value)}
          >
            <SelectItem value="Ibn Al-Haitham Theater" text="Ibn Al-Haitham Theater" />
            <SelectItem value="Avicenna Hall 4" text="Avicenna Hall 4" />
            <SelectItem value="Ibn Khaldun Hall" text="Ibn Khaldun Hall" />
          </Select>
          <Select
            id="ex-invigilator"
            labelText="Assigned Faculty Invigilator"
            value={invigilator}
            onChange={(e) => setInvigilator(e.target.value)}
          >
            <SelectItem value="Eng. Ahmed Al-Sabri" text="Eng. Ahmed Al-Sabri" />
            <SelectItem value="Dr. Sarah Al-Waseem" text="Dr. Sarah Al-Waseem" />
            <SelectItem value="Mr. Waleed Al-Hakimi" text="Mr. Waleed Al-Hakimi" />
          </Select>
        </div>
      </Modal>
    </div>
  );
};
