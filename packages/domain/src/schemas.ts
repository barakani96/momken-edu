/**
 * Declarative EntitySchema Definitions for Monolith Architecture
 */

export interface FieldSchema {
  name: string;
  labelAr: string;
  labelEn: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'encrypted' | 'select' | 'array';
  required?: boolean;
  options?: { value: string; labelAr: string; labelEn: string }[];
  isSensitive?: boolean; // PII column
}

export interface EntitySchema {
  entityName: string;
  table: string;
  primaryKey: string;
  fields: FieldSchema[];
}

export const StudentSchema: EntitySchema = {
  entityName: 'Student',
  table: 'students',
  primaryKey: 'id',
  fields: [
    { name: 'studentNumber', labelAr: 'رقم الطالب', labelEn: 'Student Number', type: 'string', required: true },
    { name: 'nationalId', labelAr: 'الرقم الوطني / الإقامة', labelEn: 'National ID / Iqama', type: 'encrypted', required: true, isSensitive: true },
    { name: 'firstNameAr', labelAr: 'الاسم الأول (عربي)', labelEn: 'First Name (AR)', type: 'string', required: true },
    { name: 'fatherNameAr', labelAr: 'اسم الأب (عربي)', labelEn: 'Father Name (AR)', type: 'string', required: true },
    { name: 'grandfatherNameAr', labelAr: 'اسم الجد (عربي)', labelEn: 'Grandfather Name (AR)', type: 'string', required: true },
    { name: 'familyTitleAr', labelAr: 'اللقب / العائلة (عربي)', labelEn: 'Family Title (AR)', type: 'string', required: true },
    { name: 'tribalTitleAr', labelAr: 'اللقب القبلي (اخنياري)', labelEn: 'Tribal Title (Optional)', type: 'string' },
    { name: 'gradeLevel', labelAr: 'الصف الدراسي', labelEn: 'Grade Level', type: 'string', required: true },
    { name: 'status', labelAr: 'حالة الطالب', labelEn: 'Status', type: 'select', required: true },
  ],
};

export const InvoiceSchema: EntitySchema = {
  entityName: 'Invoice',
  table: 'invoices',
  primaryKey: 'id',
  fields: [
    { name: 'invoiceNumber', labelAr: 'رقم الفاتورة', labelEn: 'Invoice Number', type: 'string', required: true },
    { name: 'amount', labelAr: 'المبلغ الإجمالي', labelEn: 'Total Amount', type: 'number', required: true },
    { name: 'currency', labelAr: 'العملة', labelEn: 'Currency', type: 'select', required: true },
    { name: 'status', labelAr: 'حالة السداد', labelEn: 'Payment Status', type: 'select', required: true },
  ],
};
