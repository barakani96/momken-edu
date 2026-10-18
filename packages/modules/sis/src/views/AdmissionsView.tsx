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
import { Add, Checkmark, Close, Document, Send, Printer } from '@carbon/icons-react';

export const AdmissionsView: React.FC = () => {
  const [applications, setApplications] = useState([
    { id: '1', name: 'Zaid bin Mohammed', targetGrade: 'Grade 10', date: '2026-09-01', stage: 'Under Review', score: 88, feeQuote: 1500 },
    { id: '2', name: 'Fatima Al-Hamadani', targetGrade: 'Grade 9', date: '2026-09-02', stage: 'Exam Pending', score: 0, feeQuote: 1200 },
    { id: '3', name: 'Suhail Bin Al-Wazir', targetGrade: 'Grade 11', date: '2026-09-03', stage: 'Interview', score: 95, feeQuote: 1800 },
    { id: '4', name: 'Arwa Al-Mikhlafi', targetGrade: 'Grade 10', date: '2026-09-04', stage: 'Accepted', score: 92, feeQuote: 1500 },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('Grade 10');
  const [feeQuote, setFeeQuote] = useState(1500);

  const handleCreateApplication = () => {
    const newApp = {
      id: Date.now().toString(),
      name: newName,
      targetGrade: newGrade,
      date: new Date().toISOString().split('T')[0],
      stage: 'Submitted',
      score: 0,
      feeQuote: Number(feeQuote),
    };
    setApplications([...applications, newApp]);
    setModalOpen(false);
    setNewName('');
  };

  const handleUpdateStage = (id: string, stage: string) => {
    setApplications(applications.map(a => a.id === id ? { ...a, stage } : a));
  };

  const generateAdmissionInvoice = (app: typeof applications[0]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Quote & Fee Statement</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>EDUCORE ADMISSIONS INVOICE QUOTE</h2>
            <p>Application Ref: APP-${app.id}</p>
          </div>
          <p><strong>Applicant Name:</strong> ${app.name}</p>
          <p><strong>Target Grade Level:</strong> ${app.targetGrade}</p>
          <p><strong>Offer Date:</strong> ${app.date}</p>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Application & Assessment Fee</td>
                <td>$150.00</td>
              </tr>
              <tr>
                <td>Tuition Fee Quote (${app.targetGrade})</td>
                <td>$${app.feeQuote}.00</td>
              </tr>
              <tr>
                <td>Facility & Lab Accessories</td>
                <td>$250.00</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>Total Quote Due</td>
                <td>$${app.feeQuote + 400}.00</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 40px; font-size: 14px;">Please finalize payment with the Finance Office to guarantee class seat allocation.</p>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Admissions Office & Intake</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Track the intake pipeline of prospective student applications and generate initial fee quotes.
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            Record New Application
          </Button>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        {['Submitted', 'Under Review', 'Interview', 'Accepted'].map((stage) => (
          <Column sm={4} md={2} lg={4} key={stage}>
            <Tile style={{ height: '100%', borderTop: '4px solid var(--cds-interactive-01)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{stage}</span>
              <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>
                {applications.filter((a) => a.stage === stage).length}
              </div>
            </Tile>
          </Column>
        ))}
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Prospective Applicants Pipeline</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Applicant Name</TableHeader>
              <TableHeader>Grade</TableHeader>
              <TableHeader>Date Filed</TableHeader>
              <TableHeader>Pipeline Stage</TableHeader>
              <TableHeader>Exam Score</TableHeader>
              <TableHeader>Fee Quote</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell style={{ fontWeight: 600 }}>{app.name}</TableCell>
                <TableCell>{app.targetGrade}</TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <Tag
                    type={
                      app.stage === 'Accepted'
                        ? 'green'
                        : app.stage === 'Interview'
                        ? 'blue'
                        : app.stage === 'Exam Pending'
                        ? 'purple'
                        : 'warm-gray'
                    }
                    size="sm"
                  >
                    {app.stage}
                  </Tag>
                </TableCell>
                <TableCell>{app.score > 0 ? `${app.score}%` : 'N/A'}</TableCell>
                <TableCell>${app.feeQuote}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button kind="ghost" size="sm" onClick={() => generateAdmissionInvoice(app)} renderIcon={Printer}>
                      Quote Invoice
                    </Button>
                    <Select
                      id={`stage-select-${app.id}`}
                      labelText=""
                      inline
                      hideLabel
                      value={app.stage}
                      onChange={(e) => handleUpdateStage(app.id, e.target.value)}
                    >
                      <SelectItem value="Submitted" text="Submitted" />
                      <SelectItem value="Under Review" text="Under Review" />
                      <SelectItem value="Exam Pending" text="Exam Pending" />
                      <SelectItem value="Interview" text="Interview" />
                      <SelectItem value="Accepted" text="Accepted" />
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Record New Intake Application"
        primaryButtonText="Submit Application"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleCreateApplication}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="app-name"
            labelText="Applicant Full Name"
            placeholder="e.g. Zaid bin Mohammed"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Select
            id="app-grade"
            labelText="Target Grade Level"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
          >
            <SelectItem value="Grade 9" text="Grade 9" />
            <SelectItem value="Grade 10" text="Grade 10" />
            <SelectItem value="Grade 11" text="Grade 11" />
            <SelectItem value="Grade 12" text="Grade 12" />
          </Select>
          <TextInput
            id="app-quote"
            labelText="Negotiated Tuition Base (USD)"
            type="number"
            value={feeQuote}
            onChange={(e) => setFeeQuote(Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
};
