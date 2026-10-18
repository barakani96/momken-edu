/**
 * @schools/module-sis — Module Manifest Definition
 */

export const sisManifest = {
  id: 'sis',
  name: 'Student Information System',
  nameAr: 'نظام معلومات الطلاب',
  description: 'Authoritative student registry, 360 profile, document vault, enrollments, and academic placement',
  version: '1.0.0',
  icon: 'Group',
  route: '/sis',
  permissions: ['sis:read', 'sis:write', 'sis:admin'],
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
};
