import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Select,
  SelectItem,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
} from '@carbon/react';
import { Checkmark, Close, Warning, Printer, Add } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const AttendanceView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('Present');
  const [period, setPeriod] = useState('Period 1');
  const [subject, setSubject] = useState('Mathematics');
  const [notes, setNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [records, setRecords] = useState([
    { id: '1', date: '2026-09-10', period: 1, subject: 'Mathematics', status: 'Present', notes: 'Arrived on time' },
    { id: '2', date: '2026-09-10', period: 2, subject: 'General Science', status: 'Present', notes: '' },
    { id: '3', date: '2026-09-11', period: 1, subject: 'Arabic Language', status: 'Late', notes: 'School bus was delayed' },
    { id: '4', date: '2026-09-11', period: 2, subject: 'English Grammar', status: 'Absent', notes: 'No excuse submitted' },
    { id: '5', date: '2026-09-12', period: 1, subject: 'Islamic History', status: 'Absent', notes: 'Sickness - parents notified' },
    { id: '6', date: '2026-09-13', period: 1, subject: 'Mathematics', status: 'Absent', notes: 'Family emergency' },
  ]);

  const handleAddRecord = () => {
    const newRec = {
      id: Date.now().toString(),
      date,
      period: parseInt(period.split(' ')[1]) || 1,
      subject,
      status: selectedStatus,
      notes,
    };
    setRecords([newRec, ...records]);
    setModalOpen(false);
    setNotes('');
  };

  const absencesCount = records.filter(r => r.status === 'Absent').length;
  const totalCount = records.length;
  const attendanceRate = totalCount ? Math.round(((totalCount - absencesCount) / totalCount) * 100) : 100;

  const handlePrintWarningLetter = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Truancy Warning Letter - ${activeStudent?.firstName} ${activeStudent?.lastName}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 50px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #e53935; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 26px; font-weight: bold; color: #e53935; }
            .content { font-size: 16px; margin-bottom: 40px; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .rtl { direction: rtl; text-align: right; font-family: 'Simplified Arabic', 'Amiri', serif; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">EDUCORE CENTRAL REGISTRAR OFFICE</div>
            <div style="font-size: 14px; margin-top: 5px; color: #777;">OFFICIAL TRUANCY WARNING DECREE / إنذار رسمي للغياب المتكرر</div>
          </div>
          
          <div class="content rtl">
            <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>إلى ولي أمر الطالب:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</p>
            <p><strong>رقم الطالب:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</p>
            <hr/>
            <p style="font-weight: bold; font-size: 18px; color: #e53935;">الموضوع: إنذار غياب نهائي بسبب الانقطاع عن الدراسة</p>
            <p>
              نود إحاطتكم علماً بأن ابنكم/ابنتكم قد تجاوز الحد المسموح به للغياب بدون عذر مقبول، حيث بلغ عدد أيام الغياب <strong>${absencesCount} أيام</strong> من أصل <strong>${totalCount} حصة مسجلة</strong>، مما أدى إلى انخفاض نسبة الحضور إلى <strong>${attendanceRate}%</strong>.
            </p>
            <p>
              بناءً على اللائحة التنظيمية لوزارة التعليم، نرجو منكم مراجعة إدارة المدرسة فوراً لتقديم الأعذار الرسمية ولتجنب اتخاذ إجراء الفصل أو الحرمان الأكاديمي المؤقت.
            </p>
          </div>
          
          <div class="content" style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px;">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>To the Guardian of Student:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</p>
            <p><strong>Student ID:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</p>
            <hr/>
            <p style="font-weight: bold; font-size: 18px; color: #e53935;">Subject: Final Attendance / Truancy Warning Notice</p>
            <p>
              Please be advised that your child has exceeded the maximum permissible unexcused absences. Our database records show <strong>${absencesCount} absences</strong> out of <strong>${totalCount} total classes</strong>, dropping their overall attendance rate to <strong>${attendanceRate}%</strong>.
            </p>
            <p>
              Pursuant to official school board policy, you are urgently requested to contact the Principal's office within 48 hours to justify these absences and avoid severe academic suspension.
            </p>
          </div>

          <div class="signature">
            <div>
              <p>__________________________</p>
              <p><strong>Registrar Officer / مسؤول التسجيل</strong></p>
            </div>
            <div>
              <p>__________________________</p>
              <p><strong>School Seal / ختم المدرسة</strong></p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Attendance & Truancy</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Mark lesson attendance, track cumulative truancy ratios, and automatically output formal compliance warnings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Mark Attendance
            </Button>
            {absencesCount >= 3 && (
              <Button kind="danger" size="sm" renderIcon={Warning} onClick={handlePrintWarningLetter}>
                Print Truancy Warning Letter ({absencesCount} Absences)
              </Button>
            )}
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Attendance Rate</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: attendanceRate < 85 ? 'var(--cds-support-01)' : 'var(--cds-support-02)' }}>
              {attendanceRate}%
            </div>
            <Tag type={attendanceRate >= 90 ? 'green' : attendanceRate >= 80 ? 'purple' : 'red'} size="sm">
              {attendanceRate >= 90 ? 'Optimal Attendance' : attendanceRate >= 80 ? 'Needs Attention' : 'Severe Truancy Threat'}
            </Tag>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Total Absence Days</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0', color: absencesCount >= 3 ? 'var(--cds-support-01)' : 'var(--cds-text-primary)' }}>
              {absencesCount} Days
            </div>
            <Tag type={absencesCount >= 3 ? 'red' : 'cool-gray'} size="sm">
              {absencesCount >= 3 ? 'Warning Issued' : 'Acceptable Limits'}
            </Tag>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Excused Absences</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0' }}>
              {records.filter(r => r.status === 'Absent' && r.notes.toLowerCase().includes('sick')).length} Days
            </div>
            <Tag type="blue" size="sm">Validated via Clinic Portal</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Attendance Log Trail
        </h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Period</TableHeader>
              <TableHeader>Subject</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Notes</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell style={{ fontWeight: 600 }}>{r.date}</TableCell>
                <TableCell>Period {r.period}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell>
                  <Tag
                    type={r.status === 'Present' ? 'green' : r.status === 'Late' ? 'purple' : 'red'}
                    size="sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {r.status === 'Present' ? <Checkmark size={12} /> : r.status === 'Late' ? <Warning size={12} /> : <Close size={12} />}
                    {r.status}
                  </Tag>
                </TableCell>
                <TableCell style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                  {r.notes || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Log Lesson Attendance"
        primaryButtonText="Save Attendance Mark"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddRecord}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="date-input"
            type="date"
            labelText="Attendance Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            id="period-select"
            labelText="Class Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <SelectItem value="Period 1" text="Period 1" />
            <SelectItem value="Period 2" text="Period 2" />
            <SelectItem value="Period 3" text="Period 3" />
            <SelectItem value="Period 4" text="Period 4" />
          </Select>

          <Select
            id="subject-select"
            labelText="Select Course / Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <SelectItem value="Mathematics" text="Mathematics" />
            <SelectItem value="General Science" text="General Science" />
            <SelectItem value="Arabic Language" text="Arabic Language" />
            <SelectItem value="English Grammar" text="English Grammar" />
          </Select>

          <Select
            id="status-select"
            labelText="Attendance Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <SelectItem value="Present" text="Present" />
            <SelectItem value="Late" text="Late" />
            <SelectItem value="Absent" text="Absent" />
          </Select>

          <TextInput
            id="notes-input"
            labelText="Excuses / Notes"
            placeholder="e.g. Medical certificate uploaded, late transit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
