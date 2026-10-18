/**
 * @schools/module-sis — Authoritative Domain Types
 */

export interface GuardianRecord {
  id: string;
  guardianName: string;
  relationship: string;
  studentLinked: string;
  studentId: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  isFinancialResponsible: boolean;
  canPickup: boolean;
  preferredLanguage?: 'en' | 'ar';
}

export interface PlacementRecord {
  id: string;
  studentId: string;
  campus: string;
  academicYear: string;
  term: string;
  program: string;
  gradeLevel: string;
  classSection: string;
  cohort: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentCode: string;
  academicYear: string;
  term: string;
  program: string;
  enrollmentType: 'new' | 'continuing' | 'transfer' | 're_entry';
  status: 'Enrolled' | 'Pending' | 'Rejected' | 'Withdrawn';
  creditHours: number;
  enrollmentDate: string;
}

export interface TransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  transferType: 'internal' | 'external';
  sourceCampus: string;
  destinationCampus: string;
  effectiveDate: string;
  reason: string;
  academicContext: string;
  status: 'under_review' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
}

export interface WithdrawalRecord {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  effectiveDate: string;
  destination: string;
  status: 'completed' | 'pending';
  requestedBy: string;
  reviewedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface GraduationRequirement {
  id: string;
  title: string;
  titleAr: string;
  fulfilled: boolean;
  category: 'credits' | 'gpa' | 'documents' | 'clearance';
  details: string;
}

export interface GraduationRecord {
  id: string;
  studentId: string;
  studentName: string;
  graduationCohort: string;
  graduationDate: string;
  cumulativeGpa: number;
  creditsEarned: number;
  eligibilityStatus: 'eligible' | 'pending' | 'approved' | 'ineligible';
  certificateIssued: boolean;
  requirementsChecklist: GraduationRequirement[];
}

export interface StudentDocument {
  id: string;
  studentId: string;
  category: 'academic_transcripts' | 'certificates' | 'id_documents' | 'medical' | 'disciplinary' | 'other';
  documentType: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Flagged';
  serialNumber?: string;
  academicYear?: string;
  expiryDate?: string;
  summary?: string;
  verificationNotes?: string;
}

export interface AcademicRecordItem {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  term: string;
  credits: number;
  courseworkScore: number;
  finalExamScore: number;
  totalScore: number;
  grade: string;
  instructor: string;
  status: 'In Progress' | 'Completed' | 'Dropped';
}

export interface AttendanceRecordItem {
  id: string;
  date: string;
  period: number;
  subject: string;
  checkInTime: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface StudentRecord {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  nationalId: string;
  status: 'active' | 'enrolled' | 'admitted' | 'applicant' | 'graduated' | 'withdrawn' | 'suspended';
  enrollmentStatus: string;
  campus: string;
  program: string;
  gradeLevel: string;
  classSection: string;
  cohort: string;
  gpa: number;
  enrollmentDate: string;
  attendanceRate: number;
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  guardians: GuardianRecord[];
  placements: PlacementRecord[];
  enrollments: EnrollmentRecord[];
  transfers: TransferRecord[];
  withdrawals: WithdrawalRecord[];
  graduation?: GraduationRecord;
  documents: StudentDocument[];
  academicRecords?: AcademicRecordItem[];
  termGpaHistory?: { term: string; gpa: number; credits: number }[];
  attendanceRecords?: AttendanceRecordItem[];
  monthlyAttendance?: { month: string; rate: number; presentDays: number; absentDays: number }[];
  timeline: TimelineEvent[];
  notes?: string[];
}
