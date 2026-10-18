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
  Network_3,
  Catalog,
  Calendar,
  CheckmarkOutline,
  User,
  Task,
  ArrowRight,
  Time,
  Group,
  Edit,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';
import { AdminMetricCard } from '../../../ui/admin/AdminMetricCard';

interface TeachingClass {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  section: string;
  studentsCount: number;
  roomEn: string;
  roomAr: string;
  scheduleEn: string;
  scheduleAr: string;
  status: 'active' | 'completed';
}

const TEACHING_CLASSES: TeachingClass[] = [
  {
    id: 'tc1',
    code: 'CS-401',
    titleEn: 'Advanced Software Architecture',
    titleAr: 'هندسة البرمجيات المتقدمة',
    section: 'Sec 01',
    studentsCount: 42,
    roomEn: 'Engineering Lab 3B',
    roomAr: 'معمل الهندسة ٣ب',
    scheduleEn: 'Sun, Tue 09:00 - 10:30 AM',
    scheduleAr: 'الأحد، الثلاثاء ٠٩:٠٠ - ١٠:٣٠ صباحاً',
    status: 'active',
  },
  {
    id: 'tc2',
    code: 'CS-201',
    titleEn: 'Data Structures & Algorithms',
    titleAr: 'هياكل البيانات والخوارزميات',
    section: 'Sec 02',
    studentsCount: 56,
    roomEn: 'Lecture Hall 104',
    roomAr: 'قاعة المحاضرات ١٠٤',
    scheduleEn: 'Mon, Wed 11:00 AM - 12:30 PM',
    scheduleAr: 'الإثنين، الأربعاء ١١:٠٠ صباحاً - ١٢:٣٠ ظهراً',
    status: 'active',
  },
  {
    id: 'tc3',
    code: 'CS-499',
    titleEn: 'Senior Capstone Project Studio',
    titleAr: 'استوديو مشروع التخرج',
    section: 'Sec 01',
    studentsCount: 30,
    roomEn: 'Innovation Lab A',
    roomAr: 'معمل الابتكار أ',
    scheduleEn: 'Thu 01:00 - 04:00 PM',
    scheduleAr: 'الخميس ٠١:٠٠ - ٠٤:٠٠ مساءً',
    status: 'active',
  },
];

interface PendingGradingItem {
  id: string;
  classCode: string;
  titleEn: string;
  titleAr: string;
  submittedCount: number;
  totalStudents: number;
  deadlineEn: string;
  deadlineAr: string;
}

const PENDING_GRADING: PendingGradingItem[] = [
  {
    id: 'g1',
    classCode: 'CS-401',
    titleEn: 'Midterm Architecture Design Project',
    titleAr: 'مشروع التصميم المعماري النصفى',
    submittedCount: 40,
    totalStudents: 42,
    deadlineEn: 'Needs review by Sep 15',
    deadlineAr: 'يتطلب التصحيح بحلول ١٥ سبتمبر',
  },
  {
    id: 'g2',
    classCode: 'CS-201',
    titleEn: 'Algorithm Complexity Quiz #2',
    titleAr: 'اختبار تعقيد الخوارزميات الثاني',
    submittedCount: 55,
    totalStudents: 56,
    deadlineEn: 'Needs review by Sep 17',
    deadlineAr: 'يتطلب التصحيح بحلول ١٧ سبتمبر',
  },
];

export function InstructorDashboard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  return (
    <AdminPage
      title={isAr ? 'بوابة هيئة التدريس' : 'Faculty Instruction Portal'}
      description={isAr 
        ? 'إدارة الفصول الدراسية المسندة، متابعة حضور الطلاب، رصد الدرجات، وجدول المحاضرات.' 
        : 'Manage assigned academic sections, student rosters, grading tasks, and lecture schedules.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة المعلم' : 'Instructor Portal', href: '/instructor' },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Tag type="teal" size="md">
            {isAr ? 'عضو هيئة التدريس: د. سارة المنصور' : 'Faculty: Dr. Sarah Al-Mansoor'}
          </Tag>
          <Tag type="purple" size="md">
            {isAr ? 'قسم علوم الحاسب والمعلومات' : 'Dept: Computer Science'}
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
          title={isAr ? 'الشعب الدراسية النشطة' : 'Active Class Sections'}
          value="3"
          subtitle={isAr ? 'الفصل الدراسي الخريفي 2026' : 'Fall Semester 2026'}
          icon={<Network_3 size={20} />}
        />
        <AdminMetricCard
          title={isAr ? 'إجمالي الطلاب المسجلين' : 'Total Students Taught'}
          value="128"
          subtitle={isAr ? 'عبر 3 شعب دراسية' : 'Across 3 Sections'}
          icon={<Group size={20} />}
        />
        <AdminMetricCard
          title={isAr ? 'مهام رصد الدرجات المعلقة' : 'Pending Grading Tasks'}
          value="95"
          subtitle={isAr ? 'إجابات بانتظار التقييم' : 'Submissions to review'}
          icon={<Edit size={20} />}
          kind="warning"
        />
        <AdminMetricCard
          title={isAr ? 'متوسط نسبة الحضور' : 'Average Class Attendance'}
          value="94.2%"
          subtitle={isAr ? 'معدل انضباط ممتاز' : 'High engagement'}
          icon={<CheckmarkOutline size={20} />}
          kind="success"
        />
      </div>

      {/* Main Grid: Teaching Classes & Grading Queue */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Assigned Classes Table */}
        <div style={{ gridColumn: 'span 2' }}>
          <AdminSection title={isAr ? 'الشعب والمقررات الدراسية' : 'Assigned Academic Classes'}>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>{isAr ? 'رمز المقرر' : 'Course Code'}</TableHeader>
                  <TableHeader>{isAr ? 'اسم المقرر والشعبة' : 'Title & Section'}</TableHeader>
                  <TableHeader>{isAr ? 'الطلاب المسجلون' : 'Enrolled Students'}</TableHeader>
                  <TableHeader>{isAr ? 'المكان والزمان' : 'Room & Schedule'}</TableHeader>
                  <TableHeader>{isAr ? 'الحالة' : 'Status'}</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {TEACHING_CLASSES.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ fontWeight: 600, color: 'var(--cds-link-primary)' }}>
                      {item.code}
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 600 }}>{isAr ? item.titleAr : item.titleEn}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                        {item.section}
                      </div>
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{item.studentsCount} {isAr ? 'طالباً' : 'Students'}</TableCell>
                    <TableCell>
                      <div>{isAr ? item.roomAr : item.roomEn}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                        {isAr ? item.scheduleAr : item.scheduleEn}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tag type="green" size="sm">
                        {isAr ? 'نشط' : 'Active'}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminSection>
        </div>

        {/* Right Column: Grading Queue & Faculty Actions */}
        <div>
          {/* Grading Queue */}
          <AdminSection title={isAr ? 'طابور التصحيح والتقييم' : 'Pending Grading Queue'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PENDING_GRADING.map((item) => (
                <Tile
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle)',
                    padding: '0.875rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <Tag type="purple" size="sm" style={{ margin: 0 }}>
                      {item.classCode}
                    </Tag>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)' }}>
                      {item.submittedCount} / {item.totalStudents} {isAr ? 'تم التسليم' : 'Submitted'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                    {isAr ? item.titleAr : item.titleEn}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ProgressBar
                      label=""
                      value={(item.submittedCount / item.totalStudents) * 100}
                      max={100}
                      status="active"
                      hideLabel
                      size="small"
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-warning)', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Time size={14} />
                    <span>{isAr ? item.deadlineAr : item.deadlineEn}</span>
                  </div>
                </Tile>
              ))}
            </div>
          </AdminSection>

          {/* Quick Faculty Tools */}
          <AdminSection title={isAr ? 'أدوات عضو هيئة التدريس' : 'Faculty Quick Tools'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Button kind="tertiary" size="md" renderIcon={Edit} className="cds-w-full cds-justify-start">
                {isAr ? 'رصد وتحديث درجات الطلاب' : 'Grade Assignment Submissions'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={CheckmarkOutline} className="cds-w-full cds-justify-start">
                {isAr ? 'تسجيل كشف الحضور والغياب' : 'Take Class Attendance'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={Calendar} className="cds-w-full cds-justify-start">
                {isAr ? 'تحديد الساعات المكتبية' : 'Schedule Office Hours'}
              </Button>
              <Button kind="tertiary" size="md" renderIcon={Task} className="cds-w-full cds-justify-start">
                {isAr ? 'نشر إعلان أكاديمي للطلاب' : 'Post Course Announcement'}
              </Button>
            </div>
          </AdminSection>
        </div>
      </div>
    </AdminPage>
  );
}

export default InstructorDashboard;
