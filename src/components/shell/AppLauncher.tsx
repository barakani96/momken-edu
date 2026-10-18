import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HeaderGlobalAction,
  HeaderPanel,
  Tile,
  Tag,
  Search,
  Button,
} from '@carbon/react';
import {
  Switcher,
  Education,
  Book,
  Enterprise,
  Building,
  Catalog,
  DocumentAdd,
  Events,
  Dashboard,
  Settings,
  UserAdmin,
  Locked,
  Activity,
  Calendar,
  Certificate,
  User as UserProfile,
} from '@carbon/icons-react';
import { useAuth } from '../../auth/AuthProvider';
import { UserRole } from '../../auth/auth.types';
import { useLanguage } from '../../i18n/LanguageProvider';

const PanelContainer = HeaderPanel as any;

export interface AppLaunchItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  category: 'student' | 'faculty' | 'admin' | 'operations';
  targetRole?: UserRole;
  path: string;
  icon: any;
  badgeEn?: string;
  badgeAr?: string;
}

export const LAUNCHPAD_APPS: AppLaunchItem[] = [
  // Student Portal Apps
  {
    id: 'student-dash',
    nameEn: 'Student Overview',
    nameAr: 'نظرة عامة للطالب',
    descEn: 'Academic progress, active term summary & announcements',
    descAr: 'التقدم الأكاديمي، ملخص الفصل والإعلانات',
    category: 'student',
    targetRole: 'student',
    path: '/student',
    icon: Education,
    badgeEn: 'Student',
    badgeAr: 'الطالب',
  },
  {
    id: 'student-courses',
    nameEn: 'My Enrolled Courses',
    nameAr: 'مقرراتي المسجلة',
    descEn: 'Course syllabi, lecture materials & assignment submissions',
    descAr: 'توصيف المقررات، المحاضرات وتسليم التكليفات',
    category: 'student',
    targetRole: 'student',
    path: '/student/courses',
    icon: Catalog,
    badgeEn: 'Student',
    badgeAr: 'الطالب',
  },
  {
    id: 'student-schedule',
    nameEn: 'Timetable & Exams',
    nameAr: 'الجدول الدراسي والاختبارات',
    descEn: 'Weekly lecture timetable, room locations & exam schedule',
    descAr: 'الجدول الأسبوعي، القاعات وجدول الاختبارات',
    category: 'student',
    targetRole: 'student',
    path: '/student/schedule',
    icon: Calendar,
    badgeEn: 'Student',
    badgeAr: 'الطالب',
  },
  {
    id: 'student-records',
    nameEn: 'Transcripts & Documents',
    nameAr: 'السجل الأكاديمي والوثائق',
    descEn: 'cGPA history, semester transcripts & document requests',
    descAr: 'المعدل التراكمي، السجلات والوثائق الرسمية',
    category: 'student',
    targetRole: 'student',
    path: '/student/records',
    icon: Certificate,
    badgeEn: 'Student',
    badgeAr: 'الطالب',
  },
  {
    id: 'student-profile',
    nameEn: 'Student Digital Profile',
    nameAr: 'الملف الشخصي للطالب',
    descEn: 'Digital student ID card, advisor contact & emergency data',
    descAr: 'البطاقة الجامعية، المرشد الأكاديمي والبيانات',
    category: 'student',
    targetRole: 'student',
    path: '/student/profile',
    icon: UserProfile,
    badgeEn: 'Student',
    badgeAr: 'الطالب',
  },

  // Faculty & Instructor Apps
  {
    id: 'faculty-dash',
    nameEn: 'Faculty Command Center',
    nameAr: 'منصة أعضاء هيئة التدريس',
    descEn: 'Active courses, quick grading queue & student performance',
    descAr: 'المقررات الحالية، قائمة التصحيح وأداء الطلاب',
    category: 'faculty',
    targetRole: 'instructor',
    path: '/instructor',
    icon: Dashboard,
    badgeEn: 'Faculty',
    badgeAr: 'هيئة التدريس',
  },

  // Admin & Governance Apps
  {
    id: 'admin-console',
    nameEn: 'Institutional Admin Console',
    nameAr: 'لوحة التحكم الإدارية',
    descEn: 'System-wide governance, metrics & campus control',
    descAr: 'الحوكمة الشاملة للنظام، المؤشرات والمقرات',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin',
    icon: Enterprise,
    badgeEn: 'Admin',
    badgeAr: 'الإدارة',
  },
  {
    id: 'admin-users',
    nameEn: 'User Directory & Directory Services',
    nameAr: 'دليل المستخدمين والصلاحيات',
    descEn: 'Institutional accounts, status management & identity',
    descAr: 'الحسابات المؤسسية، إدارة الحالة والهوية',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin/identity/users',
    icon: UserAdmin,
    badgeEn: 'Admin',
    badgeAr: 'الإدارة',
  },
  {
    id: 'admin-orgs',
    nameEn: 'Campuses & Organization Tree',
    nameAr: 'الفروع والمقررات الكلية',
    descEn: 'Campus hierarchy, faculties & department mapping',
    descAr: 'الهيكل التنظيمي للمقرات، الكليات والأقسام',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin/organization/organizations',
    icon: Building,
    badgeEn: 'Admin',
    badgeAr: 'الإدارة',
  },
  {
    id: 'admin-roles',
    nameEn: 'RBAC Roles & Permissions',
    nameAr: 'الأدوار وصلاحيات الوصول',
    descEn: 'Security policies, role inheritance & access control',
    descAr: 'سياسات الأمان، توريث الأدوار والتحكم بالوصول',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin/access/roles',
    icon: Locked,
    badgeEn: 'Security',
    badgeAr: 'الأمان',
  },
  {
    id: 'admin-settings',
    nameEn: 'System Configuration',
    nameAr: 'إعدادات المنظومة',
    descEn: 'Global school rules, localization & system options',
    descAr: 'القواعد العامة للمدرسة، التوطين والخيارات',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin/system/general',
    icon: Settings,
    badgeEn: 'Config',
    badgeAr: 'النظام',
  },
  {
    id: 'admin-audit',
    nameEn: 'Audit Logs & Governance',
    nameAr: 'سجلات المراجعة والأمان',
    descEn: 'Institutional activity tracing & security audit events',
    descAr: 'تتبع النشاط المؤسسي وسجلات الأمان التفصيلية',
    category: 'admin',
    targetRole: 'admin',
    path: '/admin/audit/logs',
    icon: Activity,
    badgeEn: 'Audit',
    badgeAr: 'المراجعة',
  },

  // Operational Modules & Standalone SIS Portal
  {
    id: 'sis-portal-hub',
    nameEn: 'Student Information System (SIS Portal)',
    nameAr: 'بوابة نظام معلومات الطلاب (SIS)',
    descEn: 'Standalone SIS Registrar command center, lifecycle & Student 360',
    descAr: 'البوابة المستقلة لعمادة القبول والتسجيل وملف الطالب 360°',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/dashboard',
    icon: Education,
    badgeEn: 'SIS Portal',
    badgeAr: 'بوابة SIS',
  },
  {
    id: 'op-students',
    nameEn: 'Students Master Directory',
    nameAr: 'دليل الطلاب الشامل',
    descEn: 'Full student profiles, filtering, bulk actions & Student 360',
    descAr: 'ملفات الطلاب الشاملة، التصفية المتقدمة وحالات التسجيل',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/directory',
    icon: Education,
    badgeEn: 'SIS',
    badgeAr: 'الطلاب',
  },
  {
    id: 'op-courses',
    nameEn: 'Academics & Gradebook',
    nameAr: 'الأكاديميات ودفتر الدرجات',
    descEn: 'Course catalog, prerequisite definitions & term gradebooks',
    descAr: 'فهرس المقررات، المتطلبات السابقة وسجل الدرجات',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/academics',
    icon: Book,
    badgeEn: 'Academic',
    badgeAr: 'أكاديمي',
  },
  {
    id: 'op-sections',
    nameEn: 'Academic Placement & Sections',
    nameAr: 'التسكين الأكاديمي والشعب الدراسية',
    descEn: 'Section capacity, assigned rooms & cohort placement',
    descAr: 'سعة الشعب، القاعات وتسكين الدفعات الأكاديمية',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/placement',
    icon: Building,
    badgeEn: 'SIS',
    badgeAr: 'تسكين',
  },
  {
    id: 'op-admissions',
    nameEn: 'Admissions & Registration Office',
    nameAr: 'مكتب القبول والتسجيل',
    descEn: 'Applicant pipeline, document verification & seat allocation',
    descAr: 'مراحل المتقدمين، التثبت من الوثائق وحجز المقاعد',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/admissions',
    icon: DocumentAdd,
    badgeEn: 'Admissions',
    badgeAr: 'القبول',
  },
  {
    id: 'op-invoices',
    nameEn: 'Finance & Billing Hub',
    nameAr: 'المالية والحسابات والرسوم',
    descEn: 'Fee schedules, student balances & payment clearing',
    descAr: 'جدول الرسوم، أرصدة الطلاب وإيصالات الدفع',
    category: 'operations',
    targetRole: 'sis',
    path: '/sis/finance',
    icon: Events,
    badgeEn: 'Finance',
    badgeAr: 'المالية',
  },
  {
    id: 'guardian-portal-hub',
    nameEn: 'Guardian & Family Portal',
    nameAr: 'بوابة ولي الأمر والأسرة',
    descEn: 'Monitor children attendance, grades, tuition & school notices',
    descAr: 'متابعة حضور الأبناء، الدرجات، الرسوم والتعاميم المدرسية',
    category: 'student',
    targetRole: 'guardian',
    path: '/guardian',
    icon: Events,
    badgeEn: 'Guardian',
    badgeAr: 'ولي الأمر',
  },
];

export function AppLauncher() {
  const { i18n } = useTranslation();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const { setActiveRole } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'student' | 'faculty' | 'admin' | 'operations'>('all');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const filteredApps = LAUNCHPAD_APPS.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      app.nameEn.toLowerCase().includes(q) ||
      app.nameAr.toLowerCase().includes(q) ||
      app.descEn.toLowerCase().includes(q) ||
      app.descAr.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleLaunch = (app: AppLaunchItem) => {
    if (app.targetRole) {
      setActiveRole(app.targetRole);
    }
    navigate(app.path);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <HeaderGlobalAction
        aria-label={isAr ? 'مُطلِق التطبيقات والمنظومة (LaunchPad)' : 'App Launcher / LaunchPad'}
        isActive={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        tooltipAlignment="center"
      >
        <Switcher size={20} />
      </HeaderGlobalAction>

      {isOpen && (
        <PanelContainer
          expanded
          aria-label={isAr ? 'منصة إطلاق التطبيقات' : 'LaunchPad Panel'}
          style={{
            position: 'fixed',
            top: '3rem',
            [dir === 'rtl' ? 'left' : 'right']: 0,
            width: 'min(28rem, 100vw)',
            maxWidth: '100vw',
            height: 'calc(100dvh - 3rem)',
            maxHeight: '38rem',
            backgroundColor: 'var(--cds-layer-01)',
            border: '1px solid var(--cds-border-subtle)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--cds-border-subtle)',
              backgroundColor: 'var(--cds-layer-02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cds-text-primary)' }}>
                {isAr ? 'منصة إطلاق التطبيقات (LaunchPad)' : 'EduCore App LaunchPad'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                {isAr ? 'التنقل الفوري بين كافة التطبيقات والخدمات' : 'Switch seamlessly across institutional apps & portals'}
              </div>
            </div>
            <Tag type="blue" size="sm">
              {filteredApps.length} {isAr ? 'تطبيق' : 'Apps'}
            </Tag>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cds-border-subtle)' }}>
            <Search
              id="launchpad-search-input"
              size="sm"
              labelText={isAr ? 'البحث عن تطبيق' : 'Search Applications'}
              placeholder={isAr ? 'ابحث باسم التطبيق أو الوظيفة...' : 'Filter apps by name or role...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              overflowX: 'auto',
              borderBottom: '1px solid var(--cds-border-subtle)',
              backgroundColor: 'var(--cds-layer-01)',
            }}
          >
            {[
              { id: 'all', label: isAr ? 'الكل' : 'All' },
              { id: 'student', label: isAr ? 'الطالب' : 'Student' },
              { id: 'faculty', label: isAr ? 'التدريس' : 'Faculty' },
              { id: 'admin', label: isAr ? 'الإدارة' : 'Admin' },
              { id: 'operations', label: isAr ? 'التشغيل' : 'Operations' },
            ].map((cat) => (
              <Button
                key={cat.id}
                kind={activeCategory === cat.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat.id as any)}
                style={{ borderRadius: '12px', minHeight: '1.75rem', padding: '0 0.625rem', fontSize: '0.75rem' }}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Apps Grid List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {filteredApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                {isAr ? 'لا توجد تطبيقات تطابق البحث' : 'No applications match your search criteria'}
              </div>
            ) : (
              filteredApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <Tile
                    key={app.id}
                    onClick={() => handleLaunch(app)}
                    style={{
                      padding: '0.75rem 0.875rem',
                      cursor: 'pointer',
                      backgroundColor: 'var(--cds-layer-01)',
                      border: '1px solid var(--cds-border-subtle)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease-in-out',
                    }}
                    className="launchpad-app-tile"
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--cds-layer-02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cds-icon-primary, #0f62fe)',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                          {isAr ? app.nameAr : app.nameEn}
                        </span>
                        {app.badgeEn && (
                          <Tag
                            type={
                              app.category === 'student'
                                ? 'teal'
                                : app.category === 'faculty'
                                ? 'purple'
                                : app.category === 'admin'
                                ? 'blue'
                                : 'cool-gray'
                            }
                            size="sm"
                            style={{ margin: 0 }}
                          >
                            {isAr ? app.badgeAr : app.badgeEn}
                          </Tag>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--cds-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {isAr ? app.descAr : app.descEn}
                      </div>
                    </div>
                  </Tile>
                );
              })
            )}
          </div>
        </PanelContainer>
      )}
    </div>
  );
}

export default AppLauncher;
