export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'applicant' | 'admitted' | 'enrolled' | 'active' | 'graduated' | 'withdrawn' | 'transferred' | 'inactive';
export type EnrollmentType = 'new' | 're_enrollment' | 'continuing';
export type EnrollmentStatus = 'Enrolled' | 'On Leave' | 'Withdrawn' | 'Completed' | 'Pending';
export type TransferType = 'internal' | 'external';
export type TransferStatus = 'initiated' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type WithdrawalStatus = 'initiated' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type DocumentVerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Archived';
export type DocumentCategory = 'academic_transcripts' | 'certificates' | 'id_documents' | 'medical_consent';
export type DocumentType =
  | 'Official Academic Transcript'
  | 'Previous Transcript'
  | 'Term Grade Report'
  | 'Graduation Diploma'
  | 'STEM Honors Certificate'
  | 'Transfer Certificate'
  | 'Good Conduct Certificate'
  | 'Birth Certificate'
  | 'National ID / Passport'
  | 'Student Campus ID Card'
  | 'Residence Permit (Iqama)'
  | 'Medical Clearance'
  | 'Guardian Consent'
  | 'Other';

export function resolveDocumentCategory(doc: { category?: DocumentCategory; documentType: DocumentType }): DocumentCategory {
  if (doc.category) return doc.category;
  switch (doc.documentType) {
    case 'Official Academic Transcript':
    case 'Previous Transcript':
    case 'Term Grade Report':
      return 'academic_transcripts';
    case 'Graduation Diploma':
    case 'STEM Honors Certificate':
    case 'Transfer Certificate':
    case 'Good Conduct Certificate':
      return 'certificates';
    case 'Birth Certificate':
    case 'National ID / Passport':
    case 'Student Campus ID Card':
    case 'Residence Permit (Iqama)':
      return 'id_documents';
    case 'Medical Clearance':
    case 'Guardian Consent':
    case 'Other':
    default:
      return 'medical_consent';
  }
}

export interface AcademicCourseRecord {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  term: string;
  credits: number;
  courseworkScore: number; // out of 100
  finalExamScore: number; // out of 100
  totalScore: number; // weighted percentage
  grade: string; // A+, A, A-, B+, B, etc.
  instructor: string;
  status: 'In Progress' | 'Completed';
}

export interface TermGpaSnapshot {
  term: string;
  gpa: number;
  credits: number;
}

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  period: number;
  subject: string;
  checkInTime: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  notes?: string;
}

export interface MonthlyAttendanceMetric {
  month: string;
  rate: number;
  presentDays: number;
  absentDays: number;
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
}

export interface GuardianRecord {
  id: string;
  guardianName: string;
  relationship: 'Mother' | 'Father' | 'Legal Guardian' | 'Grandparent' | 'Other';
  studentLinked: string; // studentId or name
  studentId?: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  isFinancialResponsible: boolean;
  canPickup: boolean;
  preferredLanguage: 'en' | 'ar';
  address?: AddressInfo;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentCode: string;
  academicYear: string;
  term: string;
  program: string;
  enrollmentType: EnrollmentType;
  status: EnrollmentStatus;
  creditHours: number;
  enrollmentDate: string;
  notes?: string;
}

export interface AcademicPlacementRecord {
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

export interface TransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  transferType: TransferType;
  sourceCampus: string;
  destinationCampus: string;
  effectiveDate: string;
  reason: string;
  academicContext: string;
  status: TransferStatus;
  requestedBy: string;
  reviewedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface WithdrawalRecord {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  effectiveDate: string;
  destination: string;
  status: WithdrawalStatus;
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
  category: 'credits' | 'gpa' | 'documents' | 'clearance' | 'conduct';
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
  eligibilityStatus: 'eligible' | 'under_review' | 'approved' | 'graduated' | 'ineligible';
  certificateIssued: boolean;
  requirementsChecklist: GraduationRequirement[];
  approvalNotes?: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  category?: DocumentCategory;
  documentType: DocumentType;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: DocumentVerificationStatus;
  verificationNotes?: string;
  serialNumber?: string;
  academicYear?: string;
  expiryDate?: string;
  summary?: string;
  fileUrl?: string;
}

export interface TimelineEvent {
  id: string;
  studentId: string;
  type: 
    | 'Student Created'
    | 'Profile Updated'
    | 'Guardian Added'
    | 'Enrollment Created'
    | 'Placement Changed'
    | 'Status Changed'
    | 'Document Uploaded'
    | 'Document Verified'
    | 'Transfer Initiated'
    | 'Transfer Completed'
    | 'Withdrawal Initiated'
    | 'Student Withdrawn'
    | 'Graduation Approved'
    | 'Student Graduated'
    | 'Academic Record Updated'
    | 'Attendance Logged';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StudentRecord {
  id: string;
  studentNumber: string; // STU-1001
  firstName: string;
  lastName: string;
  preferredName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  gender: Gender;
  dateOfBirth: string;
  nationalId: string;
  status: StudentStatus;
  enrollmentStatus: EnrollmentStatus;
  campus: string;
  program: string;
  gradeLevel: string;
  classSection: string;
  cohort: string;
  gpa: number;
  enrollmentDate: string;
  contact: ContactInfo;
  address: AddressInfo;
  photoUrl?: string;
  guardians: GuardianRecord[];
  placements: AcademicPlacementRecord[];
  enrollments: EnrollmentRecord[];
  transfers: TransferRecord[];
  withdrawals: WithdrawalRecord[];
  graduation?: GraduationRecord;
  documents: StudentDocument[];
  academicRecords?: AcademicCourseRecord[];
  termGpaHistory?: TermGpaSnapshot[];
  attendanceRecords?: StudentAttendanceRecord[];
  monthlyAttendance?: MonthlyAttendanceMetric[];
  timeline: TimelineEvent[];
  notes?: string[];
  attendanceRate?: number; // e.g., 96.5%
}
