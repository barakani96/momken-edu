/**
 * Application Layer: Zero-Trust Role-Based Access Control (RBAC) Matrix
 * Supports 7 Roles across all ERP resources.
 */

export type UserRole =
  | 'Super Admin'
  | 'Principal/Tenant Admin'
  | 'Registrar'
  | 'Teacher'
  | 'Staff'
  | 'Student'
  | 'Guardian';

export type PermissionAction = 'read' | 'write' | 'create' | 'delete' | 'export' | 'approve';

export type ERPResource =
  | 'students'
  | 'academics'
  | 'attendance'
  | 'admissions'
  | 'finance'
  | 'hr_payroll'
  | 'communications'
  | 'exams'
  | 'library'
  | 'transport'
  | 'hostel'
  | 'clinic'
  | 'timetable'
  | 'discipline'
  | 'inventory'
  | 'admin_console';

export interface RBACMatrix {
  [role: string]: {
    [resource in ERPResource]?: PermissionAction[];
  };
}

export const ROLE_DEFINITIONS: Record<UserRole, { labelAr: string; labelEn: string; descriptionAr: string }> = {
  'Super Admin': {
    labelAr: 'مدير النظام الأعلى',
    labelEn: 'Super Admin',
    descriptionAr: 'صلاحيات كاملة غير محدودة على كل المحافظات والشرائح والمخططات',
  },
  'Principal/Tenant Admin': {
    labelAr: 'مدير المدرسة / الفرع',
    labelEn: 'Principal / Tenant Admin',
    descriptionAr: 'إدارة تشغيلية وإدارية كاملة لفرع المدرسة المحدد والاعتمادات المالية',
  },
  Registrar: {
    labelAr: 'مسؤول التسجيل والقبول',
    labelEn: 'Registrar',
    descriptionAr: 'إدارة ملفات الطلاب القبول والتحويلات وإصدار الوثائق الرسمية',
  },
  Teacher: {
    labelAr: 'المعلم / الكادر الأكاديمي',
    labelEn: 'Teacher',
    descriptionAr: 'إدخال الدرجات ودفتر التحضير والحضور والإنذارات الأكاديمية للفصول',
  },
  Staff: {
    labelAr: 'الكادر الإداري / الموظف',
    labelEn: 'Staff',
    descriptionAr: 'إدارة العمليات المحددة (المكتبة العيادة النقل العهد المالية)',
  },
  Student: {
    labelAr: 'الطالب',
    labelEn: 'Student',
    descriptionAr: 'عرض الجدول الجداول والدرجات واستعارة الكتب وبطاقة الاختبار',
  },
  Guardian: {
    labelAr: 'ولي الأمر',
    labelEn: 'Guardian',
    descriptionAr: 'متابعة حضور ودرجات ومستحقات الأبناء والتواصل مع المدرسة',
  },
};

export const DEFAULT_RBAC_MATRIX: RBACMatrix = {
  'Super Admin': {
    students: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    academics: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    attendance: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    admissions: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    finance: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    hr_payroll: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    communications: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    exams: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    library: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    transport: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    hostel: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    clinic: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    timetable: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    discipline: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    inventory: ['read', 'write', 'create', 'delete', 'export', 'approve'],
    admin_console: ['read', 'write', 'create', 'delete', 'export', 'approve'],
  },
  'Principal/Tenant Admin': {
    students: ['read', 'write', 'create', 'export', 'approve'],
    academics: ['read', 'write', 'create', 'export', 'approve'],
    attendance: ['read', 'write', 'export', 'approve'],
    admissions: ['read', 'write', 'create', 'approve'],
    finance: ['read', 'write', 'export', 'approve'],
    hr_payroll: ['read', 'write', 'export', 'approve'],
    communications: ['read', 'write', 'create', 'export'],
    exams: ['read', 'write', 'create', 'approve'],
    library: ['read', 'write'],
    transport: ['read', 'write'],
    hostel: ['read', 'write'],
    clinic: ['read', 'write'],
    timetable: ['read', 'write', 'approve'],
    discipline: ['read', 'write', 'approve'],
    inventory: ['read', 'write', 'approve'],
    admin_console: ['read'],
  },
  Registrar: {
    students: ['read', 'write', 'create', 'export'],
    academics: ['read', 'write'],
    attendance: ['read'],
    admissions: ['read', 'write', 'create', 'approve'],
    finance: ['read'],
    hr_payroll: [],
    communications: ['read', 'write'],
    exams: ['read', 'write'],
    library: ['read'],
    transport: ['read'],
    hostel: ['read'],
    clinic: ['read'],
    timetable: ['read'],
    discipline: ['read'],
    inventory: ['read'],
    admin_console: [],
  },
  Teacher: {
    students: ['read'],
    academics: ['read', 'write', 'create'],
    attendance: ['read', 'write', 'create'],
    admissions: [],
    finance: [],
    hr_payroll: ['read'], // own payslip
    communications: ['read', 'write'],
    exams: ['read'],
    library: ['read'],
    transport: [],
    hostel: [],
    clinic: ['read'],
    timetable: ['read'],
    discipline: ['read', 'write', 'create'],
    inventory: ['read'],
    admin_console: [],
  },
  Staff: {
    students: ['read'],
    academics: ['read'],
    attendance: ['read'],
    admissions: ['read'],
    finance: ['read', 'write'],
    hr_payroll: ['read'],
    communications: ['read', 'write'],
    exams: ['read'],
    library: ['read', 'write', 'create'],
    transport: ['read', 'write', 'create'],
    hostel: ['read', 'write', 'create'],
    clinic: ['read', 'write', 'create'],
    timetable: ['read'],
    discipline: ['read'],
    inventory: ['read', 'write', 'create'],
    admin_console: [],
  },
  Student: {
    students: ['read'], // own profile
    academics: ['read'],
    attendance: ['read'],
    admissions: [],
    finance: ['read'],
    hr_payroll: [],
    communications: ['read'],
    exams: ['read'],
    library: ['read'],
    transport: ['read'],
    hostel: ['read'],
    clinic: ['read'],
    timetable: ['read'],
    discipline: ['read'],
    inventory: [],
    admin_console: [],
  },
  Guardian: {
    students: ['read'],
    academics: ['read'],
    attendance: ['read'],
    admissions: ['read', 'create'],
    finance: ['read'],
    hr_payroll: [],
    communications: ['read', 'write'],
    exams: ['read'],
    library: [],
    transport: ['read'],
    hostel: ['read'],
    clinic: ['read'],
    timetable: ['read'],
    discipline: ['read'],
    inventory: [],
    admin_console: [],
  },
};

export function checkPermission(
  role: UserRole,
  resource: ERPResource,
  action: PermissionAction
): boolean {
  const permissions = DEFAULT_RBAC_MATRIX[role]?.[resource] || [];
  return permissions.includes(action);
}
