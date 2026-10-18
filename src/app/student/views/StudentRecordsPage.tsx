import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Tag,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  Dropdown,
  TextInput,
  InlineNotification,
  ProgressBar,
} from '@carbon/react';
import {
  Catalog,
  Document,
  Education,
  CheckmarkFilled,
  Time,
  Renew,
  Certificate,
  Download,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';
import { AdminMetricCard } from '../../../ui/admin/AdminMetricCard';

interface SemesterRecord {
  termEn: string;
  termAr: string;
  termGpa: string;
  creditsEarned: number;
  courses: {
    code: string;
    titleEn: string;
    titleAr: string;
    credits: number;
    grade: string;
    points: string;
  }[];
}

const ACADEMIC_HISTORY: SemesterRecord[] = [
  {
    termEn: 'Spring 2026',
    termAr: 'الفصل الدراسي الربيعي 2026',
    termGpa: '3.90',
    creditsEarned: 16,
    courses: [
      { code: 'CS-201', titleEn: 'Data Structures & Algorithms', titleAr: 'هياكل البيانات والخوارزميات', credits: 4, grade: 'A', points: '16.0' },
      { code: 'CS-205', titleEn: 'Computer Systems Architecture', titleAr: 'معمارية أنظمة الحاسب', credits: 3, grade: 'A', points: '12.0' },
      { code: 'MATH-201', titleEn: 'Linear Algebra & Differential Eqs', titleAr: 'الجبر الخطي والمعادلات التفاضلية', credits: 3, grade: 'A-', points: '11.1' },
      { code: 'ENG-201', titleEn: 'Professional Communication', titleAr: 'الاتصال والتواصل المهني', credits: 2, grade: 'A', points: '8.0' },
      { code: 'PHYS-102', titleEn: 'General Physics II & Lab', titleAr: 'الفيزياء العامة ٢ ومعملها', credits: 4, grade: 'B+', points: '13.2' },
    ],
  },
  {
    termEn: 'Fall 2025',
    termAr: 'الفصل الدراسي الخريفي 2025',
    termGpa: '3.78',
    creditsEarned: 15,
    courses: [
      { code: 'CS-101', titleEn: 'Introduction to Computer Science', titleAr: 'مقدمة في علوم الحاسب', credits: 4, grade: 'A', points: '16.0' },
      { code: 'MATH-101', titleEn: 'Calculus & Analytical Geometry', titleAr: 'الرياضيات المتقدمة والهندسة', credits: 4, grade: 'A-', points: '14.8' },
      { code: 'PHYS-101', titleEn: 'General Physics I & Lab', titleAr: 'الفيزياء العامة ١ ومعملها', credits: 4, grade: 'B+', points: '13.2' },
      { code: 'ENG-101', titleEn: 'Academic Writing & Research', titleAr: 'الكتابة الأكاديمية والبحث', credits: 3, grade: 'A', points: '12.0' },
    ],
  },
];

interface DocumentRequest {
  id: string;
  docTypeEn: string;
  docTypeAr: string;
  requestedDate: string;
  status: 'approved' | 'processing' | 'pending';
}

export function StudentRecordsPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<any>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([
    { id: 'req1', docTypeEn: 'Official Academic Transcript', docTypeAr: 'سجل أكاديمي رسمي مصدق', requestedDate: 'Sep 02, 2026', status: 'approved' },
    { id: 'req2', docTypeEn: 'Enrollment Verification Letter', docTypeAr: 'إفادة إثبات استمرارية بالدراسة', requestedDate: 'Aug 15, 2026', status: 'approved' },
  ]);

  const docOptions = [
    { id: 'transcript', label: isAr ? 'سجل أكاديمي رسمي مصدق (Official Transcript)' : 'Official Academic Transcript' },
    { id: 'enrollment', label: isAr ? 'إفادة استمرار دراسة (Enrollment Verification)' : 'Enrollment Verification Letter' },
    { id: 'conduct', label: isAr ? 'شهادة حسن سيرة وسلوك (Good Conduct Clearance)' : 'Good Conduct Clearance' },
  ];

  const handleCreateRequest = () => {
    if (!selectedDocType) return;
    const newReq: DocumentRequest = {
      id: `req-${Date.now()}`,
      docTypeEn: selectedDocType.label,
      docTypeAr: selectedDocType.label,
      requestedDate: isAr ? 'اليوم' : 'Today',
      status: 'processing',
    };
    setDocRequests([newReq, ...docRequests]);
    setSuccessNotice(true);
    setTimeout(() => {
      setDocModalOpen(false);
      setSuccessNotice(false);
    }, 1200);
  };

  return (
    <AdminPage
      title={isAr ? 'السجل الأكاديمي والشهادات' : 'Academic Records & Transcripts'}
      description={isAr
        ? 'عرض السجل الأكاديمي التفصيلي، المعدل التراكمي لكل فصل، وتقديم طلبات الوثائق الرسمية والمصدقة.'
        : 'View official academic transcripts, semester GPA history, and request official university documents.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', href: '/student' },
        { label: isAr ? 'السجل الأكاديمي' : 'Academic Records' },
      ]}
      actions={
        <Button kind="primary" size="md" renderIcon={Certificate} onClick={() => setDocModalOpen(true)}>
          {isAr ? 'طلب وثيقة أو سجل رسمي' : 'Request Official Document'}
        </Button>
      }
    >
      {/* Metric Tiles Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <AdminMetricCard
          title={isAr ? 'المعدل التراكمي العام (cGPA)' : 'Cumulative GPA'}
          value="3.84 / 4.00"
          subtitle={isAr ? 'مرتبة الشرف الأولى' : 'First Class Honors'}
          icon={<Education size={20} />}
          kind="success"
        />
        <AdminMetricCard
          title={isAr ? 'الساعات المعتمدة المكتسبة' : 'Earned Credits'}
          value="45 Hours"
          subtitle={isAr ? 'من إجمالي 120 ساعة للدرجة' : 'out of 120 Total Credits'}
          icon={<Catalog size={20} />}
        />
        <AdminMetricCard
          title={isAr ? 'نسبة إنجاز الخطة الدراسية' : 'Degree Completion'}
          value="37.5%"
          subtitle={isAr ? 'السنة الدراسية الثانية' : 'Sophomore Year Standing'}
          icon={<CheckmarkFilled size={20} />}
        />
        <AdminMetricCard
          title={isAr ? 'الإنذارات الأكاديمية' : 'Academic Standing'}
          value={isAr ? 'سليم' : 'Clear'}
          subtitle={isAr ? 'لا توجد إنذارات' : 'Good Academic Standing'}
          icon={<CheckmarkFilled size={20} />}
          kind="success"
        />
      </div>

      {/* Main Breakdown: History & Document Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Semester Transcripts */}
        <div>
          <AdminSection title={isAr ? 'السجل الأكاديمي التفصيلي حسب الفصول' : 'Detailed Semester Transcripts'}>
            {ACADEMIC_HISTORY.map((sem, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--cds-layer-02)',
                    border: '1px solid var(--cds-border-subtle)',
                    borderBottom: 'none',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                    {isAr ? sem.termAr : sem.termEn}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Tag type="purple" size="sm">
                      {isAr ? `معدل الفصل: ${sem.termGpa}` : `Term GPA: ${sem.termGpa}`}
                    </Tag>
                    <Tag type="blue" size="sm">
                      {isAr ? `${sem.creditsEarned} ساعة` : `${sem.creditsEarned} Credits`}
                    </Tag>
                  </div>
                </div>

                <Table size="sm">
                  <TableHead>
                    <TableRow>
                      <TableHeader>{isAr ? 'رمز المقرر' : 'Course Code'}</TableHeader>
                      <TableHeader>{isAr ? 'اسم المقرر' : 'Course Title'}</TableHeader>
                      <TableHeader>{isAr ? 'الساعات' : 'Credits'}</TableHeader>
                      <TableHeader>{isAr ? 'التقدير' : 'Grade'}</TableHeader>
                      <TableHeader>{isAr ? 'نقاط التقدير' : 'Grade Points'}</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sem.courses.map((c, cIdx) => (
                      <TableRow key={cIdx}>
                        <TableCell style={{ fontWeight: 600 }}>{c.code}</TableCell>
                        <TableCell>{isAr ? c.titleAr : c.titleEn}</TableCell>
                        <TableCell>{c.credits}</TableCell>
                        <TableCell>
                          <Tag type="teal" size="sm">
                            {c.grade}
                          </Tag>
                        </TableCell>
                        <TableCell>{c.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </AdminSection>
        </div>

        {/* Right Column: Issued Documents History */}
        <div>
          <AdminSection title={isAr ? 'طلبات الوثائق والمستندات' : 'Document Requests & Downloads'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {docRequests.map((req) => (
                <Tile
                  key={req.id}
                  style={{
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle)',
                    padding: '0.875rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Tag type={req.status === 'approved' ? 'green' : 'purple'} size="sm" style={{ margin: 0 }}>
                      {req.status === 'approved' ? (isAr ? 'جاهزة للتحميل' : 'Ready for Download') : (isAr ? 'قيد المعالجة' : 'In Processing')}
                    </Tag>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {req.requestedDate}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                    {isAr ? req.docTypeAr : req.docTypeEn}
                  </div>

                  {req.status === 'approved' && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <Button kind="ghost" size="sm" renderIcon={Download} className="cds-w-full">
                        {isAr ? 'تحميل النسخة المصدقة' : 'Download PDF'}
                      </Button>
                    </div>
                  )}
                </Tile>
              ))}
            </div>
          </AdminSection>
        </div>
      </div>

      {/* Document Request Modal */}
      <Modal
        open={docModalOpen}
        onRequestClose={() => setDocModalOpen(false)}
        modalHeading={isAr ? 'طلب إصدار وثيقة أكاديمية رسمية' : 'Request Official University Document'}
        primaryButtonText={isAr ? 'تقديم الطلب' : 'Submit Document Request'}
        secondaryButtonText={isAr ? 'إلغاء' : 'Cancel'}
        onSecondarySubmit={() => setDocModalOpen(false)}
        onRequestSubmit={handleCreateRequest}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          {successNotice && (
            <InlineNotification
              kind="success"
              title={isAr ? 'تم تقديم الطلب بنجاح!' : 'Request Submitted Successfully!'}
              subtitle={isAr ? 'سيتم مراجعة وإصدار الوثيقة من قبل عمادة القبول والتسجيل.' : 'Your request will be processed by the registrar office.'}
            />
          )}

          <Dropdown
            id="doc-type-dropdown"
            titleText={isAr ? 'نوع الوثيقة المطلوبة' : 'Select Document Type'}
            label={isAr ? 'اختر الوثيقة' : 'Choose Document'}
            items={docOptions}
            itemToString={(item) => (item ? item.label : '')}
            onChange={({ selectedItem }) => setSelectedDocType(selectedItem)}
          />

          <TextInput
            id="purpose-notes"
            labelText={isAr ? 'الغرض من الطلب / الجهة الموجه إليها' : 'Purpose / Recipient Entity'}
            placeholder={isAr ? 'مثال: التقديم للتدريب الصيفي / سفارة...' : 'e.g. Summer Internship Application / Embassy'}
          />
        </div>
      </Modal>
    </AdminPage>
  );
}

export default StudentRecordsPage;
