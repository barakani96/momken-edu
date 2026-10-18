import { PrismaClient } from '@prisma/client';

export interface SeedMenuItem {
  key: string;
  type: 'GROUP' | 'LINK' | 'EXTERNAL_LINK' | 'DIVIDER';
  labelEn: string;
  labelAr: string;
  path: string | null;
  icon: string | null;
  permission?: string | null;
  moduleKey?: string | null;
  sortOrder: number;
  children?: SeedMenuItem[];
}

export const ADMIN_STARTER_MENU: SeedMenuItem[] = [
  {
    key: 'dashboard',
    type: 'LINK',
    labelEn: 'Dashboard Overview',
    labelAr: 'لوحة التحكم العامة',
    path: '/admin',
    icon: 'Dashboard',
    sortOrder: 10,
  },
  {
    key: 'academic',
    type: 'GROUP',
    labelEn: 'Academic & SIS',
    labelAr: 'الشؤون الأكاديمية والطلاب',
    path: null,
    icon: 'Education',
    sortOrder: 20,
    children: [
      {
        key: 'students',
        type: 'LINK',
        labelEn: 'Students Directory',
        labelAr: 'دليل الطلاب الشامل',
        path: '/sis/directory',
        icon: 'Group',
        permission: 'students.read',
        sortOrder: 10,
      },
      {
        key: 'admissions',
        type: 'LINK',
        labelEn: 'Admissions & Enrollment',
        labelAr: 'القبول والتسجيل',
        path: '/sis/admissions',
        icon: 'UserFollow',
        permission: 'admissions.read',
        sortOrder: 20,
      },
      {
        key: 'attendance',
        type: 'LINK',
        labelEn: 'Attendance Tracking',
        labelAr: 'الحضور والغياب',
        path: '/sis/attendance',
        icon: 'Calendar',
        permission: 'attendance.read',
        sortOrder: 30,
      },
      {
        key: 'examinations',
        type: 'LINK',
        labelEn: 'Examinations & Grades',
        labelAr: 'الاختبارات والدرجات',
        path: '/sis/academics',
        icon: 'Course',
        permission: 'academics.read',
        sortOrder: 40,
      },
    ],
  },
  {
    key: 'finance',
    type: 'GROUP',
    labelEn: 'Finance & Accounts',
    labelAr: 'المالية والحسابات',
    path: null,
    icon: 'Wallet',
    sortOrder: 30,
    children: [
      {
        key: 'invoices',
        type: 'LINK',
        labelEn: 'Tuition Invoices',
        labelAr: 'الفواتير والرسوم',
        path: '/sis/finance',
        icon: 'Document',
        permission: 'finance.read',
        sortOrder: 10,
      },
      {
        key: 'payments',
        type: 'LINK',
        labelEn: 'Payments & Receipts',
        labelAr: 'المدفوعات والمقبوضات',
        path: '/sis/finance',
        icon: 'Wallet',
        permission: 'finance.read',
        sortOrder: 20,
      },
    ],
  },
  {
    key: 'organization',
    type: 'GROUP',
    labelEn: 'Organization & Hierarchy',
    labelAr: 'المؤسسات والفروع',
    path: null,
    icon: 'Enterprise',
    sortOrder: 40,
    children: [
      {
        key: 'organizations',
        type: 'LINK',
        labelEn: 'Organizations',
        labelAr: 'المؤسسات التعليمية',
        path: '/admin/organization/organizations',
        icon: 'Enterprise',
        permission: 'organization.read',
        sortOrder: 10,
      },
      {
        key: 'campuses',
        type: 'LINK',
        labelEn: 'Campuses',
        labelAr: 'الفروع والمقرات',
        path: '/admin/organization/campuses',
        icon: 'Enterprise',
        permission: 'organization.read',
        sortOrder: 20,
      },
      {
        key: 'departments',
        type: 'LINK',
        labelEn: 'Departments',
        labelAr: 'الأقسام الإدارية',
        path: '/admin/organization/departments',
        icon: 'Enterprise',
        permission: 'organization.read',
        sortOrder: 30,
      },
    ],
  },
  {
    key: 'human-resources',
    type: 'LINK',
    labelEn: 'Human Resources',
    labelAr: 'الموارد البشرية والكادر',
    path: '/admin/identity/users',
    icon: 'UserAdmin',
    permission: 'users.read',
    sortOrder: 50,
  },
  {
    key: 'reports',
    type: 'LINK',
    labelEn: 'Audit & Compliance Reports',
    labelAr: 'تقارير الامتثال والتدقيق',
    path: '/admin/audit/logs',
    icon: 'Report',
    permission: 'audit.read',
    sortOrder: 60,
  },
  {
    key: 'system',
    type: 'GROUP',
    labelEn: 'System Governance',
    labelAr: 'إدارة وتكوين النظام',
    path: null,
    icon: 'Settings',
    sortOrder: 70,
    children: [
      {
        key: 'users',
        type: 'LINK',
        labelEn: 'User Directory',
        labelAr: 'دليل المستخدمين',
        path: '/admin/identity/users',
        icon: 'UserAdmin',
        permission: 'users.read',
        sortOrder: 10,
      },
      {
        key: 'roles',
        type: 'LINK',
        labelEn: 'Roles Matrix',
        labelAr: 'مصفوفة الأدوار',
        path: '/admin/access/roles',
        icon: 'Security',
        permission: 'roles.read',
        sortOrder: 20,
      },
      {
        key: 'permissions',
        type: 'LINK',
        labelEn: 'Access Policies',
        labelAr: 'سياسات الوصول',
        path: '/admin/access/policies',
        icon: 'Security',
        permission: 'roles.read',
        sortOrder: 30,
      },
      {
        key: 'navigation-management',
        type: 'LINK',
        labelEn: 'Navigation & Menu Store',
        labelAr: 'إدارة القوائم والتنقل',
        path: '/admin/system/navigation',
        icon: 'Flow',
        permission: 'navigation.manage',
        sortOrder: 40,
      },
    ],
  },
];

export const SIS_STARTER_MENU: SeedMenuItem[] = [
  {
    key: 'sis.dashboard',
    type: 'LINK',
    labelEn: 'SIS Portal Overview',
    labelAr: 'لوحة قيادة نظام الطلاب',
    path: '/sis/dashboard',
    icon: 'Dashboard',
    sortOrder: 10,
  },
  {
    key: 'sis.directory',
    type: 'LINK',
    labelEn: 'Student Directory',
    labelAr: 'دليل الطلاب الشامل',
    path: '/sis/directory',
    icon: 'Group',
    permission: 'students.read',
    sortOrder: 20,
  },
  {
    key: 'sis.registration',
    type: 'LINK',
    labelEn: 'Student Registration',
    labelAr: 'تسجيل طالب جديد',
    path: '/sis/registration',
    icon: 'UserFollow',
    permission: 'students.create',
    sortOrder: 30,
  },
  {
    key: 'sis.admissions',
    type: 'LINK',
    labelEn: 'Admissions & Enrollment',
    labelAr: 'القبول والقيد الفصلي',
    path: '/sis/admissions',
    icon: 'Education',
    permission: 'admissions.read',
    sortOrder: 40,
  },
  {
    key: 'sis.academics',
    type: 'LINK',
    labelEn: 'Academics & Gradebook',
    labelAr: 'الأكاديميات ودفتر الدرجات',
    path: '/sis/academics',
    icon: 'Course',
    permission: 'academics.read',
    sortOrder: 50,
  },
  {
    key: 'sis.finance',
    type: 'LINK',
    labelEn: 'Finance & Billing Hub',
    labelAr: 'المالية والرسوم الدراسية',
    path: '/sis/finance',
    icon: 'Wallet',
    permission: 'finance.read',
    sortOrder: 60,
  },
  {
    key: 'sis.admin-console',
    type: 'LINK',
    labelEn: 'SIS Security & Governance',
    labelAr: 'أمان وحوكمة نظام SIS',
    path: '/sis/admin-console',
    icon: 'Security',
    permission: 'settings.read',
    sortOrder: 70,
  },
];

export async function seedNavigation(prisma: PrismaClient): Promise<void> {
  console.log('Seeding navigation subsystem...');

  // Seed menus with upsert
  const menusToSeed = [
    {
      key: 'admin',
      name: 'Admin Console Main Menu',
      description: 'Authoritative primary navigation menu for the Momken Education ERP Admin Console',
      items: ADMIN_STARTER_MENU,
    },
    {
      key: 'main',
      name: 'Main Institutional Menu',
      description: 'Alias for primary ERP navigation menu',
      items: ADMIN_STARTER_MENU,
    },
    {
      key: 'sis',
      name: 'Student Information System Menu',
      description: 'Dedicated navigation menu for SIS portal workflows',
      items: SIS_STARTER_MENU,
    },
  ];

  for (const menuDef of menusToSeed) {
    const menu = await prisma.navigationMenu.upsert({
      where: { key: menuDef.key },
      create: {
        key: menuDef.key,
        name: menuDef.name,
        description: menuDef.description,
        isActive: true,
        version: 1,
      },
      update: {
        name: menuDef.name,
        description: menuDef.description,
        isActive: true,
      },
    });

    // Seed items recursively
    await seedItemsRecursive(prisma, menu.id, null, menuDef.items);
  }

  console.log('Navigation seeding complete.');
}

async function seedItemsRecursive(
  prisma: PrismaClient,
  menuId: string,
  parentId: string | null,
  items: SeedMenuItem[]
): Promise<void> {
  for (const itemDef of items) {
    const item = await prisma.navigationMenuItem.upsert({
      where: {
        menuId_key: {
          menuId,
          key: itemDef.key,
        },
      },
      create: {
        menuId,
        parentId,
        key: itemDef.key,
        type: itemDef.type,
        label: itemDef.labelEn,
        path: itemDef.path,
        icon: itemDef.icon,
        permission: itemDef.permission || null,
        moduleKey: itemDef.moduleKey || null,
        sortOrder: itemDef.sortOrder,
        isVisible: true,
        isEnabled: true,
        openInNewTab: false,
      },
      update: {
        type: itemDef.type,
        label: itemDef.labelEn,
        path: itemDef.path,
        icon: itemDef.icon,
        permission: itemDef.permission || null,
        sortOrder: itemDef.sortOrder,
        parentId,
      },
    });

    // Upsert English translation
    await prisma.navigationTranslation.upsert({
      where: {
        itemId_locale: {
          itemId: item.id,
          locale: 'en',
        },
      },
      create: {
        itemId: item.id,
        locale: 'en',
        label: itemDef.labelEn,
      },
      update: {
        label: itemDef.labelEn,
      },
    });

    // Upsert Arabic translation
    await prisma.navigationTranslation.upsert({
      where: {
        itemId_locale: {
          itemId: item.id,
          locale: 'ar',
        },
      },
      create: {
        itemId: item.id,
        locale: 'ar',
        label: itemDef.labelAr,
      },
      update: {
        label: itemDef.labelAr,
      },
    });

    if (itemDef.children && itemDef.children.length > 0) {
      await seedItemsRecursive(prisma, menuId, item.id, itemDef.children);
    }
  }
}
