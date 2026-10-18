import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Button,
  Tag,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Modal,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Phone,
  Email,
  Location,
  Document,
  Edit,
  Add,
  Checkmark,
  Flow,
  Education,
  Certificate,
  Identification,
  View,
  FolderDetails,
  Calendar,
  UserMultiple,
} from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import {
  AcademicCourseRecord,
  DocumentCategory,
  DocumentType,
  StudentAttendanceRecord,
  StudentDocument,
  TermGpaSnapshot,
  MonthlyAttendanceMetric,
  resolveDocumentCategory,
} from '../sisTypes';
import { DocumentInspectorModal } from './DocumentInspectorModal';
import { StatusBadge } from '@schools/ui';


const FALLBACK_ACADEMIC_RECORDS: AcademicCourseRecord[] = [
  { id: 'f_ar1', code: 'MATH-301', nameEn: 'Advanced Calculus & Analytical Geometry', nameAr: 'التفاضل والتكامل المتقدم والهندسة التحليلية', term: 'Fall 2026', credits: 4, courseworkScore: 95, finalExamScore: 93, totalScore: 94, grade: 'A+', instructor: 'Dr. Ibrahim Al-Mansoor', status: 'In Progress' },
  { id: 'f_ar2', code: 'PHYS-302', nameEn: 'Honors Electromagnetism & Mechanics', nameAr: 'الكهرومغناطيسية والميكانيكا المتقدمة', term: 'Fall 2026', credits: 4, courseworkScore: 91, finalExamScore: 89, totalScore: 90, grade: 'A', instructor: 'Eng. Tariq Al-Subaie', status: 'In Progress' },
  { id: 'f_ar3', code: 'CS-305', nameEn: 'Data Structures & Algorithmic Systems', nameAr: 'هياكل البيانات والنظم الخوارزمية', term: 'Fall 2026', credits: 3, courseworkScore: 97, finalExamScore: 96, totalScore: 96, grade: 'A+', instructor: 'Dr. Sarah Al-Waseem', status: 'In Progress' },
  { id: 'f_ar4', code: 'CHEM-301', nameEn: 'Organic & Analytical Chemistry', nameAr: 'الكيمياء العضوية والتحليلية', term: 'Fall 2026', credits: 3, courseworkScore: 88, finalExamScore: 86, totalScore: 87, grade: 'B+', instructor: 'Dr. Nadia Al-Harbi', status: 'In Progress' },
  { id: 'f_ar5', code: 'ARAB-301', nameEn: 'Rhetoric & Classical Arabic Literature', nameAr: 'البلاغة والأدب العربي الكلاسيكي', term: 'Fall 2026', credits: 2, courseworkScore: 94, finalExamScore: 92, totalScore: 93, grade: 'A', instructor: 'Mr. Waleed Al-Hakimi', status: 'In Progress' },
];

const FALLBACK_TERM_GPA: TermGpaSnapshot[] = [
  { term: 'Fall 2024', gpa: 3.68, credits: 16 },
  { term: 'Spring 2025', gpa: 3.74, credits: 18 },
  { term: 'Fall 2025', gpa: 3.81, credits: 18 },
  { term: 'Spring 2026', gpa: 3.85, credits: 18 },
  { term: 'Fall 2026', gpa: 3.85, credits: 16 },
];

const FALLBACK_ATTENDANCE_RECORDS: StudentAttendanceRecord[] = [
  { id: 'f_att1', date: '2026-10-08', period: 1, subject: 'Advanced Calculus', checkInTime: '07:43 AM', status: 'Present', notes: 'Biometric gate check-in' },
  { id: 'f_att2', date: '2026-10-08', period: 2, subject: 'Honors Electromagnetism', checkInTime: '08:45 AM', status: 'Present', notes: '' },
  { id: 'f_att3', date: '2026-10-07', period: 1, subject: 'Data Structures & Systems', checkInTime: '07:56 AM', status: 'Late', notes: 'School bus transit delay' },
  { id: 'f_att4', date: '2026-10-06', period: 3, subject: 'Organic Chemistry', checkInTime: '10:00 AM', status: 'Present', notes: '' },
  { id: 'f_att5', date: '2026-10-02', period: 1, subject: 'Rhetoric & Arabic Lit', checkInTime: '—', status: 'Excused', notes: 'Authorized academic competition' },
];

const FALLBACK_MONTHLY_ATTENDANCE: MonthlyAttendanceMetric[] = [
  { month: 'Sep', rate: 98.0, presentDays: 21, absentDays: 0 },
  { month: 'Oct', rate: 96.5, presentDays: 20, absentDays: 1 },
  { month: 'Nov', rate: 97.2, presentDays: 19, absentDays: 0 },
  { month: 'Dec', rate: 96.0, presentDays: 18, absentDays: 1 },
  { month: 'Jan', rate: 97.8, presentDays: 16, absentDays: 0 },
];

type ProfileViewSection = 'dashboard' | 'academics' | 'attendance' | 'personal' | 'files';

export const StudentProfileView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    students,
    activeStudentId,
    setActiveTab,
    updateStudent,
    changeStudentStatus,
    addDocument,
    updateDocumentStatus,
    updateDocumentCategory,
    addAcademicRecord,
    addAttendanceRecord,
  } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  // Active section filter ('dashboard' shows the cohesive 360 layout)
  const [activeSection, setActiveSection] = useState<ProfileViewSection>('dashboard');
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState<'all' | DocumentCategory>('all');

  // Edit Personal Details Modal State
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [firstName, setFirstName] = useState(student?.firstName || '');
  const [lastName, setLastName] = useState(student?.lastName || '');
  const [nationalId, setNationalId] = useState(student?.nationalId || '');
  const [phone, setPhone] = useState(student?.contact.phone || '');
  const [email, setEmail] = useState(student?.contact.email || '');
  const [street, setStreet] = useState(student?.address.street || '');
  const [city, setCity] = useState(student?.address.city || '');

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setNationalId(student.nationalId);
      setPhone(student.contact.phone);
      setEmail(student.contact.email);
      setStreet(student.address.street);
      setCity(student.address.city);
    }
  }, [student]);

  // Lifecycle Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(student?.status || 'active');
  const [statusReason, setStatusReason] = useState('');

  // Record Grade Modal State
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('BIO-304');
  const [courseNameEn, setCourseNameEn] = useState('Molecular Biology & Genetics');
  const [courseNameAr, setCourseNameAr] = useState('الأحياء الجزيئية وعلم الوراثة');
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseworkScore, setCourseworkScore] = useState(94);
  const [finalExamScore, setFinalExamScore] = useState(92);
  const [instructorName, setInstructorName] = useState('Dr. Faisal Al-Qahtani');

  // Log Attendance Modal State
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attPeriod, setAttPeriod] = useState(1);
  const [attSubject, setAttSubject] = useState('Advanced Calculus');
  const [attStatus, setAttStatus] = useState<'Present' | 'Late' | 'Absent' | 'Excused'>('Present');
  const [attNotes, setAttNotes] = useState('');

  // Upload Document Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docCategory, setDocCategory] = useState<DocumentCategory>('academic_transcripts');
  const [docType, setDocType] = useState<DocumentType>('Official Academic Transcript');
  const [docName, setDocName] = useState('');
  const [docSerial, setDocSerial] = useState('');

  // Document Inspector Modal State
  const [inspectedDoc, setInspectedDoc] = useState<StudentDocument | null>(null);

  // Advisor Note State
  const [noteText, setNoteText] = useState('');

  const academicRecords = useMemo(() => {
    if (!student) return [];
    return student.academicRecords && student.academicRecords.length > 0
      ? student.academicRecords
      : FALLBACK_ACADEMIC_RECORDS;
  }, [student]);

  const termGpaHistory = useMemo(() => {
    if (!student) return [];
    return student.termGpaHistory && student.termGpaHistory.length > 0
      ? student.termGpaHistory
      : FALLBACK_TERM_GPA;
  }, [student]);

  const attendanceRecords = useMemo(() => {
    if (!student) return [];
    return student.attendanceRecords && student.attendanceRecords.length > 0
      ? student.attendanceRecords
      : FALLBACK_ATTENDANCE_RECORDS;
  }, [student]);

  const monthlyAttendance = useMemo(() => {
    if (!student) return [];
    return student.monthlyAttendance && student.monthlyAttendance.length > 0
      ? student.monthlyAttendance
      : FALLBACK_MONTHLY_ATTENDANCE;
  }, [student]);

  const attendanceCounts = useMemo(() => {
    const counts = { Present: 0, Late: 0, Excused: 0, Absent: 0 };
    attendanceRecords.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [attendanceRecords]);

  const fileCategoryBreakdown = useMemo(() => {
    const counts = {
      academic_transcripts: 0,
      certificates: 0,
      id_documents: 0,
      medical_consent: 0,
      verified: 0,
    };
    if (!student) return counts;
    student.documents.forEach((d) => {
      const cat = resolveDocumentCategory(d);
      counts[cat] = (counts[cat] || 0) + 1;
      if (d.status === 'Verified') counts.verified += 1;
    });
    return counts;
  }, [student]);

  const filteredStudentDocs = useMemo(() => {
    if (!student) return [];
    if (vaultCategoryFilter === 'all') return student.documents;
    return student.documents.filter((d) => resolveDocumentCategory(d) === vaultCategoryFilter);
  }, [student, vaultCategoryFilter]);

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No student selected</h3>
        <Button
          kind="primary"
          size="sm"
          onClick={() => {
            setActiveTab('directory');
            navigate('/sis/directory');
          }}
        >
          {t('sis.student360.backToDirectory')}
        </Button>
      </Tile>
    );
  }

  const totalActiveCredits = academicRecords.reduce((acc, r) => acc + r.credits, 0);
  const effectiveAttendanceRate = student.attendanceRate ?? 97.2;

  const handleSavePersonal = () => {
    updateStudent(student.id, {
      firstName,
      lastName,
      nationalId,
      contact: {
        ...student.contact,
        phone,
        email,
      },
      address: {
        ...student.address,
        street,
        city,
      },
    });
    setEditPersonalOpen(false);
  };

  const handleSaveStatus = () => {
    changeStudentStatus(
      student.id,
      newStatus,
      statusReason || 'Administrative status update',
      new Date().toISOString().split('T')[0]
    );
    setStatusModalOpen(false);
  };

  const handleSaveGrade = () => {
    const total = Math.round(courseworkScore * 0.4 + finalExamScore * 0.6);
    const letter =
      total >= 95
        ? 'A+'
        : total >= 90
        ? 'A'
        : total >= 85
        ? 'B+'
        : total >= 80
        ? 'B'
        : total >= 70
        ? 'C'
        : 'D';

    addAcademicRecord(student.id, {
      code: courseCode.toUpperCase(),
      nameEn: courseNameEn,
      nameAr: courseNameAr || courseNameEn,
      term: 'Fall 2026',
      credits: Number(courseCredits) || 3,
      courseworkScore: Number(courseworkScore),
      finalExamScore: Number(finalExamScore),
      totalScore: total,
      grade: letter,
      instructor: instructorName,
      status: 'In Progress',
    });
    setGradeModalOpen(false);
  };

  const handleSaveAttendance = () => {
    addAttendanceRecord(student.id, {
      date: attDate,
      period: Number(attPeriod) || 1,
      subject: attSubject,
      checkInTime: attStatus === 'Absent' || attStatus === 'Excused' ? '—' : '07:45 AM',
      status: attStatus,
      notes: attNotes,
    });
    setAttendanceModalOpen(false);
    setAttNotes('');
  };

  const handleAddDoc = () => {
    const cleanFileName =
      docName.trim() ||
      `${docType.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${student.studentNumber.toLowerCase()}.pdf`;
    addDocument(student.id, {
      category: docCategory,
      documentType: docType,
      fileName: cleanFileName,
      fileSize: '1.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Registrar Staff',
      status: 'Pending',
      serialNumber:
        docSerial.trim() ||
        `${docCategory.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      academicYear: '2026-2027',
    });
    setDocModalOpen(false);
    setDocName('');
    setDocSerial('');
  };

  const handlePreviewOfficialTranscript = () => {
    const existingTranscript = student.documents.find(
      (d) => resolveDocumentCategory(d) === 'academic_transcripts'
    );
    if (existingTranscript) {
      setInspectedDoc(existingTranscript);
    } else {
      setInspectedDoc({
        id: 'live_transcript',
        studentId: student.id,
        category: 'academic_transcripts',
        documentType: 'Official Academic Transcript',
        fileName: `${student.studentNumber.toLowerCase()}_official_transcript_2026.pdf`,
        fileSize: '2.4 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Central Registrar System',
        status: 'Verified',
        serialNumber: `TRN-2026-${student.studentNumber}`,
        academicYear: '2026-2027',
      });
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const existingNotes = student.notes || [];
    updateStudent(student.id, {
      notes: [`[${new Date().toISOString().substring(0, 10)}] ${noteText}`, ...existingNotes],
    });
    setNoteText('');
  };

  const getCategoryTagType = (cat: DocumentCategory) => {
    if (cat === 'academic_transcripts') return 'blue';
    if (cat === 'certificates') return 'purple';
    if (cat === 'id_documents') return 'teal';
    return 'cyan';
  };

  const showAcademics = activeSection === 'dashboard' || activeSection === 'academics';
  const showAttendance = activeSection === 'dashboard' || activeSection === 'attendance';
  const showPersonal = activeSection === 'dashboard' || activeSection === 'personal';
  const showFiles = activeSection === 'dashboard' || activeSection === 'files';

  return (
    <div style={{ padding: '0.5rem 0 1.5rem' }}>
      {/* 1. Student 360° Executive Header Banner */}
      <Tile
        style={{
          marginBottom: '1rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '3.75rem',
                height: '3.75rem',
                borderRadius: '50%',
                background: 'var(--cds-interactive-01)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontWeight: 600, fontSize: '1.375rem' }}>
                  {student.firstName} {student.lastName}
                </h2>
                {student.firstNameAr && (
                  <span
                    style={{
                      fontSize: '1rem',
                      color: 'var(--cds-text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    ({student.firstNameAr} {student.lastNameAr})
                  </span>
                )}
                <StatusBadge status={student.status} />
                <StatusBadge status={student.enrollmentStatus} />

              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.375rem 1.25rem',
                  marginTop: '0.5rem',
                  color: 'var(--cds-text-secondary)',
                  fontSize: '0.8125rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>
                  <strong>{t('sis.student360.personalSection.studentId')}:</strong>{' '}
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    {student.studentNumber}
                  </span>
                </span>
                <span>
                  <strong>{t('sis.student360.personalSection.nationalId')}:</strong>{' '}
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    {student.nationalId}
                  </span>
                </span>
                <span>
                  <strong>{t('sis.student360.personalSection.gradeSection')}:</strong>{' '}
                  {student.gradeLevel} ({student.classSection})
                </span>
                <span>
                  <strong>{t('sis.student360.personalSection.campus')}:</strong> {student.campus}
                </span>
                <span>
                  <strong>{t('sis.student360.personalSection.program')}:</strong> {student.program}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
            }}
          >
            <Button
              kind="primary"
              size="sm"
              renderIcon={Education}
              onClick={() => setGradeModalOpen(true)}
            >
              {t('sis.student360.recordGrade')}
            </Button>
            <Button
              kind="secondary"
              size="sm"
              renderIcon={Calendar}
              onClick={() => setAttendanceModalOpen(true)}
            >
              {t('sis.student360.logAttendance')}
            </Button>
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Edit}
              onClick={() => setEditPersonalOpen(true)}
            >
              {t('sis.student360.editProfile')}
            </Button>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Flow}
              onClick={() => setStatusModalOpen(true)}
            >
              {t('sis.student360.updateStatus')}
            </Button>
          </div>
        </div>
      </Tile>

      {/* 2. 4-Pillar Student 360° Executive KPI Strip */}
      <div className="cds-grid-cols-4-responsive" style={{ marginBottom: '1rem' }}>
        {/* Pillar 1: Academic Standing */}
        <Tile
          style={{
            background: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.student360.kpis.academicStanding')}
            </span>
            <Education size={18} style={{ fill: 'var(--cds-interactive-01)' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.375rem 0',
              color: 'var(--cds-interactive-01)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {student.gpa.toFixed(2)}{' '}
            <span style={{ fontSize: '0.9375rem', color: 'var(--cds-text-secondary)', fontWeight: 400 }}>
              / 4.00
            </span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--cds-text-secondary)',
              marginBottom: '0.5rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t('sis.student360.kpis.creditsEarned', {
              credits: totalActiveCredits,
              courses: academicRecords.length,
            })}
          </div>
          <Tag type={student.gpa >= 3.5 ? 'green' : 'blue'} size="sm">
            {student.gpa >= 3.5
              ? t('sis.student360.kpis.honorsStanding')
              : t('sis.student360.kpis.goodStanding')}
          </Tag>
        </Tile>

        {/* Pillar 2: Attendance & Punctuality */}
        <Tile
          style={{
            background: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.student360.kpis.attendanceRate')}
            </span>
            <Calendar size={18} style={{ fill: 'var(--cds-support-02)' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.375rem 0',
              color:
                effectiveAttendanceRate >= 92
                  ? 'var(--cds-support-02)'
                  : 'var(--cds-support-03)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {effectiveAttendanceRate}%
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--cds-text-secondary)',
              marginBottom: '0.5rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t('sis.student360.kpis.attendanceSummary', {
              present: attendanceCounts.Present,
              late: attendanceCounts.Late,
              absent: attendanceCounts.Absent + attendanceCounts.Excused,
            })}
          </div>
          <Tag type={effectiveAttendanceRate >= 92 ? 'green' : 'warm-gray'} size="sm">
            {effectiveAttendanceRate >= 92
              ? t('sis.student360.kpis.optimalAttendance')
              : t('sis.student360.kpis.attentionAttendance')}
          </Tag>
        </Tile>

        {/* Pillar 3: Personal & Family Readiness */}
        <Tile
          style={{
            background: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.student360.kpis.personalIdentity')}
            </span>
            <UserMultiple size={18} style={{ fill: 'var(--cds-interactive-01)' }} />
          </div>
          <div
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              margin: '0.5rem 0 0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {student.guardians[0]?.guardianName || student.contact.phone}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--cds-text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            {t('sis.student360.kpis.guardiansLinked', {
              count: student.guardians.length,
              campus: student.address.city,
            })}
          </div>
          <Tag type="teal" size="sm">
            {t('sis.student360.kpis.verifiedIdentity')}
          </Tag>
        </Tile>

        {/* Pillar 4: Document Vault Compliance */}
        <Tile
          style={{
            background: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.student360.kpis.fileCompliance')}
            </span>
            <FolderDetails size={18} style={{ fill: '#8a3ffc' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.375rem 0',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fileCategoryBreakdown.verified}{' '}
            <span style={{ fontSize: '0.9375rem', color: 'var(--cds-text-secondary)', fontWeight: 400 }}>
              / {student.documents.length}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--cds-text-secondary)',
              marginBottom: '0.5rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t('sis.student360.kpis.filesBreakdown', {
              transcripts: fileCategoryBreakdown.academic_transcripts,
              certs: fileCategoryBreakdown.certificates,
              ids: fileCategoryBreakdown.id_documents,
            })}
          </div>
          <Tag
            type={
              fileCategoryBreakdown.verified === student.documents.length &&
              student.documents.length > 0
                ? 'green'
                : 'purple'
            }
            size="sm"
          >
            {student.documents.length} Files Indexed
          </Tag>
        </Tile>
      </div>

      {/* 3. Cohesive 360° Focus Filter Bar */}
      <div
        role="tablist"
        aria-label={t('sis.student360.title')}
        style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
        }}
      >
        {(
          [
            'dashboard',
            'academics',
            'attendance',
            'personal',
            'files',
          ] as ProfileViewSection[]
        ).map((sec) => {
          const isSelected = activeSection === sec;
          return (
            <button
              key={sec}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveSection(sec)}
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 600 : 400,
                border: isSelected
                  ? '1px solid var(--cds-interactive-01)'
                  : '1px solid transparent',
                background: isSelected
                  ? 'var(--cds-interactive-01)'
                  : 'var(--cds-layer-02)',
                color: isSelected ? '#ffffff' : 'var(--cds-text-primary)',
                cursor: 'pointer',
              }}
            >
              {t(`sis.student360.views.${sec}`)}
            </button>
          );
        })}
      </div>

      {/* 4. Cohesive Student 360° Dashboard Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            activeSection === 'dashboard'
              ? 'repeat(auto-fit, minmax(min(100%, 34rem), 1fr))'
              : '1fr',
          gap: '1rem',
          alignItems: ' start',
        }}
      >
        {/* LEFT / PRIMARY COLUMN: Academic Records + Attendance Analytics */}
        {(showAcademics || showAttendance) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* PANEL A: Academic Records & Coursework Matrix */}
            {showAcademics && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Education size={20} style={{ fill: 'var(--cds-interactive-01)' }} />
                      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.0625rem' }}>
                        {t('sis.student360.academicSection.title')}
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: '0.25rem 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--cds-text-secondary)',
                      }}
                    >
                      {t('sis.student360.academicSection.subtitle')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      kind="secondary"
                      size="sm"
                      renderIcon={View}
                      onClick={handlePreviewOfficialTranscript}
                    >
                      {t('sis.student360.previewTranscript')}
                    </Button>
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Add}
                      onClick={() => setGradeModalOpen(true)}
                    >
                      {t('sis.student360.recordGrade')}
                    </Button>
                  </div>
                </div>

                {/* Term GPA Trajectory Bar Strip */}
                <div
                  style={{
                    padding: '0.875rem',
                    background: 'var(--cds-layer-02)',
                    border: '1px solid var(--cds-border-subtle-01)',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--cds-text-secondary)',
                      marginBottom: '0.625rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('sis.student360.academicSection.termTrajectory')}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {termGpaHistory.map((snap) => {
                      const pct = Math.min(100, Math.round((snap.gpa / 4.0) * 100));
                      return (
                        <div key={snap.term}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              marginBottom: '0.25rem',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            <span style={{ color: 'var(--cds-text-secondary)' }}>{snap.term}</span>
                            <strong>{snap.gpa.toFixed(2)}</strong>
                          </div>
                          <div
                            style={{
                              height: '6px',
                              width: '100%',
                              background: 'var(--cds-border-subtle-01)',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: 'var(--cds-interactive-01)',
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--cds-text-helper)',
                              marginTop: '0.2rem',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {snap.credits} {t('sis.student360.academicSection.credits')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* High-Density Enrolled Courses Table */}
                <div style={{ overflowX: 'auto' }}>
                  <Table size="md" aria-label={t('sis.student360.academicSection.title')}>
                    <TableHead>
                      <TableRow>
                        <TableHeader>{t('sis.student360.academicSection.code')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.course')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.credits')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.coursework')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.finalExam')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.totalScore')}</TableHeader>
                        <TableHeader>{t('sis.student360.academicSection.grade')}</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {academicRecords.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell
                            style={{
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {course.code}
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: 500 }}>
                              {i18n.language === 'ar' ? course.nameAr : course.nameEn}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                              {course.instructor} · {course.term}
                            </div>
                          </TableCell>
                          <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {course.credits}
                          </TableCell>
                          <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {course.courseworkScore}%
                          </TableCell>
                          <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {course.finalExamScore}%
                          </TableCell>
                          <TableCell
                            style={{
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                              color:
                                course.totalScore >= 90
                                  ? 'var(--cds-support-02)'
                                  : 'var(--cds-text-primary)',
                            }}
                          >
                            {course.totalScore}%
                          </TableCell>
                          <TableCell>
                            <Tag
                              type={course.grade.startsWith('A') ? 'green' : 'blue'}
                              size="sm"
                            >
                              {course.grade}
                            </Tag>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tile>
            )}

            {/* PANEL B: Attendance & Punctuality Analytics */}
            {showAttendance && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={20} style={{ fill: 'var(--cds-support-02)' }} />
                      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.0625rem' }}>
                        {t('sis.student360.attendanceSection.title')}
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: '0.25rem 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--cds-text-secondary)',
                      }}
                    >
                      {t('sis.student360.attendanceSection.subtitle')}
                    </p>
                  </div>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={Add}
                    onClick={() => setAttendanceModalOpen(true)}
                  >
                    {t('sis.student360.logAttendance')}
                  </Button>
                </div>

                {/* Attendance Breakdown Strip + Monthly Trend */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '0.625rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--cds-layer-02)',
                      borderLeft: '3px solid var(--cds-support-02)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('sis.student360.attendanceSection.presentDays')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {attendanceCounts.Present}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--cds-layer-02)',
                      borderLeft: '3px solid #8a3ffc',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('sis.student360.attendanceSection.lateCount')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {attendanceCounts.Late}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--cds-layer-02)',
                      borderLeft: '3px solid var(--cds-interactive-01)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('sis.student360.attendanceSection.excusedCount')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {attendanceCounts.Excused}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--cds-layer-02)',
                      borderLeft: '3px solid var(--cds-support-01)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('sis.student360.attendanceSection.unexcusedCount')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {attendanceCounts.Absent}
                    </div>
                  </div>
                </div>

                {/* Monthly Attendance Rate Bar Matrix */}
                <div
                  style={{
                    padding: '0.875rem',
                    background: 'var(--cds-layer-02)',
                    border: '1px solid var(--cds-border-subtle-01)',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--cds-text-secondary)',
                      marginBottom: '0.625rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t('sis.student360.attendanceSection.monthlyTrend')}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {monthlyAttendance.map((m) => (
                      <div key={m.month}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            marginBottom: '0.25rem',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          <span style={{ color: 'var(--cds-text-secondary)' }}>{m.month}</span>
                          <strong>{m.rate}%</strong>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            width: '100%',
                            background: 'var(--cds-border-subtle-01)',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${m.rate}%`,
                              background:
                                m.rate >= 95
                                  ? 'var(--cds-support-02)'
                                  : 'var(--cds-interactive-01)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chronological Lesson Attendance Table */}
                <div style={{ overflowX: 'auto' }}>
                  <Table size="md" aria-label={t('sis.student360.attendanceSection.title')}>
                    <TableHead>
                      <TableRow>
                        <TableHeader>{t('sis.student360.attendanceSection.date')}</TableHeader>
                        <TableHeader>{t('sis.student360.attendanceSection.period')}</TableHeader>
                        <TableHeader>{t('sis.student360.attendanceSection.subject')}</TableHeader>
                        <TableHeader>{t('sis.student360.attendanceSection.checkIn')}</TableHeader>
                        <TableHeader>{t('sis.student360.attendanceSection.status')}</TableHeader>
                        <TableHeader>{t('sis.student360.attendanceSection.remarks')}</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell
                            style={{
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {rec.date}
                          </TableCell>
                          <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                            P{rec.period}
                          </TableCell>
                          <TableCell>{rec.subject}</TableCell>
                          <TableCell
                            style={{
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontSize: '0.75rem',
                            }}
                          >
                            {rec.checkInTime}
                          </TableCell>
                          <TableCell>
                            <Tag
                              type={
                                rec.status === 'Present'
                                  ? 'green'
                                  : rec.status === 'Late'
                                  ? 'purple'
                                  : rec.status === 'Excused'
                                  ? 'blue'
                                  : 'red'
                              }
                              size="sm"
                            >
                              {rec.status}
                            </Tag>
                          </TableCell>
                          <TableCell
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--cds-text-secondary)',
                            }}
                          >
                            {rec.notes || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tile>
            )}
          </div>
        )}

        {/* RIGHT / SECONDARY COLUMN: Personal Details, Guardians, Categorized File Vault & Timeline */}
        {(showPersonal || showFiles) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* PANEL C: Personal, Civil Identity & Contact Details */}
            {showPersonal && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Identification size={20} style={{ fill: 'var(--cds-interactive-01)' }} />
                    <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.0625rem' }}>
                      {t('sis.student360.personalSection.title')}
                    </h4>
                  </div>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Edit}
                    onClick={() => setEditPersonalOpen(true)}
                  >
                    {t('sis.student360.editProfile')}
                  </Button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
                    gap: '0.875rem',
                    fontSize: '0.8125rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--cds-border-subtle-01)',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.fullNameEn')}
                    </span>
                    <strong>
                      {student.firstName} {student.lastName}
                    </strong>
                  </div>
                  {student.firstNameAr && (
                    <div>
                      <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                        {t('sis.student360.personalSection.fullNameAr')}
                      </span>
                      <strong>
                        {student.firstNameAr} {student.lastNameAr}
                      </strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.studentId')}
                    </span>
                    <strong style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      {student.studentNumber}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.nationalId')}
                    </span>
                    <strong style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      {student.nationalId}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.dob')}
                    </span>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {student.dateOfBirth}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.gender')}
                    </span>
                    <strong>{student.gender}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.enrollmentDate')}
                    </span>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {student.enrollmentDate}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.cohort')}
                    </span>
                    <strong>{student.cohort}</strong>
                  </div>
                </div>

                {/* Contact & Residence Strip */}
                <div
                  style={{
                    marginTop: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Email size={16} style={{ fill: 'var(--cds-text-secondary)' }} />
                    <strong>{t('sis.student360.personalSection.email')}:</strong>
                    <span>{student.contact.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Phone size={16} style={{ fill: 'var(--cds-text-secondary)' }} />
                    <strong>{t('sis.student360.personalSection.phone')}:</strong>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {student.contact.phone}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Location
                      size={16}
                      style={{ fill: 'var(--cds-text-secondary)', marginTop: '0.15rem', flexShrink: 0 }}
                    />
                    <div>
                      <strong>{t('sis.student360.personalSection.address')}:</strong>{' '}
                      {student.address.street}, {student.address.city}, {student.address.state}{' '}
                      {student.address.postalCode} ({student.address.country})
                    </div>
                  </div>
                </div>
              </Tile>
            )}

            {/* PANEL D: Guardians & Family Linkages */}
            {showPersonal && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.875rem',
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                    {t('sis.student360.guardiansSection.title')} ({student.guardians.length})
                  </h4>
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveTab('guardians');
                      navigate('/sis/guardians');
                    }}
                  >
                    {t('sis.student360.guardiansSection.manageBtn')}
                  </Button>
                </div>

                {student.guardians.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                    No guardians linked yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {student.guardians.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          padding: '0.75rem',
                          background: 'var(--cds-layer-02)',
                          border: '1px solid var(--cds-border-subtle-01)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {g.guardianName} ({g.relationship})
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--cds-text-secondary)',
                                marginTop: '0.2rem',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {g.phone} · {g.email}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {g.isPrimary && (
                              <Tag type="blue" size="sm">
                                Primary
                              </Tag>
                            )}
                            {g.isEmergencyContact && (
                              <Tag type="red" size="sm">
                                Emergency
                              </Tag>
                            )}
                            {g.isFinancialResponsible && (
                              <Tag type="green" size="sm">
                                Financial
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tile>
            )}

            {/* PANEL E: Categorized Student File Vault (Transcripts, Certificates, ID Docs) */}
            {showFiles && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FolderDetails size={20} style={{ fill: '#8a3ffc' }} />
                      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                        {t('sis.student360.filesSection.title')} ({student.documents.length})
                      </h4>
                    </div>
                    <p
                      style={{
                        margin: '0.2rem 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-secondary)',
                      }}
                    >
                      {t('sis.student360.filesSection.subtitle')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveTab('documents');
                        navigate('/sis/documents');
                      }}
                    >
                      {t('sis.student360.openFileManager')}
                    </Button>
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Add}
                      onClick={() => setDocModalOpen(true)}
                    >
                      {t('sis.student360.uploadFile')}
                    </Button>
                  </div>
                </div>

                {/* Inline Category Filter Chips */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.375rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.875rem',
                  }}
                >
                  {(
                    [
                      'all',
                      'academic_transcripts',
                      'certificates',
                      'id_documents',
                    ] as const
                  ).map((cat) => {
                    const active = vaultCategoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setVaultCategoryFilter(cat)}
                        style={{
                          padding: '0.25rem 0.625rem',
                          fontSize: '0.75rem',
                          fontWeight: active ? 600 : 400,
                          border: active
                            ? '1px solid var(--cds-interactive-01)'
                            : '1px solid var(--cds-border-subtle-01)',
                          background: active
                            ? 'var(--cds-layer-selected-01)'
                            : 'var(--cds-layer-02)',
                          color: 'var(--cds-text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {t(`sis.documents.categories.${cat}`)}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredStudentDocs.map((d) => {
                    const cat = resolveDocumentCategory(d);
                    return (
                      <div
                        key={d.id}
                        style={{
                          padding: '0.75rem',
                          background: 'var(--cds-layer-02)',
                          border: '1px solid var(--cds-border-subtle-01)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.8125rem' }}>{d.documentType}</strong>
                            <Tag type={getCategoryTagType(cat)} size="sm">
                              {t(`sis.documents.categories.${cat}`)}
                            </Tag>
                            <Tag
                              type={
                                d.status === 'Verified'
                                  ? 'green'
                                  : d.status === 'Rejected'
                                  ? 'red'
                                  : 'warm-gray'
                              }
                              size="sm"
                            >
                              {d.status}
                            </Tag>
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--cds-text-secondary)',
                              marginTop: '0.2rem',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {d.fileName} ({d.fileSize}) · {d.uploadDate}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Button
                            kind="secondary"
                            size="sm"
                            renderIcon={View}
                            onClick={() => setInspectedDoc(d)}
                          >
                            {t('sis.documents.inspectBtn')}
                          </Button>
                          {d.status === 'Pending' && (
                            <Button
                              kind="ghost"
                              size="sm"
                              hasIconOnly
                              renderIcon={Checkmark}
                              iconDescription={t('sis.documents.verifyBtn')}
                              onClick={() =>
                                updateDocumentStatus(
                                  student.id,
                                  d.id,
                                  'Verified',
                                  'Verified from Student 360'
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tile>
            )}

            {/* PANEL F: Institutional Lifecycle Trail & Advisor Remarks */}
            {showPersonal && (
              <Tile
                style={{
                  background: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <h4 style={{ margin: '0 0 0.875rem', fontWeight: 600, fontSize: '1rem' }}>
                  {t('sis.student360.timelineSection.title')}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    borderInlineStart: '2px solid var(--cds-border-subtle-01)',
                    paddingInlineStart: '0.875rem',
                    marginBottom: '1rem',
                  }}
                >
                  {student.timeline.slice(0, 5).map((ev) => (
                    <div key={ev.id}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{ev.title}</div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--cds-text-secondary)',
                          margin: '0.125rem 0',
                        }}
                      >
                        {ev.description}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--cds-text-helper)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {ev.timestamp} · {ev.actor}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--cds-border-subtle-01)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                    {t('sis.student360.timelineSection.notesTitle')}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <TextInput
                      id="student360-note-input"
                      size="sm"
                      labelText=""
                      hideLabel
                      placeholder={t('sis.student360.timelineSection.addNotePlaceholder')}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <Button kind="primary" size="sm" onClick={handleAddNote}>
                      {t('sis.student360.timelineSection.addNoteBtn')}
                    </Button>
                  </div>
                  {student.notes && student.notes.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {student.notes.map((n, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--cds-layer-02)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Tile>
            )}
          </div>
        )}
      </div>

      {/* Edit Personal Modal */}
      <Modal
        open={editPersonalOpen}
        modalHeading={t('sis.student360.editProfile')}
        primaryButtonText={t('common.save')}
        secondaryButtonText={t('common.cancel')}
        onRequestClose={() => setEditPersonalOpen(false)}
        onRequestSubmit={handleSavePersonal}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="edit-fn"
              labelText="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextInput
              id="edit-ln"
              labelText="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <TextInput
            id="edit-nat"
            labelText={t('sis.student360.personalSection.nationalId')}
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="edit-phone"
              labelText={t('sis.student360.personalSection.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextInput
              id="edit-email"
              labelText={t('sis.student360.personalSection.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="edit-street"
              labelText="Street Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            <TextInput
              id="edit-city"
              labelText="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Record Grade Modal */}
      <Modal
        open={gradeModalOpen}
        modalHeading={t('sis.student360.recordGrade')}
        primaryButtonText={t('common.save')}
        secondaryButtonText={t('common.cancel')}
        onRequestClose={() => setGradeModalOpen(false)}
        onRequestSubmit={handleSaveGrade}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="grade-code-inp"
              labelText={t('sis.student360.academicSection.code')}
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <NumberInput
              id="grade-credits-inp"
              label={t('sis.student360.academicSection.credits')}
              min={1}
              max={6}
              value={courseCredits}
              onChange={(_, { value }) => setCourseCredits(Number(value))}
            />
          </div>
          <TextInput
            id="grade-name-en"
            labelText="Course Title (English)"
            value={courseNameEn}
            onChange={(e) => setCourseNameEn(e.target.value)}
          />
          <TextInput
            id="grade-name-ar"
            labelText="اسم المقرر (عربي)"
            value={courseNameAr}
            onChange={(e) => setCourseNameAr(e.target.value)}
          />
          <div className="cds-grid-cols-2-responsive">
            <NumberInput
              id="grade-cw-inp"
              label="Coursework Score (%)"
              min={0}
              max={100}
              value={courseworkScore}
              onChange={(_, { value }) => setCourseworkScore(Number(value))}
            />
            <NumberInput
              id="grade-ex-inp"
              label="Final Exam Score (%)"
              min={0}
              max={100}
              value={finalExamScore}
              onChange={(_, { value }) => setFinalExamScore(Number(value))}
            />
          </div>
          <TextInput
            id="grade-inst-inp"
            labelText={t('sis.student360.academicSection.instructor')}
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
        </div>
      </Modal>

      {/* Log Attendance Modal */}
      <Modal
        open={attendanceModalOpen}
        modalHeading={t('sis.student360.logAttendance')}
        primaryButtonText={t('common.save')}
        secondaryButtonText={t('common.cancel')}
        onRequestClose={() => setAttendanceModalOpen(false)}
        onRequestSubmit={handleSaveAttendance}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="att-date-inp"
              type="date"
              labelText={t('sis.student360.attendanceSection.date')}
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
            />
            <NumberInput
              id="att-period-inp"
              label={t('sis.student360.attendanceSection.period')}
              min={1}
              max={8}
              value={attPeriod}
              onChange={(_, { value }) => setAttPeriod(Number(value))}
            />
          </div>
          <TextInput
            id="att-subject-inp"
            labelText={t('sis.student360.attendanceSection.subject')}
            value={attSubject}
            onChange={(e) => setAttSubject(e.target.value)}
          />
          <Select
            id="att-status-sel"
            labelText={t('sis.student360.attendanceSection.status')}
            value={attStatus}
            onChange={(e) => setAttStatus(e.target.value as any)}
          >
            <SelectItem value="Present" text="Present" />
            <SelectItem value="Late" text="Late" />
            <SelectItem value="Excused" text="Excused" />
            <SelectItem value="Absent" text="Absent" />
          </Select>
          <TextInput
            id="att-notes-inp"
            labelText={t('sis.student360.attendanceSection.remarks')}
            placeholder="e.g. Clinic medical clearance or transit delay"
            value={attNotes}
            onChange={(e) => setAttNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal
        open={statusModalOpen}
        modalHeading={t('sis.student360.updateStatus')}
        primaryButtonText={t('common.confirm')}
        secondaryButtonText={t('common.cancel')}
        onRequestClose={() => setStatusModalOpen(false)}
        onRequestSubmit={handleSaveStatus}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            id="status-sel"
            labelText="New Lifecycle Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
          >
            <SelectItem value="active" text="Active" />
            <SelectItem value="enrolled" text="Enrolled" />
            <SelectItem value="applicant" text="Applicant" />
            <SelectItem value="admitted" text="Admitted" />
            <SelectItem value="graduated" text="Graduated" />
            <SelectItem value="withdrawn" text="Withdrawn" />
          </Select>
          <TextInput
            id="status-reason-inp"
            labelText="Reason / Context"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Upload Categorized Document Modal */}
      <Modal
        open={docModalOpen}
        modalHeading={t('sis.documents.uploadModal.heading')}
        primaryButtonText={t('sis.documents.uploadModal.submitBtn')}
        secondaryButtonText={t('sis.documents.uploadModal.cancelBtn')}
        onRequestClose={() => setDocModalOpen(false)}
        onRequestSubmit={handleAddDoc}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            id="doc360-cat-sel"
            labelText={t('sis.documents.uploadModal.selectCategory')}
            value={docCategory}
            onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
          >
            <SelectItem
              value="academic_transcripts"
              text={t('sis.documents.categories.academic_transcripts')}
            />
            <SelectItem
              value="certificates"
              text={t('sis.documents.categories.certificates')}
            />
            <SelectItem
              value="id_documents"
              text={t('sis.documents.categories.id_documents')}
            />
            <SelectItem
              value="medical_consent"
              text={t('sis.documents.categories.medical_consent')}
            />
          </Select>

          <Select
            id="doc360-type-sel"
            labelText={t('sis.documents.uploadModal.selectType')}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
          >
            <SelectItem value="Official Academic Transcript" text="Official Academic Transcript" />
            <SelectItem value="Previous Transcript" text="Previous Transcript" />
            <SelectItem value="Term Grade Report" text="Term Grade Report" />
            <SelectItem value="Graduation Diploma" text="Graduation Diploma" />
            <SelectItem value="STEM Honors Certificate" text="STEM Honors Certificate" />
            <SelectItem value="Transfer Certificate" text="Transfer Certificate" />
            <SelectItem value="National ID / Passport" text="National ID / Passport" />
            <SelectItem value="Birth Certificate" text="Birth Certificate" />
            <SelectItem value="Student Campus ID Card" text="Student Campus ID Card" />
            <SelectItem value="Medical Clearance" text="Medical Clearance" />
            <SelectItem value="Guardian Consent" text="Guardian Consent" />
          </Select>

          <TextInput
            id="doc360-filename"
            labelText={t('sis.documents.uploadModal.fileName')}
            placeholder="e.g. transcript_fall_2026.pdf"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />

          <TextInput
            id="doc360-serial"
            labelText={t('sis.documents.uploadModal.serialNumber')}
            placeholder="e.g. TRN-2026-STU1001"
            value={docSerial}
            onChange={(e) => setDocSerial(e.target.value)}
          />
        </div>
      </Modal>

      {/* Official Document Inspector Modal */}
      <DocumentInspectorModal
        open={Boolean(inspectedDoc)}
        document={inspectedDoc}
        student={student}
        onClose={() => setInspectedDoc(null)}
        onUpdateCategory={(stuId, docId, cat) => {
          updateDocumentCategory(stuId, docId, cat);
          setInspectedDoc((prev) => (prev ? { ...prev, category: cat } : null));
        }}
        onUpdateStatus={(stuId, docId, status, notes) => {
          updateDocumentStatus(stuId, docId, status, notes);
          setInspectedDoc((prev) =>
            prev ? { ...prev, status, verificationNotes: notes } : null
          );
        }}
      />
    </div>
  );
};
