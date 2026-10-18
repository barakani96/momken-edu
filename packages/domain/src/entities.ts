/**
 * Domain Layer: Pure Entity Interfaces for Clean Architecture Monolith ERP
 * Zero external dependencies.
 */

export type TenantSchema = 'tenant_global' | 'tenant_north' | 'tenant_east';

export type CampusBranchId = 'taiz_main' | 'taiz_city' | 'sanaa_branch';

export interface CampusBranch {
  id: CampusBranchId;
  nameAr: string;
  nameEn: string;
  code: string;
  tenantSchema: TenantSchema;
  addressAr: string;
  addressEn: string;
  phone: string;
  email: string;
  taxNumber: string;
  logoUrl?: string;
}

export interface BaseAuditableEntity {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
  isDeleted?: boolean;
}

export interface PIIControlled {
  isPiiEncrypted?: boolean;
  piiFields?: string[];
  lastPiiAccessAt?: string;
  lastPiiAccessBy?: string;
}

import { Student } from './student/Student';
import { StudentStatus, Gender, ArabicName, EnglishName, StudentPIIField } from './student/StudentTypes';

export type { Student, ArabicName, EnglishName };
export { StudentStatus, Gender, StudentPIIField };

export interface StudentEntity extends Student {}

// 2. Guardian Entity
export interface Guardian extends BaseAuditableEntity, PIIControlled {
  id: string;
  tenantId: TenantSchema;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  relationship: 'Father' | 'Mother' | 'Brother' | 'Uncle' | 'Legal Guardian';
  phone: string;
  email: string;
  occupation: string;
  workplace: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  isFinancialResponsible: boolean;
  isAuthorizedPickup: boolean;
}

export interface GuardianEntity extends Guardian {}

// 2b. Enrollment Entity
export interface Enrollment extends BaseAuditableEntity, PIIControlled {
  id: string;
  tenantId: TenantSchema;
  enrollmentCode: string; // e.g. ENR-2026-F1
  studentId: string;
  studentName: string;
  academicYear: string; // e.g. 2026-2027
  term: 'Fall Semester' | 'Spring Semester' | 'Summer Session';
  program: string; // e.g. High School Diploma - Honors
  status: 'Enrolled' | 'On Leave' | 'Withdrawn' | 'Completed';
  creditHours: number;
  enrollmentDate: string;
}

export interface EnrollmentEntity extends Enrollment {}

// 3. Academic Gradebook Entity
export interface AssessmentEntity {
  id: string;
  tenantId: TenantSchema;
  subjectCode: string;
  subjectNameAr: string;
  subjectNameEn: string;
  creditHours: number;
  gradeLevel: string;
  studentId: string;
  examScore: number;
  courseworkScore: number;
  totalScore: number;
  letterGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  term: 'Fall 2026' | 'Spring 2026' | 'Summer 2026';
}

// 4. Attendance Record Entity
export interface AttendanceEntity {
  id: string;
  tenantId: TenantSchema;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  period: number;
  subject: string;
  notes?: string;
  warningLetterTriggered: boolean;
}

// 5. Admissions Application Entity
export interface ApplicationEntity {
  id: string;
  tenantId: TenantSchema;
  campusId: CampusBranchId;
  applicationNo: string;
  applicantNameAr: string;
  applicantNameEn: string;
  targetGrade: string;
  submissionDate: string;
  stage: 'Submitted' | 'Under Review' | 'Exam Pending' | 'Interview' | 'Accepted' | 'Enrolled' | 'Rejected';
  entranceExamScore?: number;
  tuitionFeeQuote: number;
  notes?: string;
}

// 6. Finance & Billing Entity
export interface InvoiceEntity {
  id: string;
  tenantId: TenantSchema;
  invoiceNumber: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  currency: 'YER' | 'SAR' | 'USD';
  status: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  installmentPlan: {
    installmentNo: number;
    amount: number;
    dueDate: string;
    isPaid: boolean;
  }[];
}

export interface PaymentReceiptEntity {
  id: string;
  receiptNo: string;
  invoiceId: string;
  studentId: string;
  amountPaid: number;
  currency: 'YER' | 'SAR' | 'USD';
  paymentMethod: 'Cash' | 'Bank Transfer' | 'POS Card' | 'Check';
  paymentDate: string;
  cashierName: string;
}

// 7. HR & Faculty Entity
export interface StaffEntity {
  id: string;
  tenantId: TenantSchema;
  employeeId: string;
  nameAr: string;
  nameEn: string;
  role: 'Teacher' | 'Staff' | 'Registrar' | 'Principal/Tenant Admin';
  department: string;
  encryptedBaseSalary: string; // AES-256 encrypted
  teachingWorkloadHours: number;
  leaveQuotaDays: number;
  leaveDaysTaken: number;
  bankIbanEncrypted: string;
}

// 8. Communications Entity
export interface CommunicationMessageEntity {
  id: string;
  tenantId: TenantSchema;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  type: 'Direct Chat' | 'Official Circular' | 'Emergency Alert' | 'Automated Notification';
  sentAt: string;
  isRead: boolean;
  reactions?: { emoji: string; count: number }[];
}

// 9. Examinations Entity
export interface ExamHallScheduleEntity {
  id: string;
  tenantId: TenantSchema;
  examCode: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  hallName: string;
  hallCapacity: number;
  assignedCount: number;
  invigilatorName: string;
}

// 10. Library Entity
export interface BookEntity {
  id: string;
  isbn: string;
  titleAr: string;
  titleEn: string;
  author: string;
  category: string;
  copiesAvailable: number;
  totalCopies: number;
  shelfLocation: string;
}

export interface BookCheckoutEntity {
  id: string;
  bookId: string;
  studentId: string;
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
}

// 11. Transport Entity
export interface TransportRouteEntity {
  id: string;
  routeCode: string;
  routeNameAr: string;
  routeNameEn: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudentsCount: number;
}

// 12. Hostel & Dormitories Entity
export interface HostelRoomEntity {
  id: string;
  buildingWing: string;
  roomNumber: string;
  roomType: 'Single' | 'Double' | 'Quad';
  capacity: number;
  allocatedBeds: number;
  monthlyFeeYER: number;
}

// 13. Clinic Entity
export interface ClinicVisitEntity {
  id: string;
  studentId: string;
  visitDate: string;
  timeIn: string;
  symptomsAr: string;
  diagnosisAr: string;
  treatment: string;
  nurseNotes: string;
  excusedDays: number;
}

// 14. Timetable Matrix Entity
export interface TimetableSlotEntity {
  id: string;
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  periodNumber: number; // 1 to 7
  startTime: string;
  endTime: string;
  gradeLevel: string;
  section: string;
  subjectName: string;
  teacherName: string;
  roomNumber: string;
}

// 15. Discipline Entity
export interface DisciplineRecordEntity {
  id: string;
  studentId: string;
  incidentDate: string;
  category: 'Merit' | 'Minor Misconduct' | 'Major Misconduct' | 'Attendance Penalty';
  points: number; // Positive for merit, negative for misconduct
  descriptionAr: string;
  actionTakenAr: string;
  issuedBy: string;
}

// 16. Asset Inventory Entity
export interface AssetItemEntity {
  id: string;
  assetTag: string;
  nameAr: string;
  nameEn: string;
  category: 'Lab Apparatus' | 'Smartboard' | 'IT Hardware' | 'Furniture' | 'Sports Equipment';
  location: string;
  condition: 'Optimal' | 'Requires Maintenance' | 'Decommissioned';
  auditDate: string;
  valueYER: number;
}

// Audit Log Entity
export interface SystemAuditLogEntity {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  module: string;
  tenantId: TenantSchema;
  ipAddress: string;
  details: string;
}
