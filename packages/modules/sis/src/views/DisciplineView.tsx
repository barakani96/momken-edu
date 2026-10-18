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
import { Add, Printer, Warning } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const DisciplineView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [behaviorScore, setBehaviorScore] = useState(85);
  const [incidents, setIncidents] = useState([
    { id: '1', date: '2026-09-02', type: 'Merit', points: 15, title: 'Outstanding Volunteering', desc: 'Assisted in organizing the computer lab IT cleanup.', reporter: 'Eng. Ahmed Al-Sabri' },
    { id: '2', date: '2026-09-08', type: 'Demerit', points: -10, title: 'Unexcused Class Interruption', desc: 'Arrived 20 mins late and was disruptive during physics lecture.', reporter: 'Dr. Sarah Al-Waseem' },
    { id: '3', date: '2026-09-12', type: 'Demerit', points: -20, title: 'Smartboard Misuse', desc: 'Tampered with projector calibration without authorization.', reporter: 'IT Admin Services' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState('Demerit');
  const [points, setPoints] = useState(-5);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reporter, setReporter] = useState('Dr. Sarah Al-Waseem');

  const handleLogIncident = () => {
    const newInc = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type,
      points: Number(points),
      title,
      desc,
      reporter,
    };
    setIncidents([newInc, ...incidents]);
    setBehaviorScore(prev => prev + Number(points));
    setModalOpen(false);
    setTitle('');
    setDesc('');
  };

  const handlePrintWarning = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Disciplinary Notice & Conduct Warning - ${activeStudent?.firstName}</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 50px; line-height: 1.6; }
            .border-box { border: 4px double #b71c1c; padding: 40px; max-width: 650px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #b71c1c; padding-bottom: 20px; margin-bottom: 30px; }
            .details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; }
            th { background-color: #ffebee; }
          </style>
        </head>
        <body>
          <div class="border-box">
            <div class="header">
              <h2 style="color: #b71c1c; margin: 0;">OFFICIAL CONDUCT & DISCIPLINARY DECREE</h2>
              <p style="margin: 5px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">EduCore Central Board of Vetting</p>
            </div>
            
            <div class="details">
              <p><strong>To the Guardians of:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</p>
              <p><strong>Student ID Number:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</p>
              <p><strong>Vetting Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Current Standing Conduct Quotient:</strong> <strong style="color: #b71c1c;">${behaviorScore} / 100</strong></p>
            </div>

            <p>This formal notice is issued in light of recent behavioral infractions logged within the modular ERP system. Our disciplinary tracking highlights recurring violations that deviate from the institutional code of conduct:</p>

            <table>
              <thead>
                <tr>
                  <th>Log Date</th>
                  <th>Infraction Incident</th>
                  <th>Quotient Impact</th>
                  <th>Official Reporter</th>
                </tr>
              </thead>
              <tbody>
                ${incidents.filter(inc => inc.type === 'Demerit').map(inc => `
                  <tr>
                    <td>${inc.date}</td>
                    <td><strong>${inc.title}</strong><br/><small>${inc.desc}</small></td>
                    <td><span style="color: #b71c1c;">${inc.points} pts</span></td>
                    <td>${inc.reporter}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <p style="margin-top: 30px; font-weight: bold;">Continued failure to comply with campus behavioral guidelines will result in an immediate hearing before the Principal's board of suspension.</p>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px;">
              <div>Vetting Dean:<br/><strong>Academic Affairs</strong></div>
              <div>School Seal:<br/>_________________</div>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Discipline & Behavior</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Administer merit and demerit logs, calculate term behavior quotients, and automatically print formal warning decrees.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Record Incident Entry
            </Button>
            {behaviorScore < 90 && (
              <Button kind="danger" size="sm" renderIcon={Warning} onClick={handlePrintWarning}>
                Print Disciplinary Warn Notice
              </Button>
            )}
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Term Behavior Quotient</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: behaviorScore < 80 ? 'var(--cds-support-01)' : 'var(--cds-support-02)' }}>
              {behaviorScore} / 100
            </div>
            <Tag type={behaviorScore >= 90 ? 'green' : behaviorScore >= 75 ? 'purple' : 'red'} size="sm">
              {behaviorScore >= 90 ? 'Excellent Standing' : behaviorScore >= 75 ? 'Conditional Watch' : 'Severe Conduct Probation'}
            </Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Registered Demerit Marks</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-01)' }}>
              {incidents.filter(i => i.type === 'Demerit').length} Logged
            </div>
            <Tag type="warm-gray" size="sm">Requiring Active Counseling</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Acquired Merit Merits</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-02)' }}>
              {incidents.filter(i => i.type === 'Merit').length} Commended
            </div>
            <Tag type="blue" size="sm">Points Applied to GPA</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Behavioral Conduct Log Trails</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Impact</TableHeader>
              <TableHeader>Incident / Title</TableHeader>
              <TableHeader>Detailed Narrative</TableHeader>
              <TableHeader>Official Reporter</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((inc) => (
              <TableRow key={inc.id}>
                <TableCell style={{ fontWeight: 600 }}>{inc.date}</TableCell>
                <TableCell>
                  <Tag type={inc.type === 'Merit' ? 'green' : 'red'} size="sm">{inc.type}</Tag>
                </TableCell>
                <TableCell style={{ fontWeight: 600, color: inc.type === 'Merit' ? 'var(--cds-support-02)' : 'var(--cds-support-01)' }}>
                  {inc.points > 0 ? `+${inc.points}` : inc.points} pts
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{inc.title}</TableCell>
                <TableCell style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{inc.desc}</TableCell>
                <TableCell>
                  <Tag type="cool-gray" size="sm">{inc.reporter}</Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Record Disciplinary / Merit Entry"
        primaryButtonText="Save Incident"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleLogIncident}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <Select
            id="inc-type"
            labelText="Incident Classification"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPoints(e.target.value === 'Merit' ? 10 : -10);
            }}
          >
            <SelectItem value="Merit" text="Academic Merit / Commendation" />
            <SelectItem value="Demerit" text="Disciplinary Demerit / Infraction" />
          </Select>
          <TextInput
            id="inc-points"
            labelText="Point Weight Allocation"
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
          <TextInput
            id="inc-title"
            labelText="Incident Title"
            placeholder="e.g. Excessive Tardiness, Classroom Leadership"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextInput
            id="inc-desc"
            labelText="Detailed Narrative Description"
            placeholder="Provide context and background details..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
