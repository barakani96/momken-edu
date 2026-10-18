import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  Tag,
  Button,
  ProgressBar,
  Modal,
  TextInput,
  FileUploader,
  InlineNotification,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Layer,
} from '@carbon/react';
import {
  Catalog,
  Document,
  Upload,
  User,
  Time,
  Book,
  CheckmarkOutline,
  CheckmarkFilled,
  Download,
  Folder,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';

interface CourseDetail {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  departmentEn: string;
  departmentAr: string;
  instructorEn: string;
  instructorAr: string;
  credits: number;
  grade?: string;
  progress: number;
  scheduleEn: string;
  scheduleAr: string;
  roomEn: string;
  roomAr: string;
  syllabusEn: string;
  syllabusAr: string;
  assignments: {
    id: string;
    titleEn: string;
    titleAr: string;
    dueDateEn: string;
    dueDateAr: string;
    weight: string;
    submitted: boolean;
    score?: string;
  }[];
  materials: {
    id: string;
    titleEn: string;
    titleAr: string;
    type: 'PDF' | 'Slide' | 'Code';
    size: string;
  }[];
}

const COURSES_DATA: CourseDetail[] = [
  {
    id: 'cs401',
    code: 'CS-401',
    titleEn: 'Advanced Software Architecture',
    titleAr: 'هندسة البرمجيات المتقدمة',
    departmentEn: 'Computer Science & Engineering',
    departmentAr: 'قسم علوم وهندسة الحاسب',
    instructorEn: 'Dr. Sarah Al-Mansoor',
    instructorAr: 'د. سارة المنصور',
    credits: 4,
    grade: 'A',
    progress: 82,
    scheduleEn: 'Mon, Wed 09:00 - 10:30 AM',
    scheduleAr: 'الإثنين، الأربعاء ٠٩:٠٠ - ١٠:٣٠ صباحاً',
    roomEn: 'Engineering Lab 3B',
    roomAr: 'معمل الهندسة ٣ب',
    syllabusEn: 'Design patterns, microservices architecture, event-driven systems, domain-driven design, and cloud scalability.',
    syllabusAr: 'أنماط التصميم، الميكروسيرفيس، الأنظمة الموجهة للأحداث، والتصميم الموجه بالنطاق وقابلية التوسع.',
    assignments: [
      {
        id: 'asg1',
        titleEn: 'Microservices System Blueprint',
        titleAr: 'مشروع مخطط الأنظمة الموزعة',
        dueDateEn: 'Sep 14, 2026 - 11:59 PM',
        dueDateAr: '١٤ سبتمبر ٢٠٢٦ - ١١:٥٩ مساءً',
        weight: '20%',
        submitted: false,
      },
      {
        id: 'asg2',
        titleEn: 'Domain-Driven Design Essay',
        titleAr: 'مقال التصميم الموجه بالنطاق DDD',
        dueDateEn: 'Aug 28, 2026',
        dueDateAr: '٢٨ أغسطس ٢٠٢٦',
        weight: '10%',
        submitted: true,
        score: '95 / 100',
      },
    ],
    materials: [
      { id: 'm1', titleEn: 'Lecture 01 - Architectural Patterns', titleAr: 'المحاضرة ٠١ - أنماط المعمارية', type: 'PDF', size: '3.4 MB' },
      { id: 'm2', titleEn: 'Lecture 02 - Microservices Communication', titleAr: 'المحاضرة ٠٢ - الاتصال بين الخدمات', type: 'Slide', size: '8.1 MB' },
      { id: 'm3', titleEn: 'Lab Code - Event Bus Demo', titleAr: 'معمل البرمجة - نموذج ناقل الأحداث', type: 'Code', size: '1.2 MB' },
    ],
  },
  {
    id: 'db302',
    code: 'DB-302',
    titleEn: 'Database Systems & Data Warehousing',
    titleAr: 'أنظمة قواعد البيانات والمستودعات',
    departmentEn: 'Information Systems',
    departmentAr: 'قسم نظم المعلومات',
    instructorEn: 'Prof. Tariq Hassan',
    instructorAr: 'أ.د. طارق حسن',
    credits: 3,
    grade: 'A-',
    progress: 75,
    scheduleEn: 'Sun, Tue 11:00 AM - 12:30 PM',
    scheduleAr: 'الأحد، الثلاثاء ١١:٠٠ صباحاً - ١٢:٣٠ ظهراً',
    roomEn: 'Lecture Hall 102',
    roomAr: 'قاعة المحاضرات ١٠٢',
    syllabusEn: 'Relational algebra, query optimization, indexing strategies, OLAP databases, and ETL pipelines.',
    syllabusAr: 'الجبر العلائقي، تحسين الاستعلامات، الفهرسة، قواعد بيانات OLAP وأنابيب معالجة البيانات ETL.',
    assignments: [
      {
        id: 'asg3',
        titleEn: 'SQL Query Optimization Lab',
        titleAr: 'معمل تحسين استعلامات SQL',
        dueDateEn: 'Sep 18, 2026 - 11:59 PM',
        dueDateAr: '١٨ سبتمبر ٢٠٢٦ - ١١:٥٩ مساءً',
        weight: '15%',
        submitted: false,
      },
      {
        id: 'asg4',
        titleEn: 'ERD Modeling Homework',
        titleAr: 'واجب نمذجة مخططات العلاقة ERD',
        dueDateEn: 'Aug 30, 2026',
        dueDateAr: '٣٠ أغسطس ٢٠٢٦',
        weight: '10%',
        submitted: true,
        score: '90 / 100',
      },
    ],
    materials: [
      { id: 'm4', titleEn: 'Chapter 4 - Query Execution Engine', titleAr: 'الفصل ٤ - محرك تنفيذ الاستعلامات', type: 'PDF', size: '4.8 MB' },
      { id: 'm5', titleEn: 'Warehousing Architecture Slides', titleAr: 'عرض معمارية مستودعات البيانات', type: 'Slide', size: '12.0 MB' },
    ],
  },
  {
    id: 'ai405',
    code: 'AI-405',
    titleEn: 'Machine Learning & Neural Networks',
    titleAr: 'تعلم الآلة والشبكات العصبية',
    departmentEn: 'Artificial Intelligence Dept',
    departmentAr: 'قسم الذكاء الاصطناعي',
    instructorEn: 'Dr. Layla Mahmoud',
    instructorAr: 'د. ليلى محمود',
    credits: 4,
    grade: 'B+',
    progress: 68,
    scheduleEn: 'Mon, Wed 01:00 - 02:30 PM',
    scheduleAr: 'الإثنين، الأربعاء ٠١:٠٠ - ٠٢:٣٠ مساءً',
    roomEn: 'Tech Center Lab 01',
    roomAr: 'معمل مركز التقنية ٠١',
    syllabusEn: 'Supervised & unsupervised learning, backpropagation, convolutional neural networks, and model deployment.',
    syllabusAr: 'التعلم الخاضع وغير الخاضع للإشراف، الانتشار الخلفي، الشبكات العصبية التلافيفية CNN وتطوير النماذج.',
    assignments: [
      {
        id: 'asg5',
        titleEn: 'Neural Net Training Quiz',
        titleAr: 'اختبار تدريب النماذج العصبية',
        dueDateEn: 'Sep 16, 2026',
        dueDateAr: '١٦ سبتمبر ٢٠٢٦',
        weight: '15%',
        submitted: false,
      },
    ],
    materials: [
      { id: 'm6', titleEn: 'Intro to Backpropagation', titleAr: 'مقدمة للانتشار الخلفي', type: 'PDF', size: '2.9 MB' },
      { id: 'm7', titleEn: 'Jupyter Notebook - Linear Regression', titleAr: 'دفتر جوبيتر - الانحدار الخطي', type: 'Code', size: '0.8 MB' },
    ],
  },
];

export function StudentCoursesPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [selectedCourse, setSelectedCourse] = useState<CourseDetail>(COURSES_DATA[0]);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [targetAssignment, setTargetAssignment] = useState<any>(null);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  const handleOpenSubmit = (assignment: any) => {
    setTargetAssignment(assignment);
    setSubmissionModalOpen(true);
    setSubmitSuccessNotice(false);
  };

  const handleConfirmSubmit = () => {
    if (!targetAssignment) return;
    targetAssignment.submitted = true;
    targetAssignment.score = isAr ? 'بانتظار التصحيح' : 'Pending Review';
    setSubmitSuccessNotice(true);
    setTimeout(() => {
      setSubmissionModalOpen(false);
    }, 1200);
  };

  return (
    <AdminPage
      title={isAr ? 'المقررات الدراسية المسجلة' : 'My Enrolled Courses'}
      description={isAr
        ? 'متابعة تفاصيل المقررات، التوصيف الدراسي، التكليفات المطلوبة، وتحميل المحاضرات والملفات.'
        : 'Review course syllabi, instructor contacts, submission deadlines, and lecture materials.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', href: '/student' },
        { label: isAr ? 'مقرراتي' : 'My Courses' },
      ]}
    >
      <Tabs defaultSelectedIndex={0}>
        <TabList aria-label="Course Sections">
          <Tab>{isAr ? 'المقررات الحالية (3)' : 'Active Term Courses (3)'}</Tab>
          <Tab>{isAr ? 'المقررات المكتملة' : 'Completed History'}</Tab>
        </TabList>

        <div style={{ marginTop: '1.25rem' }}>
          <TabPanels>
            {/* Active Courses Tab */}
            <TabPanel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
              {/* Left Column: Course Cards Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-secondary)' }}>
                  {isAr ? 'اختر المقرر لاستعراض التفاصيل:' : 'Select course to view syllabus & tasks:'}
                </span>

                {COURSES_DATA.map((course) => {
                  const isSelected = selectedCourse.id === course.id;
                  return (
                    <Tile
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--cds-layer-selected, var(--cds-layer-02))' : 'var(--cds-layer-01)',
                        border: isSelected ? '2px solid var(--cds-focus, #0f62fe)' : '1px solid var(--cds-border-subtle)',
                        borderRadius: '2px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <Tag type="blue" size="sm" style={{ margin: 0 }}>
                          {course.code}
                        </Tag>
                        <Tag type="teal" size="sm" style={{ margin: 0 }}>
                          {course.credits} {isAr ? 'ساعات' : 'Credits'}
                        </Tag>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cds-text-primary)' }}>
                        {isAr ? course.titleAr : course.titleEn}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                        {isAr ? course.instructorAr : course.instructorEn}
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        <ProgressBar
                          label=""
                          value={course.progress}
                          max={100}
                          status="active"
                          hideLabel
                          size="small"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                          <span>{isAr ? 'التقدم' : 'Progress'}</span>
                          <span>{course.progress}%</span>
                        </div>
                      </div>
                    </Tile>
                  );
                })}
              </div>

              {/* Right Column: Selected Course Syllabus & Workspace */}
              <div>
                <Layer level={1}>
                  <div
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--cds-layer-01)',
                      border: '1px solid var(--cds-border-subtle)',
                      borderRadius: '2px',
                    }}
                  >
                    {/* Selected Header */}
                    <div style={{ borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <Tag type="purple" size="md">
                            {selectedCourse.code}
                          </Tag>
                          <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                            {isAr ? selectedCourse.titleAr : selectedCourse.titleEn}
                          </h3>
                          <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                            {isAr ? selectedCourse.departmentAr : selectedCourse.departmentEn}
                          </div>
                        </div>

                        <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                          <Tag type="teal" size="md">
                            {isAr ? `الأستاذ: ${selectedCourse.instructorAr}` : `Faculty: ${selectedCourse.instructorEn}`}
                          </Tag>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--cds-text-primary)' }}>
                        <div>
                          <strong>{isAr ? 'الموعد:' : 'Schedule:'}</strong> {isAr ? selectedCourse.scheduleAr : selectedCourse.scheduleEn}
                        </div>
                        <div>
                          <strong>{isAr ? 'القاعة:' : 'Room:'}</strong> {isAr ? selectedCourse.roomAr : selectedCourse.roomEn}
                        </div>
                      </div>
                    </div>

                    {/* Syllabus Overview */}
                    <AdminSection title={isAr ? 'التوصيف ومحتوى المقرر' : 'Course Syllabus & Overview'}>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-primary)', lineHeight: 1.6 }}>
                        {isAr ? selectedCourse.syllabusAr : selectedCourse.syllabusEn}
                      </p>
                    </AdminSection>

                    {/* Assignments & Submissions Section */}
                    <AdminSection title={isAr ? 'التكليفات والواجبات المطلوبة' : 'Assignments & Deliverables'}>
                      <Table size="sm">
                        <TableHead>
                          <TableRow>
                            <TableHeader>{isAr ? 'اسم التكليف' : 'Assignment Title'}</TableHeader>
                            <TableHeader>{isAr ? 'تاريخ التسليم' : 'Due Date'}</TableHeader>
                            <TableHeader>{isAr ? 'الوزن' : 'Weight'}</TableHeader>
                            <TableHeader>{isAr ? 'الحالة والدرجة' : 'Status / Score'}</TableHeader>
                            <TableHeader>{isAr ? 'الإجراء' : 'Action'}</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedCourse.assignments.map((asg) => (
                            <TableRow key={asg.id}>
                              <TableCell style={{ fontWeight: 600 }}>
                                {isAr ? asg.titleAr : asg.titleEn}
                              </TableCell>
                              <TableCell style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                {isAr ? asg.dueDateAr : asg.dueDateEn}
                              </TableCell>
                              <TableCell>{asg.weight}</TableCell>
                              <TableCell>
                                {asg.submitted ? (
                                  <Tag type="green" size="sm" renderIcon={CheckmarkFilled}>
                                    {asg.score || (isAr ? 'تم التسليم' : 'Submitted')}
                                  </Tag>
                                ) : (
                                  <Tag type="red" size="sm" renderIcon={Time}>
                                    {isAr ? 'معلق' : 'Pending'}
                                  </Tag>
                                )}
                              </TableCell>
                              <TableCell>
                                {asg.submitted ? (
                                  <Button kind="ghost" size="sm" disabled>
                                    {isAr ? 'تم التسليم' : 'Submitted'}
                                  </Button>
                                ) : (
                                  <Button kind="tertiary" size="sm" renderIcon={Upload} onClick={() => handleOpenSubmit(asg)}>
                                    {isAr ? 'رفع التكليف' : 'Upload File'}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AdminSection>

                    {/* Lecture Materials Downloads */}
                    <AdminSection title={isAr ? 'المحاضرات والمصادر الرقمية' : 'Lecture Materials & Downloads'}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {selectedCourse.materials.map((mat) => (
                          <div
                            key={mat.id}
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: 'var(--cds-layer-02)',
                              border: '1px solid var(--cds-border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: '2px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                              <Document size={18} style={{ color: 'var(--cds-icon-primary)' }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {isAr ? mat.titleAr : mat.titleEn}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                                  {mat.type} • {mat.size}
                                </div>
                              </div>
                            </div>
                            <Button kind="ghost" size="sm" hasIconOnly renderIcon={Download} iconDescription="Download File" />
                          </div>
                        ))}
                      </div>
                    </AdminSection>
                  </div>
                </Layer>
              </div>
            </div>
          </TabPanel>

          {/* Completed Courses Tab */}
          <TabPanel>
            <AdminSection title={isAr ? 'تاريخ المقررات المجتازة' : 'Passed Course History'}>
              <Table size="md">
                <TableHead>
                  <TableRow>
                    <TableHeader>{isAr ? 'رمز المقرر' : 'Course Code'}</TableHeader>
                    <TableHeader>{isAr ? 'اسم المقرر' : 'Title'}</TableHeader>
                    <TableHeader>{isAr ? 'الفصل الدراسي' : 'Term'}</TableHeader>
                    <TableHeader>{isAr ? 'الساعات' : 'Credits'}</TableHeader>
                    <TableHeader>{isAr ? 'التقدير النهائى' : 'Final Grade'}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ fontWeight: 600 }}>CS-201</TableCell>
                    <TableCell>{isAr ? 'هياكل البيانات والخوارزميات' : 'Data Structures & Algorithms'}</TableCell>
                    <TableCell>{isAr ? 'ربيع 2026' : 'Spring 2026'}</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell><Tag type="teal" size="sm">A</Tag></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 600 }}>MATH-101</TableCell>
                    <TableCell>{isAr ? 'الرياضيات المتقدمة والهندسة التحليلية' : 'Calculus & Analytical Geometry'}</TableCell>
                    <TableCell>{isAr ? 'خريف 2025' : 'Fall 2025'}</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell><Tag type="teal" size="sm">A+</Tag></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 600 }}>ENG-102</TableCell>
                    <TableCell>{isAr ? 'الكتابة الفنية والأكاديمية' : 'Technical & Academic Writing'}</TableCell>
                    <TableCell>{isAr ? 'خريف 2025' : 'Fall 2025'}</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell><Tag type="teal" size="sm">A</Tag></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AdminSection>
          </TabPanel>
        </TabPanels>
      </div>
      </Tabs>

      {/* Assignment Upload Modal */}
      <Modal
        open={submissionModalOpen}
        onRequestClose={() => setSubmissionModalOpen(false)}
        modalHeading={isAr ? 'تسليم الملف والتكليف الأكاديمي' : 'Submit Academic Deliverable'}
        modalLabel={targetAssignment ? (isAr ? targetAssignment.titleAr : targetAssignment.titleEn) : ''}
        primaryButtonText={isAr ? 'تاكيد التسليم النهائي' : 'Confirm Submission'}
        secondaryButtonText={isAr ? 'إلغاء' : 'Cancel'}
        onSecondarySubmit={() => setSubmissionModalOpen(false)}
        onRequestSubmit={handleConfirmSubmit}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          {submitSuccessNotice && (
            <InlineNotification
              kind="success"
              title={isAr ? 'تم التسليم بنجاح!' : 'Submission Received!'}
              subtitle={isAr ? 'تم تسجيل ملفك بنجاح وسوف يتم تصحيحه بواسطة الأستاذ.' : 'Your file has been recorded successfully and sent to faculty.'}
            />
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
            {isAr
              ? 'يرجى إرفاق ملف التكليف بصيغة (PDF or ZIP) بحيث لا يتجاوز حجمه 25 ميجابايت.'
              : 'Please attach your assignment solution (PDF or ZIP format). Maximum filesize is 25 MB.'}
          </p>

          <FileUploader
            labelTitle={isAr ? 'رفع ملف الواجب' : 'Upload Solution File'}
            labelDescription={isAr ? 'صيغ المقبولة: .pdf, .zip, .docx' : 'Accepted formats: .pdf, .zip, .docx'}
            buttonLabel={isAr ? 'اختر ملفاً' : 'Add File'}
            filenameStatus="edit"
            accept={['.pdf', '.zip', '.docx']}
            multiple={false}
          />

          <TextInput
            id="submission-notes"
            labelText={isAr ? 'ملاحظات إضافية للأستاذ (اختياري)' : 'Additional Notes for Faculty (Optional)'}
            placeholder={isAr ? 'اكتب أي ملاحظات ترغب بإرفاقها مع الحل...' : 'Enter any comments regarding your submission...'}
          />
        </div>
      </Modal>
    </AdminPage>
  );
}

export default StudentCoursesPage;
