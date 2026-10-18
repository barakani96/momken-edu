/**
 * Authoritative Domain Entity Ownership & Cross-Module Contracts
 * Enforces AGENTS.md Section 13:
 * 1. Authoritative Ownership: Each module owns its institutional entities exclusively.
 * 2. Referencing vs Duplication: Modules reference external entities via stable IDs and contracts, never duplicating records.
 * 3. Strict Contracts: Stable IDs & typed reference descriptors across module boundaries.
 */

export type InstitutionalModuleId =
  | 'sis'
  | 'academics'
  | 'finance'
  | 'hr'
  | 'library'
  | 'admin';

export type InstitutionalEntityName =
  // Owned by SIS (@schools/module-sis)
  | 'Student'
  | 'Guardian'
  | 'Enrollment'
  | 'AcademicPlacement'
  | 'Transfer'
  | 'Withdrawal'
  | 'Graduation'
  | 'StudentDocument'
  // Owned by Academics (@schools/module-academics)
  | 'Course'
  | 'Subject'
  | 'Assessment'
  | 'Attendance'
  | 'TimetableSlot'
  | 'ExamHallSchedule'
  // Owned by Finance (@schools/module-finance)
  | 'Invoice'
  | 'PaymentReceipt'
  | 'InstallmentPlan'
  | 'FeeStructure'
  // Owned by HR (@schools/module-hr)
  | 'Staff'
  | 'FacultyContract'
  | 'LeaveQuota'
  // Owned by Library (@schools/module-library)
  | 'Book'
  | 'BookCheckout'
  // Owned by Admin / Core Platform (@schools/module-admin)
  | 'Organization'
  | 'Campus'
  | 'Department'
  | 'AcademicUnit'
  | 'User'
  | 'Role'
  | 'AccessPolicy'
  | 'FeatureFlag'
  | 'SystemAuditLog'
  | 'Workflow';

/**
 * Stable Cross-Module Entity Reference Contract
 * Used when Module A references an entity owned authoritatively by Module B.
 */
export interface EntityReferenceContract<TEntity extends InstitutionalEntityName = InstitutionalEntityName> {
  readonly entityType: TEntity;
  readonly ownerModule: InstitutionalModuleId;
  readonly entityId: string;
  readonly displayCode?: string;
  readonly resolvedAt?: string;
}

export interface ModuleOwnershipManifest {
  moduleId: InstitutionalModuleId;
  packageName: string;
  titleEn: string;
  titleAr: string;
  authoritativeEntities: InstitutionalEntityName[];
  referencedEntities: Array<{
    entity: InstitutionalEntityName;
    ownerModule: InstitutionalModuleId;
    foreignKeyContract: string;
    purposeEn: string;
    purposeAr: string;
  }>;
}

export const DOMAIN_OWNERSHIP_REGISTRY: Record<InstitutionalModuleId, ModuleOwnershipManifest> = {
  sis: {
    moduleId: 'sis',
    packageName: '@schools/module-sis',
    titleEn: 'Student Information System (SIS)',
    titleAr: 'نظام معلومات الطلاب (SIS)',
    authoritativeEntities: [
      'Student',
      'Guardian',
      'Enrollment',
      'AcademicPlacement',
      'Transfer',
      'Withdrawal',
      'Graduation',
      'StudentDocument',
    ],
    referencedEntities: [
      {
        entity: 'Campus',
        ownerModule: 'admin',
        foreignKeyContract: 'campusId: CampusBranchId',
        purposeEn: 'Links student placement & transfers to authoritative campus records',
        purposeAr: 'ربط تسكين ونقل الطالب بسجل الفرع المؤسسي المعتمد',
      },
      {
        entity: 'Course',
        ownerModule: 'academics',
        foreignKeyContract: 'courseId: string',
        purposeEn: 'Links term enrollment & 360° transcript to academic course catalog',
        purposeAr: 'ربط التسجيل الفصلي والسجل الأكاديمي بدليل المقررات',
      },
      {
        entity: 'Assessment',
        ownerModule: 'academics',
        foreignKeyContract: 'studentId -> AssessmentEntity.studentId',
        purposeEn: 'Aggregates student grades in Student 360° without duplicating gradebook tables',
        purposeAr: 'تجميع درجات الطالب في ملف 360° دون تكرار جداول دفتر الدرجات',
      },
      {
        entity: 'Attendance',
        ownerModule: 'academics',
        foreignKeyContract: 'studentId -> AttendanceEntity.studentId',
        purposeEn: 'Displays attendance metrics in Student 360° via read-only domain contract',
        purposeAr: 'عرض مؤشرات المواظبة والغياب عبر عقد قراءة مباشر',
      },
      {
        entity: 'Invoice',
        ownerModule: 'finance',
        foreignKeyContract: 'studentId -> InvoiceEntity.studentId',
        purposeEn: 'Verifies financial clearance for graduation and term registration',
        purposeAr: 'التحقق من إخلاء الطرف المالي للتخرج والتسجيل الفصلي',
      },
    ],
  },
  academics: {
    moduleId: 'academics',
    packageName: '@schools/module-academics',
    titleEn: 'Academics, Curriculum & Gradebook',
    titleAr: 'الأكاديميات والمناهج ودفتر الدرجات',
    authoritativeEntities: [
      'Course',
      'Subject',
      'Assessment',
      'Attendance',
      'TimetableSlot',
      'ExamHallSchedule',
    ],
    referencedEntities: [
      {
        entity: 'Student',
        ownerModule: 'sis',
        foreignKeyContract: 'studentId: string (STU-*)',
        purposeEn: 'References enrolled students for grading and period attendance',
        purposeAr: 'الإشارة إلى معرف الطالب المسجل لرصد الدرجات والحضور',
      },
      {
        entity: 'Staff',
        ownerModule: 'hr',
        foreignKeyContract: 'instructorId: string (EMP-*)',
        purposeEn: 'Assigns faculty instructors to timetable slots and exam invigilation',
        purposeAr: 'تعيين أعضاء هيئة التدريس للحصص ولجان المراقبة',
      },
    ],
  },
  finance: {
    moduleId: 'finance',
    packageName: '@schools/module-finance',
    titleEn: 'Finance, Tuition & Billing Hub',
    titleAr: 'المالية والرسوم والفوترة',
    authoritativeEntities: [
      'Invoice',
      'PaymentReceipt',
      'InstallmentPlan',
      'FeeStructure',
    ],
    referencedEntities: [
      {
        entity: 'Student',
        ownerModule: 'sis',
        foreignKeyContract: 'studentId: string (STU-*)',
        purposeEn: 'Links tuition invoices and receipts to authoritative student ID',
        purposeAr: 'ربط الفواتير وسندات القبض بمعرف الطالب الرسمي',
      },
      {
        entity: 'Guardian',
        ownerModule: 'sis',
        foreignKeyContract: 'financialGuardianId: string',
        purposeEn: 'Identifies financially responsible guardian for billing notifications',
        purposeAr: 'تحديد ولي الأمر المسؤول مالياً لإشعارات السداد',
      },
    ],
  },
  hr: {
    moduleId: 'hr',
    packageName: '@schools/module-hr',
    titleEn: 'Human Resources & Faculty Directory',
    titleAr: 'الموارد البشرية وهيئة التدريس',
    authoritativeEntities: [
      'Staff',
      'FacultyContract',
      'LeaveQuota',
    ],
    referencedEntities: [
      {
        entity: 'Department',
        ownerModule: 'admin',
        foreignKeyContract: 'departmentId: string',
        purposeEn: 'Assigns staff to institutional departments and academic units',
        purposeAr: 'ربط الكادر الوظيفي بالأقسام الإدارية والوحدات الأكاديمية',
      },
      {
        entity: 'User',
        ownerModule: 'admin',
        foreignKeyContract: 'userId: string',
        purposeEn: 'Binds employee record to IAM identity and RBAC role',
        purposeAr: 'ربط سجل الموظف بحساب الهوية والصلاحيات',
      },
    ],
  },
  library: {
    moduleId: 'library',
    packageName: '@schools/module-library',
    titleEn: 'Library, Catalog & Circulation',
    titleAr: 'المكتبة والفهرس والإعارات',
    authoritativeEntities: [
      'Book',
      'BookCheckout',
    ],
    referencedEntities: [
      {
        entity: 'Student',
        ownerModule: 'sis',
        foreignKeyContract: 'borrowerStudentId: string',
        purposeEn: 'Tracks student book checkouts and graduation library clearance',
        purposeAr: 'متابعة إعارات الكتب وإخلاء طرف المكتبة للتخرج',
      },
    ],
  },
  admin: {
    moduleId: 'admin',
    packageName: '@schools/module-admin',
    titleEn: 'Core Platform, IAM & Multi-Tenant Governance',
    titleAr: 'إدارة المنصة والهوية والحوكمة متعددة الفروع',
    authoritativeEntities: [
      'Organization',
      'Campus',
      'Department',
      'AcademicUnit',
      'User',
      'Role',
      'AccessPolicy',
      'FeatureFlag',
      'SystemAuditLog',
      'Workflow',
    ],
    referencedEntities: [],
  },
};

export function createEntityReference<T extends InstitutionalEntityName>(
  entityType: T,
  ownerModule: InstitutionalModuleId,
  entityId: string,
  displayCode?: string
): EntityReferenceContract<T> {
  return {
    entityType,
    ownerModule,
    entityId,
    displayCode,
    resolvedAt: new Date().toISOString(),
  };
}
