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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Layer,
} from '@carbon/react';
import {
  Calendar,
  Time,
  Printer,
  Location,
  User,
  Events,
  CheckmarkOutline,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';

interface TimetableSlot {
  timeSlot: string;
  sun?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' };
  mon?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' };
  tue?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' };
  wed?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' };
  thu?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' };
}

const WEEKLY_TIMETABLE: TimetableSlot[] = [
  {
    timeSlot: '08:30 - 10:00 AM',
    mon: { code: 'CS-401', titleEn: 'Advanced Software Arch', titleAr: 'هندسة البرمجيات المتقدمة', roomEn: 'Eng Lab 3B', roomAr: 'معمل الهندسة ٣ب', type: 'lecture' },
    wed: { code: 'CS-401', titleEn: 'Advanced Software Arch', titleAr: 'هندسة البرمجيات المتقدمة', roomEn: 'Eng Lab 3B', roomAr: 'معمل الهندسة ٣ب', type: 'lecture' },
    thu: { code: 'MATH-204', titleEn: 'Applied Statistics', titleAr: 'الإحصاء التطبيقي', roomEn: 'Auditorium A', roomAr: 'المدرج أ', type: 'lecture' },
  },
  {
    timeSlot: '11:00 - 12:30 PM',
    sun: { code: 'DB-302', titleEn: 'Database Systems', titleAr: 'أنظمة قواعد البيانات', roomEn: 'Hall 102', roomAr: 'قاعة ١٠٢', type: 'lecture' },
    tue: { code: 'DB-302', titleEn: 'Database Systems', titleAr: 'أنظمة قواعد البيانات', roomEn: 'Hall 102', roomAr: 'قاعة ١٠٢', type: 'lecture' },
  },
  {
    timeSlot: '01:00 - 02:30 PM',
    mon: { code: 'AI-405', titleEn: 'Machine Learning Lab', titleAr: 'معمل تعلم الآلة', roomEn: 'Tech Center 01', roomAr: 'مركز التقنية ٠١', type: 'lab' },
    wed: { code: 'AI-405', titleEn: 'Machine Learning Lab', titleAr: 'معمل تعلم الآلة', roomEn: 'Tech Center 01', roomAr: 'مركز التقنية ٠١', type: 'lab' },
  },
];

interface ExamSchedule {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  dateEn: string;
  dateAr: string;
  timeEn: string;
  timeAr: string;
  roomEn: string;
  roomAr: string;
  status: 'upcoming' | 'completed';
}

const EXAM_SCHEDULE: ExamSchedule[] = [
  {
    id: 'e1',
    code: 'CS-401',
    titleEn: 'Midterm Written Examination',
    titleAr: 'الاختبار النصفى التحريري',
    dateEn: 'Oct 12, 2026',
    dateAr: '١٢ أكتوبر ٢٠٢٦',
    timeEn: '10:00 - 12:00 PM',
    timeAr: '١٠:٠٠ - ١٢:٠٠ ظهراً',
    roomEn: 'Main Exam Hall 3',
    roomAr: 'الصالة الكبرى ٣',
    status: 'upcoming',
  },
  {
    id: 'e2',
    code: 'DB-302',
    titleEn: 'Midterm Practical Exam',
    titleAr: 'الاختبار النصفى العملي',
    dateEn: 'Oct 15, 2026',
    dateAr: '١٥ أكتوبر ٢٠٢٦',
    timeEn: '01:00 - 03:00 PM',
    timeAr: '٠١:٠٠ - ٠٣:٠٠ مساءً',
    roomEn: 'Database Lab B',
    roomAr: 'معمل قواعد البيانات ب',
    status: 'upcoming',
  },
  {
    id: 'e3',
    code: 'MATH-204',
    titleEn: 'First Quiz Assessment',
    titleAr: 'الاختبار القصير الأول',
    dateEn: 'Sep 05, 2026',
    dateAr: '٥ سبتمبر ٢٠٢٦',
    timeEn: '09:00 - 10:00 AM',
    timeAr: '٠٩:٠٠ - ١٠:٠٠ صباحاً',
    roomEn: 'Auditorium A',
    roomAr: 'المدرج أ',
    status: 'completed',
  },
];

export function StudentSchedulePage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const handlePrint = () => {
    window.print();
  };

  const renderSlot = (slotItem?: { code: string; titleEn: string; titleAr: string; roomEn: string; roomAr: string; type: 'lecture' | 'lab' }) => {
    if (!slotItem) {
      return <span style={{ color: 'var(--cds-text-placeholder)', fontSize: '0.75rem' }}>—</span>;
    }
    return (
      <div
        style={{
          padding: '0.5rem 0.625rem',
          backgroundColor: slotItem.type === 'lab' ? 'var(--cds-layer-selected-hover, var(--cds-layer-02))' : 'var(--cds-layer-01)',
          borderLeft: isAr ? 'none' : `3px solid ${slotItem.type === 'lab' ? '#0f62fe' : '#8a3ffc'}`,
          borderRight: isAr ? `3px solid ${slotItem.type === 'lab' ? '#0f62fe' : '#8a3ffc'}` : 'none',
          borderRadius: '2px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--cds-text-primary)' }}>
          {slotItem.code}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isAr ? slotItem.titleAr : slotItem.titleEn}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Location size={12} />
          <span>{isAr ? slotItem.roomAr : slotItem.roomEn}</span>
        </div>
      </div>
    );
  };

  return (
    <AdminPage
      title={isAr ? 'الجدول الدراسي والتوقيتات' : 'Class Timetable & Schedule'}
      description={isAr
        ? 'استعراض الجدول الأكاديمي الأسبوعي، قاعات المحاضرات والمعامل، ومواعيد الاختبارات المحددة.'
        : 'View your weekly academic schedule, lecture room locations, lab sessions, and exam timetables.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', href: '/student' },
        { label: isAr ? 'الجدول الدراسي' : 'Schedule' },
      ]}
      actions={
        <Button kind="tertiary" size="md" renderIcon={Printer} onClick={handlePrint}>
          {isAr ? 'طباعة الجدول الرسمي' : 'Print Timetable'}
        </Button>
      }
    >
      <Tabs defaultSelectedIndex={0}>
        <TabList aria-label="Schedule views">
          <Tab>{isAr ? 'الجدول الأسبوعي' : 'Weekly Timetable'}</Tab>
          <Tab>{isAr ? 'جدول الاختبارات النصفية والنهائية' : 'Exam Timetable'}</Tab>
        </TabList>

        <div style={{ marginTop: '1.25rem' }}>
          <TabPanels>
            {/* Weekly Timetable Tab */}
          <TabPanel>
            <AdminSection title={isAr ? 'الجدول الدراسي الخريفي 2026' : 'Fall Semester 2026 Timetable'}>
              <Table size="md" useZebraStyles>
                <TableHead>
                  <TableRow>
                    <TableHeader>{isAr ? 'الوقت' : 'Time Slot'}</TableHeader>
                    <TableHeader>{isAr ? 'الأحد' : 'Sunday'}</TableHeader>
                    <TableHeader>{isAr ? 'الإثنين' : 'Monday'}</TableHeader>
                    <TableHeader>{isAr ? 'الثلاثاء' : 'Tuesday'}</TableHeader>
                    <TableHeader>{isAr ? 'الأربعاء' : 'Wednesday'}</TableHeader>
                    <TableHeader>{isAr ? 'الخميس' : 'Thursday'}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {WEEKLY_TIMETABLE.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell style={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Time size={14} />
                          <span>{row.timeSlot}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderSlot(row.sun)}</TableCell>
                      <TableCell>{renderSlot(row.mon)}</TableCell>
                      <TableCell>{renderSlot(row.tue)}</TableCell>
                      <TableCell>{renderSlot(row.wed)}</TableCell>
                      <TableCell>{renderSlot(row.thu)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminSection>
          </TabPanel>

          {/* Exam Timetable Tab */}
          <TabPanel>
            <AdminSection title={isAr ? 'جدول الاختبارات المقررة' : 'Scheduled Midterm & Final Exams'}>
              <Table size="md">
                <TableHead>
                  <TableRow>
                    <TableHeader>{isAr ? 'رمز المقرر' : 'Course Code'}</TableHeader>
                    <TableHeader>{isAr ? 'نوع الاختبار' : 'Exam Title'}</TableHeader>
                    <TableHeader>{isAr ? 'التاريخ' : 'Date'}</TableHeader>
                    <TableHeader>{isAr ? 'التوقيت' : 'Time'}</TableHeader>
                    <TableHeader>{isAr ? 'القاعة الامتحانية' : 'Exam Hall'}</TableHeader>
                    <TableHeader>{isAr ? 'الحالة' : 'Status'}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {EXAM_SCHEDULE.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell style={{ fontWeight: 600, color: 'var(--cds-link-primary)' }}>
                        {exam.code}
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        {isAr ? exam.titleAr : exam.titleEn}
                      </TableCell>
                      <TableCell>{isAr ? exam.dateAr : exam.dateEn}</TableCell>
                      <TableCell>{isAr ? exam.timeAr : exam.timeEn}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Location size={14} />
                          <span>{isAr ? exam.roomAr : exam.roomEn}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {exam.status === 'upcoming' ? (
                          <Tag type="magenta" size="sm" renderIcon={Time}>
                            {isAr ? 'قادم' : 'Upcoming'}
                          </Tag>
                        ) : (
                          <Tag type="cool-gray" size="sm" renderIcon={CheckmarkOutline}>
                            {isAr ? 'مكتمل' : 'Completed'}
                          </Tag>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminSection>
          </TabPanel>
        </TabPanels>
      </div>
      </Tabs>
    </AdminPage>
  );
}

export default StudentSchedulePage;
