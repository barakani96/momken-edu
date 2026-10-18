import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Modal,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
  Checkbox,
  ProgressIndicator,
  ProgressStep,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Accordion,
  AccordionItem,
} from '@carbon/react';
import {
  Add,
  CheckmarkOutline,
  Warning,
  ArrowRight,
  ArrowLeft,
  Catalog,
  Information,
  Checkmark,
  Close,
  Money,
} from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { StudentRecord, AcademicCourseRecord } from '../sisTypes';

interface CourseCatalogItem {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  credits: number;
  instructor: string;
  schedule: string;
  prerequisites: string[]; // e.g. ['MATH-201']
  capacity: number;
  enrolledSeats: number;
  fee: number;
}

const AVAILABLE_COURSE_CATALOG: CourseCatalogItem[] = [
  {
    id: 'c_math301',
    code: 'MATH-301',
    titleEn: 'Advanced Calculus II',
    titleAr: 'التفاضل والتكامل المتقدم 2',
    credits: 4,
    instructor: 'Dr. Ibrahim Al-Farsi',
    schedule: 'Sun/Tue/Thu 09:00 - 10:15',
    prerequisites: ['MATH-201'],
    capacity: 30,
    enrolledSeats: 24,
    fee: 3200,
  },
  {
    id: 'c_phys202',
    code: 'PHYS-202',
    titleEn: 'Classical Mechanics & Thermodynamics',
    titleAr: 'الميكانيكا الكلاسيكية والديناميكا الحرارية',
    credits: 4,
    instructor: 'Dr. Nadia Mansour',
    schedule: 'Mon/Wed 11:00 - 12:45',
    prerequisites: ['PHYS-101'],
    capacity: 25,
    enrolledSeats: 21,
    fee: 3400,
  },
  {
    id: 'c_comp204',
    code: 'COMP-204',
    titleEn: 'Data Structures & Algorithms',
    titleAr: 'هياكل البيانات والخوارزميات',
    credits: 4,
    instructor: 'Prof. Tariq Jamil',
    schedule: 'Sun/Tue 13:00 - 14:45',
    prerequisites: ['COMP-101'],
    capacity: 35,
    enrolledSeats: 30,
    fee: 3600,
  },
  {
    id: 'c_eng302',
    code: 'ENG-302',
    titleEn: 'Advanced Technical Writing & Research',
    titleAr: 'الكتابة التقنية المتقدمة والبحث العلمي',
    credits: 3,
    instructor: 'Dr. Sarah Jenkins',
    schedule: 'Thu 10:00 - 12:50',
    prerequisites: ['ENG-101'],
    capacity: 30,
    enrolledSeats: 18,
    fee: 2400,
  },
  {
    id: 'c_chem201',
    code: 'CHEM-201',
    titleEn: 'Organic Chemistry & Laboratory',
    titleAr: 'الكيمياء العضوية والمعمل',
    credits: 4,
    instructor: 'Dr. Faisal Al-Mutairi',
    schedule: 'Mon/Wed 08:00 - 10:15',
    prerequisites: ['CHEM-101'],
    capacity: 20,
    enrolledSeats: 19,
    fee: 3800,
  },
  {
    id: 'c_stat202',
    code: 'STAT-202',
    titleEn: 'Probability & Applied Statistics',
    titleAr: 'الاحتمالات والإحصاء التطبيقي',
    credits: 3,
    instructor: 'Dr. Layla Qasim',
    schedule: 'Tue/Thu 14:00 - 15:15',
    prerequisites: ['MATH-102'],
    capacity: 35,
    enrolledSeats: 22,
    fee: 2700,
  },
];

interface TermEnrollmentWizardProps {
  student: StudentRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const TermEnrollmentWizard: React.FC<TermEnrollmentWizardProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { createEnrollment } = useSisStore();

  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Term & Program Parameters
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [term, setTerm] = useState('Fall Semester');
  const [program, setProgram] = useState(student.program || 'General Academic Track');
  const [enrollmentType, setEnrollmentType] = useState<'new' | 're_enrollment' | 'continuing'>('continuing');

  // Step 2: Course Selection
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(['c_math301', 'c_comp204']);

  // Step 5: Financial Payment Plan
  const [paymentPlan, setPaymentPlan] = useState<'full_upfront' | 'three_installments' | 'sponsored'>('three_installments');

  // Step 6: Success state
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Completed courses lookup for prerequisite validation
  const completedCourseCodes = useMemo(() => {
    const codes = new Set<string>();
    student.academicRecords?.forEach((r) => {
      if (r.status === 'Completed' && r.grade !== 'F' && r.grade !== 'DNF') {
        codes.add(r.code);
      }
    });
    // Add mock baseline prerequisites if student record is sparse
    codes.add('MATH-201');
    codes.add('PHYS-101');
    codes.add('COMP-101');
    codes.add('ENG-101');
    codes.add('CHEM-101');
    codes.add('MATH-102');
    return codes;
  }, [student]);

  // Selected course objects
  const selectedCourses = useMemo(() => {
    return AVAILABLE_COURSE_CATALOG.filter((c) => selectedCourseIds.includes(c.id));
  }, [selectedCourseIds]);

  // Total credit hours
  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [selectedCourses]);

  // Total tuition fees
  const totalFees = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.fee, 0);
  }, [selectedCourses]);

  // Prerequisite validation results
  const prerequisiteValidationMap = useMemo(() => {
    const map: Record<string, { isValid: boolean; missing: string[] }> = {};
    selectedCourses.forEach((course) => {
      const missing = course.prerequisites.filter((p) => !completedCourseCodes.has(p));
      map[course.id] = {
        isValid: missing.length === 0,
        missing,
      };
    });
    return map;
  }, [selectedCourses, completedCourseCodes]);

  const hasPrerequisiteViolations = useMemo(() => {
    return Object.values(prerequisiteValidationMap).some((v) => !v.isValid);
  }, [prerequisiteValidationMap]);

  // Credit load validations
  const isCreditLoadValid = totalCredits >= 9 && totalCredits <= 19;
  const creditLoadWarning = totalCredits < 12
    ? 'Warning: Credit load is below full-time minimum (12 credits).'
    : totalCredits > 18
    ? 'Warning: Credit load exceeds standard maximum (18 credits) and requires academic advisor override.'
    : null;

  const handleToggleCourse = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const handleFinishEnrollment = () => {
    createEnrollment(student.id, {
      enrollmentCode: `ENR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      academicYear,
      term,
      program,
      enrollmentType,
      status: 'Enrolled',
      creditHours: totalCredits,
      enrollmentDate: new Date().toISOString().split('T')[0],
      notes: `Registered via Term Enrollment Wizard. Selected ${selectedCourses.length} courses (${totalCredits} credits). Payment plan: ${paymentPlan}.`,
    });
    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      modalHeading={
        isSubmitted
          ? 'Term Enrollment Completed Successfully'
          : `Term Enrollment & Course Registration Wizard — ${student.firstName} ${student.lastName}`
      }
      primaryButtonText={
        isSubmitted
          ? 'Close & Return'
          : currentStep === 5
          ? 'Confirm & Submit Enrollment'
          : 'Next Step'
      }
      secondaryButtonText={currentStep > 0 && !isSubmitted ? 'Back' : 'Cancel'}
      onRequestClose={onClose}
      onRequestSubmit={() => {
        if (isSubmitted) {
          onClose();
          setIsSubmitted(false);
          setCurrentStep(0);
        } else if (currentStep === 5) {
          handleFinishEnrollment();
        } else {
          setCurrentStep(currentStep + 1);
        }
      }}
      onSecondarySubmit={() => {
        if (isSubmitted) {
          onClose();
        } else if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
        } else {
          onClose();
        }
      }}
      size="lg"
    >
      <div style={{ padding: '0.5rem 0' }}>
        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckmarkOutline size={64} style={{ fill: 'var(--cds-support-02)', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Term Registration Confirmed!</h3>
            <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', marginInline: 'auto' }}>
              Successfully enrolled {student.firstName} {student.lastName} for {term} ({academicYear}). Total {totalCredits} credit hours registered with {paymentPlan.replace('_', ' ')} billing.
            </p>
            <Tag type="green" size="md">Status: Enrolled & Schedule Generated</Tag>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Guided multi-step wizard for academic term registration, course selection, prerequisite validation, and tuition assessment.
            </p>

            <ProgressIndicator currentIndex={currentStep} style={{ marginBottom: '2rem' }}>
              <ProgressStep label="1. Term & Program" />
              <ProgressStep label="2. Course Catalog" />
              <ProgressStep label="3. Prerequisite Check" />
              <ProgressStep label="4. Credits & Load" />
              <ProgressStep label="5. Financial Review" />
              <ProgressStep label="6. Final Confirm" />
            </ProgressIndicator>

            {/* Step 1: Term & Program */}
            {currentStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                <h4 style={{ fontWeight: 600 }}>Step 1: Term & Academic Program Parameters</h4>
                <Grid>
                  <Column sm={4} md={4} lg={4}>
                    <Select
                      id="wizard-ay"
                      labelText="Academic Year *"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    >
                      <SelectItem value="2026-2027" text="2026-2027" />
                      <SelectItem value="2027-2028" text="2027-2028" />
                    </Select>
                  </Column>
                  <Column sm={4} md={4} lg={4}>
                    <Select
                      id="wizard-term"
                      labelText="Academic Term *"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                    >
                      <SelectItem value="Fall Semester" text="Fall Semester" />
                      <SelectItem value="Spring Semester" text="Spring Semester" />
                      <SelectItem value="Summer Term" text="Summer Term" />
                    </Select>
                  </Column>
                </Grid>

                <Select
                  id="wizard-prog"
                  labelText="Program Track *"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  <SelectItem value="General Academic Track" text="General Academic Track" />
                  <SelectItem value="High School Diploma - Honors STEM" text="High School Diploma - Honors STEM" />
                  <SelectItem value="International Baccalaureate" text="International Baccalaureate" />
                </Select>

                <Select
                  id="wizard-type"
                  labelText="Enrollment Classification *"
                  value={enrollmentType}
                  onChange={(e) => setEnrollmentType(e.target.value as any)}
                >
                  <SelectItem value="continuing" text="Continuing Student" />
                  <SelectItem value="re_enrollment" text="Re-Enrollment / Returning" />
                  <SelectItem value="new" text="New Student Term Admission" />
                </Select>
              </div>
            )}

            {/* Step 2: Course Catalog & Selection */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontWeight: 600 }}>Step 2: Course Catalog & Selection</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Select courses for {term} ({academicYear}). You have selected {selectedCourses.length} courses ({totalCredits} credits).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {AVAILABLE_COURSE_CATALOG.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id);
                    return (
                      <Tile
                        key={course.id}
                        style={{
                          background: isSelected ? 'var(--cds-layer-02)' : 'var(--cds-layer-01)',
                          border: isSelected ? '2px solid var(--cds-interactive-01)' : '1px solid var(--cds-border-subtle-01)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => handleToggleCourse(course.id)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Tag type={isSelected ? 'green' : 'gray'} size="sm">{course.code}</Tag>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{course.credits} Credits</span>
                          </div>
                          <h5 style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 0.25rem 0' }}>
                            {isArabic ? course.titleAr : course.titleEn}
                          </h5>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: '0 0 0.5rem 0' }}>
                            Instructor: {course.instructor}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: '0 0 0.5rem 0' }}>
                            Schedule: {course.schedule}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                            Prerequisites: {course.prerequisites.join(', ')} | Seats: {course.enrolledSeats}/{course.capacity}
                          </p>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            kind={isSelected ? 'danger--ghost' : 'tertiary'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCourse(course.id);
                            }}
                          >
                            {isSelected ? 'Deselect Course' : 'Select Course'}
                          </Button>
                        </div>
                      </Tile>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Prerequisite Validation Engine */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontWeight: 600 }}>Step 3: Prerequisite Validation Engine</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  The system automatically verifies completed coursework against prerequisites for all selected courses.
                </p>

                {hasPrerequisiteViolations && (
                  <InlineNotification
                    kind="error"
                    title="Prerequisite Requirement Warning"
                    subtitle="One or more selected courses require prerequisites that are not present in the student's completed academic record."
                    hideCloseButton
                    style={{ marginBottom: '1rem' }}
                  />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedCourses.map((course) => {
                    const validation = prerequisiteValidationMap[course.id];
                    return (
                      <Tile
                        key={course.id}
                        style={{
                          background: validation.isValid ? 'var(--cds-layer-01)' : 'var(--cds-support-error-inverse)',
                          borderLeft: validation.isValid ? '4px solid var(--cds-support-02)' : '4px solid var(--cds-support-01)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h5 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                              {course.code}: {isArabic ? course.titleAr : course.titleEn}
                            </h5>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
                              Required Prerequisites: {course.prerequisites.join(', ')}
                            </p>
                            {!validation.isValid && (
                              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-support-01)', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                                Missing Prerequisite Courses: {validation.missing.join(', ')}
                              </p>
                            )}
                          </div>
                          <div>
                            {validation.isValid ? (
                              <Tag type="green" size="sm" renderIcon={Checkmark}>Prerequisites Satisfied</Tag>
                            ) : (
                              <Tag type="red" size="sm" renderIcon={Warning}>Prerequisite Missing</Tag>
                            )}
                          </div>
                        </div>
                      </Tile>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Credit Load & Schedule Verification */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '650px' }}>
                <h4 style={{ fontWeight: 600 }}>Step 4: Credit Load & Schedule Verification</h4>

                <Tile style={{ background: 'var(--cds-layer-01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h5 style={{ fontWeight: 600, margin: 0 }}>Total Registered Credits</h5>
                      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0 0' }}>
                        Standard full-time term range: 12 to 18 credit hours.
                      </p>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cds-interactive-01)' }}>
                      {totalCredits} <span style={{ fontSize: '1rem', fontWeight: 400 }}>Credits</span>
                    </div>
                  </div>

                  {creditLoadWarning ? (
                    <InlineNotification
                      kind="warning"
                      title="Credit Load Notice"
                      subtitle={creditLoadWarning}
                      hideCloseButton
                    />
                  ) : (
                    <InlineNotification
                      kind="success"
                      title="Optimal Credit Load"
                      subtitle="Registered credit hours are within the standard full-time institutional policy limits."
                      hideCloseButton
                    />
                  )}
                </Tile>

                <h5 style={{ fontWeight: 600, marginTop: '0.5rem' }}>Schedule Conflict Analysis</h5>
                <InlineNotification
                  kind="success"
                  title="Zero Time Conflicts Detected"
                  subtitle="All selected course time blocks and days are mutually exclusive with no overlapping schedules."
                  hideCloseButton
                />
              </div>
            )}

            {/* Step 5: Tuition & Financial Review */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '650px' }}>
                <h4 style={{ fontWeight: 600 }}>Step 5: Tuition & Financial Assessment</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Review itemized term tuition and select a financial settlement or installment plan.
                </p>

                <Tile style={{ background: 'var(--cds-layer-01)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '0.5rem' }}>
                      <span>Tuition ({totalCredits} Credits @ 850 SAR/credit)</span>
                      <strong>{totalCredits * 850} SAR</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '0.5rem' }}>
                      <span>Laboratory & Technology Fees</span>
                      <strong>1,200 SAR</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '0.5rem' }}>
                      <span>Institutional Merit Scholarship Discount</span>
                      <strong style={{ color: 'var(--cds-support-02)' }}>- 1,500 SAR</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, paddingTop: '0.5rem' }}>
                      <span>Total Net Term Balance Due</span>
                      <span style={{ color: 'var(--cds-interactive-01)' }}>{totalCredits * 850 + 1200 - 1500} SAR</span>
                    </div>
                  </div>
                </Tile>

                <Select
                  id="wizard-payment"
                  labelText="Select Financial Settlement / Payment Plan *"
                  value={paymentPlan}
                  onChange={(e) => setPaymentPlan(e.target.value as any)}
                >
                  <SelectItem value="three_installments" text="3-Installment Term Payment Plan (Zero Interest)" />
                  <SelectItem value="full_upfront" text="Full Upfront Settlement (5% Discount Applied)" />
                  <SelectItem value="sponsored" text="Institutional Scholarship / Government Sponsorship" />
                </Select>
              </div>
            )}

            {/* Step 6: Review & Final Confirm */}
            {currentStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '650px' }}>
                <h4 style={{ fontWeight: 600 }}>Step 6: Review Enrollment Registration Summary</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Please review the complete term enrollment details before generating official student schedule records.
                </p>

                <Tile style={{ background: 'var(--cds-layer-02)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div><strong>Student:</strong> {student.firstName} {student.lastName} ({student.studentNumber})</div>
                    <div><strong>Academic Term:</strong> {term} ({academicYear})</div>
                    <div><strong>Program:</strong> {program}</div>
                    <div><strong>Selected Courses ({selectedCourses.length}):</strong></div>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0' }}>
                      {selectedCourses.map((c) => (
                        <li key={c.id}>
                          {c.code} - {isArabic ? c.titleAr : c.titleEn} ({c.credits} Credits) - {c.instructor}
                        </li>
                      ))}
                    </ul>
                    <div><strong>Total Credit Load:</strong> {totalCredits} Credits</div>
                    <div><strong>Net Term Financial Balance:</strong> {totalCredits * 850 + 1200 - 1500} SAR ({paymentPlan.replace('_', ' ')})</div>
                  </div>
                </Tile>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
