import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Column,
  Tile,
  Button,
  Tag,
  ProgressBar,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Education,
  Catalog,
  Calendar,
  CheckmarkOutline,
  User,
  Document,
  ArrowRight,
  Time,
  Events,
  Book,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';
import { AdminMetricCard } from '../../../ui/admin/AdminMetricCard';

interface EnrolledCourse {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  instructorEn: string;
  instructorAr: string;
  credits: number;
  grade: string;
  progress: number;
  scheduleEn: string;
  scheduleAr: string;
}

const COURSES_DATA: EnrolledCourse[] = [
  {
    id: 'c1',
    code: 'CS-401',
    titleEn: 'Advanced Software Architecture',
    titleAr: 'هندسة البرمجيات المتقدمة',
    instructorEn: 'Dr. Sarah Al-Mansoor',
    instructorAr: 'د. سارة المنصور',
    credits: 4,
    grade: 'A',
    progress: 82,
    scheduleEn: 'Mon, Wed 09:00 - 10:30 AM (Lab 3B)',
    scheduleAr: 'الإثنين، الأربعاء ٠٩:٠٠ - ١٠:٣٠ صباحاً (معمل ٣ب)',
  },
  {
    id: 'c2',
    code: 'DB-302',
    titleEn: 'Database Systems & Data Warehousing',
    titleAr: 'أنظمة قواعد البيانات والمستودعات',
    instructorEn: 'Prof. Tariq Hassan',
    instructorAr: 'أ.د. طارق حسن',
    credits: 3,
    grade: 'A-',
    progress: 75,
    scheduleEn: 'Sun, Tue 11:00 AM - 12:30 PM (Hall 102)',
    scheduleAr: 'الأحد، الثلاثاء ١١:٠٠ صباحاً - ١٢:٣٠ ظهراً (قاعة ١٠٢)',
  },
  {
    id: 'c3',
    code: 'AI-405',
    titleEn: 'Machine Learning & Neural Networks',
    titleAr: 'تعلم الآلة والشبكات العصبية',
    instructorEn: 'Dr. Layla Mahmoud',
    instructorAr: 'د. ليلى محمود',
    credits: 4,
    grade: 'B+',
    progress: 68,
    scheduleEn: 'Mon, Wed 01:00 - 02:30 PM (Tech Center)',
    scheduleAr: 'الإثنين، الأربعاء ٠١:٠٠ - ٠٢:٣٠ مساءً (مركز التقنية)',
  },
  {
    id: 'c4',
    code: 'MATH-204',
    titleEn: 'Applied Statistics for Engineers',
    titleAr: 'الإحصاء التطبيقي للمهندسين',
    instructorEn: 'Dr. Omar Al-Ghamdi',
    instructorAr: 'د. عمر الغامدي',
    credits: 3,
    grade: 'A',
    progress: 90,
    scheduleEn: 'Thu 08:30 - 11:30 AM (Auditorium A)',
    scheduleAr: 'الخميس ٠٨:٣٠ - ١١:٣٠ صباحاً (المدرج أ)',
  },
];

interface UpcomingDeadline {
  id: string;
  course: string;
  titleEn: string;
  titleAr: string;
  dueDateEn: string;
  dueDateAr: string;
  type: 'assignment' | 'exam' | 'project';
  statusTag: 'red' | 'magenta' | 'green';
}

const DEADLINES_DATA: UpcomingDeadline[] = [
  {
    id: 'd1',
    course: 'CS-401',
    titleEn: 'Microservices System Blueprint',
    titleAr: 'مشروع مخطط الأنظمة الموزعة',
    dueDateEn: 'Tomorrow at 11:59 PM',
    dueDateAr: 'غداً الساعة ١١:٥٩ مساءً',
    type: 'project',
    statusTag: 'red',
  },
  {
    id: 'd2',
    course: 'AI-405',
    titleEn: 'Neural Net Model Training Quiz',
    titleAr: 'اختبار تدريب النماذج العصبية',
    dueDateEn: 'Sep 16, 2026',
    dueDateAr: '١٦ سبتمبر ٢٠٢٦',
    type: 'exam',
    statusTag: 'magenta',
  },
  {
    id: 'd3',
    course: 'DB-302',
    titleEn: 'SQL Query Optimization Lab',
    titleAr: 'معمل تحسين استعلامات SQL',
    dueDateEn: 'Sep 18, 2026',
    dueDateAr: '١٨ سبتمبر ٢٠٢٦',
    type: 'assignment',
    statusTag: 'green',
  },
];

export function StudentDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  return (
    <AdminPage
      title={isAr ? 'بوابة الطالب الأكاديمية' : 'Student Academic Portal'}
      description={isAr 
        ? 'متابعة الأداء الأكاديمي، المقررات المسجلة، الجدول الدراسي، والتكليفات القادمة.' 
        : 'Track your academic performance, registered courses, timetable, and upcoming assessment deadlines.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', href: '/student' },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Tag type="blue" size="md">
            {isAr ? 'الطالب: أحمد خالد (الرقم: 2024-8841)' : 'Student: Ahmed Khaled (ID: 2024-8841)'}
          </Tag>
          <Tag type="green" size="md">
            {isAr ? 'الحالة: منتظم (الفصل الخريفي 2026)' : 'Status: Enrolled (Fall 2026)'}
          </Tag>
        </div>
      }
    >
      {/* Metric Tiles Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <AdminMetricCard
          title={isAr ? 'المعدل التراكمي (GPA)' : 'Cumulative GPA'}
          value="3.84 / 4.00"
          subtitle={isAr ? 'مرتبة الشرف الأولى' : 'First Class Honors'}
          icon={<Education size={20} />}
          kind="success"
        />
        <AdminMetricCard
          title={isAr ? 'المقررات المسجلة' : 'Enrolled Courses'}
          value="4"
          subtitle={isAr ? 'إجمالي 14 ساعة معتمدة' : 'Total 14 Credit Hours'}
          icon={<Catalog size={20} />}
        />
        <AdminMetricCard
          title={isAr ? 'نسبة الحضور الأكاديمي' : 'Academic Attendance'}
          value="96.5%"
          subtitle={isAr ? 'ملتزم بالجدول الدراسي' : 'Excellent Record'}
          icon={<CheckmarkOutline size={20} />}
          kind="success"
        />
        <AdminMetricCard
          title={isAr ? 'التكليفات القادمة' : 'Pending Tasks'}
          value="3"
          subtitle={isAr ? 'تستوجب التسليم هذا الأسبوع' : 'Due this week'}
          icon={<Time size={20} />}
          kind="warning"
        />
      </div>

      {/* Main Grid: Courses Table & Side Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Enrolled Courses */}
        <div style={{ gridColumn: 'span 2' }}>
          <AdminSection title={isAr ? 'المقررات الدراسية الحالية' : 'Current Registered Courses'}>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>{isAr ? 'رمز المقرر' : 'Course Code'}</TableHeader>
                  <TableHeader>{isAr ? 'اسم المقرر' : 'Course Title'}</TableHeader>
                  <TableHeader>{isAr ? 'الأستاذ المحاضر' : 'Instructor'}</TableHeader>
                  <TableHeader>{isAr ? 'التقدير الحالي' : 'Current Grade'}</TableHeader>
                  <TableHeader>{isAr ? 'إنجاز الفصل' : 'Term Progress'}</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {COURSES_DATA.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell style={{ fontWeight: 600, color: 'var(--cds-link-primary)' }}>
                      {course.code}
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 600 }}>
                        {isAr ? course.titleAr : course.titleEn}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                        {isAr ? course.scheduleAr : course.scheduleEn}
                      </div>
                    </TableCell>
                    <TableCell>{isAr ? course.instructorAr : course.instructorEn}</TableCell>
                    <TableCell>
                      <Tag type="teal" size="sm">
                        {course.grade}
                      </Tag>
                    </TableCell>
                    <TableCell style={{ minWidth: '140px' }}>
                      <ProgressBar
                        label=""
                        value={course.progress}
                        max={100}
                        status="active"
                        hideLabel
                        size="small"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '2px', display: 'block' }}>
                        {course.progress}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminSection>
        </div>

        {/* Right Column: Deadlines & Quick Actions */}
        <div>
          {/* Upcoming Assessment Deadlines */}
          <AdminSection title={isAr ? 'التكليفات والواجبات القادمة' : 'Upcoming Assessment Deadlines'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DEADLINES_DATA.map((item) => (
                <Tile
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle)',
                    padding: '0.875rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <Tag type="blue" size="sm" style={{ margin: 0 }}>
                      {item.course}
                    </Tag>
                    <Tag type={item.statusTag} size="sm" style={{ margin: 0 }}>
                      {item.type.toUpperCase()}
                    </Tag>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                    {isAr ? item.titleAr : item.titleEn}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-error)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Time size={14} />
                    <span>{isAr ? item.dueDateAr : item.dueDateEn}</span>
                  </div>
                </Tile>
              ))}
            </div>
          </AdminSection>

          {/* Quick Academic Actions */}
          <AdminSection title={isAr ? 'خدمات الطالب السريعة' : 'Student Self-Service'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button kind="tertiary" size="md" renderIcon={Document} className="cds-w-full cds-justify-start">
                {isAr ? 'طلب السجل الأكاديمي الرسمى' : 'Request Official Transcript'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={Calendar} className="cds-w-full cds-justify-start">
                {isAr ? 'عرض الجدول الدراسي التفاعلي' : 'View Class Timetable'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={User} className="cds-w-full cds-justify-start">
                {isAr ? 'التواصل مع المرشد الأكاديمي' : 'Contact Academic Advisor'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={Book} className="cds-w-full cds-justify-start">
                {isAr ? 'المكتبة والمصادر الرقمية' : 'Digital Library & Research'}
              </Button>
            </div>
          </AdminSection>
        </div>
      </div>
    </AdminPage>
  );
}

export default StudentDashboard;
