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
} from '@carbon/react';
import { Add, Printer, Activity } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const ClinicView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [visits, setVisits] = useState([
    { id: '1', date: '2026-09-05', symptoms: 'Sore throat, mild fever', temp: '38.2°C', diagnosis: 'Acute Pharyngitis', treatment: 'Paracetamol, Warm fluid rest', excused: true },
    { id: '2', date: '2026-09-12', symptoms: 'Headache, fatigue', temp: '37.1°C', diagnosis: 'Dehydration', treatment: 'Oral rehydration salts, shade rest', excused: false },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [temp, setTemp] = useState('37.0°C');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [excused, setExcused] = useState(true);

  const handleLogVisit = () => {
    const newVis = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symptoms,
      temp,
      diagnosis,
      treatment,
      excused,
    };
    setVisits([newVis, ...visits]);
    setModalOpen(false);
    setSymptoms('');
    setDiagnosis('');
    setTreatment('');
  };

  const handlePrintExcuse = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Sick Excuse Certificate - ${activeStudent?.firstName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 50px; line-height: 1.6; }
            .cert { border: 2px solid #2e7d32; padding: 40px; max-width: 650px; margin: 0 auto; border-radius: 4px; }
            .header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 20px; margin-bottom: 30px; }
            .sign { margin-top: 50px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="cert">
            <div class="header">
              <h2 style="color: #2e7d32; margin: 0; font-size: 24px;">OFFICIAL MEDICAL EXCUSE CERTIFICATE</h2>
              <p style="margin: 5px 0 0; font-size: 13px;">EduCore Clinic Operations Division</p>
            </div>
            
            <p>This is to certify that student <strong>${activeStudent?.firstName} ${activeStudent?.lastName}</strong> (Student Number: ${activeStudent?.studentNumber || 'STU-1002'}), attending grade level ${activeStudent?.gradeLevel || 'Grade 10'}, was examined at our school health clinic facility on <strong>${new Date().toLocaleDateString()}</strong>.</p>
            
            <p><strong>Clinical Manifestations / Symptoms:</strong> Sore throat, running body temperatures, and respiratory exhaustion.</p>
            <p><strong>Medical Diagnostic Summary:</strong> Influenza-like infection requiring mandatory home care isolation.</p>
            <p><strong>Physician Recommended Advice:</strong> Complete physical bed rest with medication for <strong>2 consecutive days</strong> starting from today.</p>
            
            <p style="font-weight: bold; font-style: italic; color: #2e7d32; margin-top: 30px;">Accordingly, the student is officially excused from classroom attendance requirements.</p>

            <div class="sign">
              <div>
                <p>_______________________</p>
                <p><strong>Attending School Nurse</strong></p>
              </div>
              <div>
                <p>_______________________</p>
                <p><strong>Clinic Stamp & Seal</strong></p>
              </div>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Clinic & Healthcare Portal</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Log health checkups, register body temperature anomalies, track allergies, and print medical sick excuse slips.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Log Clinical Visit
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Printer} onClick={handlePrintExcuse}>
              Print Sick Excuse Slip
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Visits Handled Today</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>12 Visits</div>
            <Tag type="green" size="sm">Standard Intake</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Chronic Allergy Alerts</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-01)' }}>
              {((activeStudent as any).medicalConditions || []).length || 1} Severe
            </div>
            <Tag type="red" size="sm">Emergency Contact Linked</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Clinic Room Temp</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} />
              36.6°C Normal
            </div>
            <Tag type="blue" size="sm">Climate Controlled</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Medical Checkup Log</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Visit Date</TableHeader>
              <TableHeader>Symptoms Presented</TableHeader>
              <TableHeader>Temperature</TableHeader>
              <TableHeader>Diagnostic Judgment</TableHeader>
              <TableHeader>Prescription / Plan</TableHeader>
              <TableHeader>Excuse Granted</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v.id}>
                <TableCell style={{ fontWeight: 600 }}>{v.date}</TableCell>
                <TableCell>{v.symptoms}</TableCell>
                <TableCell style={{ color: Number(v.temp.replace('°C','')) >= 38 ? 'var(--cds-support-01)' : 'var(--cds-text-primary)', fontWeight: 600 }}>
                  {v.temp}
                </TableCell>
                <TableCell>{v.diagnosis}</TableCell>
                <TableCell>{v.treatment}</TableCell>
                <TableCell>
                  <Tag type={v.excused ? 'green' : 'warm-gray'} size="sm">
                    {v.excused ? 'Sick Leave Excuse' : 'No Excuse Needed'}
                  </Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Log Clinical Student Visit"
        primaryButtonText="Save Visit Checkup"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleLogVisit}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="clinic-symptoms"
            labelText="Symptoms Presented"
            placeholder="e.g. Headache, Sore throat, dizzy"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <TextInput
            id="clinic-temp"
            labelText="Recorded Temperature (°C)"
            placeholder="e.g. 37.5°C"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
          />
          <TextInput
            id="clinic-diagnosis"
            labelText="Diagnostic Judgment"
            placeholder="e.g. Common cold, Migraine"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
          <TextInput
            id="clinic-treatment"
            labelText="Prescription / Rest Plan"
            placeholder="e.g. rest in room for 1 hour, water intake"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
