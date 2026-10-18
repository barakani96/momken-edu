import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Search, Tag, Layer } from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search as SearchIcon,
  UserAdmin,
  Education,
  Network_3,
  Enterprise,
  Group,
  Security,
  Settings,
  Flag,
  Task,
  Catalog,
  Calendar,
  UserProfile,
  CheckmarkOutline,
  Globe,
  Asleep,
  LightFilled,
  Time,
  ChevronRight,
  ChevronLeft,
} from '@carbon/icons-react';

import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useAppStore } from '../../stores/useAppStore';
import { UserRole } from '../../auth/auth.types';

export interface CommandItem {
  id: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  path?: string;
  portalRole?: UserRole;
  categoryEn: string;
  categoryAr: string;
  tagType: 'purple' | 'teal' | 'blue' | 'cool-gray' | 'magenta' | 'green' | 'cyan';
  icon: React.ComponentType<any>;
  action?: () => void;
  keywordsEn?: string[];
  keywordsAr?: string[];
}

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPalette({ isOpen: externalIsOpen, onClose: externalOnClose }: CommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { setActiveRole } = useAuth();
  const { i18n } = useTranslation();
  const { dir, changeLanguage } = useLanguage();
  const { theme, toggleDarkTheme } = useAppStore();
  const isDarkTheme = theme === 'g90' || theme === 'g100';
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setQuery('');
    setSelectedIndex(0);
  }, [externalOnClose]);

  const handleOpen = useCallback(() => {
    setInternalIsOpen(true);
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleOpen]);

  // Master Command Registry
  const COMMAND_ITEMS: CommandItem[] = [
    // Portal Context Navigation
    {
      id: 'portal-sis',
      labelEn: 'Student Information System (SIS Portal)',
      labelAr: 'بوابة نظام معلومات الطلاب (SIS)',
      descEn: 'Authoritative student roster, 360° profiles, admissions, enrollment & academics',
      descAr: 'السجل الموحد للطلاب، ملف 360°، القبول، القيد الفصلي والشؤون الأكاديمية',
      path: '/sis/dashboard',
      portalRole: 'sis',
      categoryEn: 'Portals',
      categoryAr: 'البوابات',
      tagType: 'green',
      icon: Group,
      keywordsEn: ['sis', 'student information', 'registrar', 'admissions', 'directory'],
      keywordsAr: ['نظام الطلاب', 'القبول', 'التسجيل', 'سجل الطلاب'],
    },
    {
      id: 'portal-admin',
      labelEn: 'Admin Console Portal',
      labelAr: 'لوحة التحكم الإدارية',
      descEn: 'Governance, RBAC, tenant management & platform services',
      descAr: 'الإدارة العامة، الصلاحيات، المستأجرين وخدمات المنصة',
      path: '/admin',
      portalRole: 'admin',
      categoryEn: 'Portals',
      categoryAr: 'البوابات',
      tagType: 'purple',
      icon: UserAdmin,
      keywordsEn: ['admin', 'governance', 'rbac', 'users', 'platform'],
      keywordsAr: ['إدارة', 'مشرف', 'نظام', 'صلاحيات'],
    },
    {
      id: 'portal-instructor',
      labelEn: 'Faculty & Instructor Portal',
      labelAr: 'بوابة عضو هيئة التدريس',
      descEn: 'Assigned classes, student rosters, grading & schedule',
      descAr: 'الفصول الدراسية، قوائم الطلاب، رصد الدرجات والجدول',
      path: '/instructor',
      portalRole: 'instructor',
      categoryEn: 'Portals',
      categoryAr: 'البوابات',
      tagType: 'teal',
      icon: Network_3,
      keywordsEn: ['instructor', 'faculty', 'teacher', 'classes', 'grading'],
      keywordsAr: ['معلم', 'مدرس', 'تدريس', 'فصول', 'درجات'],
    },
    {
      id: 'portal-student',
      labelEn: 'Student Academic Portal',
      labelAr: 'بوابة الطالب الأكاديمية',
      descEn: 'Enrolled courses, GPA metrics, timetable & records',
      descAr: 'المقررات المسجلة، المعدل التراكمي، الجدول والسجل',
      path: '/student',
      portalRole: 'student',
      categoryEn: 'Portals',
      categoryAr: 'البوابات',
      tagType: 'blue',
      icon: Education,
      keywordsEn: ['student', 'courses', 'gpa', 'schedule', 'transcript'],
      keywordsAr: ['طالب', 'مقررات', 'جدول', 'درجات', 'سجل'],
    },
    {
      id: 'portal-guardian',
      labelEn: 'Guardian & Family Portal',
      labelAr: 'بوابة ولي الأمر والأسرة',
      descEn: 'Children attendance, academic progress, tuition & school communications',
      descAr: 'متابعة حضور الأبناء، التحصيل الدراسي، الرسوم والتواصل المدرسي',
      path: '/guardian',
      portalRole: 'guardian',
      categoryEn: 'Portals',
      categoryAr: 'البوابات',
      tagType: 'cyan',
      icon: Group,
      keywordsEn: ['guardian', 'parent', 'family', 'children', 'tuition'],
      keywordsAr: ['ولي أمر', 'أسرة', 'أبناء', 'رسوم'],
    },

    // SIS Portal Routes
    {
      id: 'sis-directory',
      labelEn: 'SIS Student Master Directory',
      labelAr: 'دليل الطلاب الشامل (SIS)',
      descEn: 'Search, filter, and manage all institutional student records',
      descAr: 'البحث والتصفية وإدارة جميع سجلات الطلاب بالمؤسسة',
      path: '/sis/directory',
      portalRole: 'sis',
      categoryEn: 'SIS Portal',
      categoryAr: 'بوابة الطلاب SIS',
      tagType: 'green',
      icon: Group,
      keywordsEn: ['sis', 'students', 'directory', 'roster'],
      keywordsAr: ['طلاب', 'دليل', 'قوائم', 'سجل'],
    },
    {
      id: 'sis-profile',
      labelEn: 'SIS Student 360° Profile',
      labelAr: 'ملف الطالب الشامل 360° (SIS)',
      descEn: 'Comprehensive 360° view of student academics, guardians & documents',
      descAr: 'عرض شامل لبيانات الطالب الأكاديمية وأولياء الأمور والوثائق',
      path: '/sis/profile',
      portalRole: 'sis',
      categoryEn: 'SIS Portal',
      categoryAr: 'بوابة الطلاب SIS',
      tagType: 'green',
      icon: UserProfile,
      keywordsEn: ['sis', '360', 'profile', 'student record'],
      keywordsAr: ['ملف', 'طالب', '360', 'شامل'],
    },
    {
      id: 'sis-admissions',
      labelEn: 'SIS Admissions & Enrollment',
      labelAr: 'مكتب القبول والقيد الفصلي (SIS)',
      descEn: 'Applicant pipeline, admission offers, and term course enrollment',
      descAr: 'طلبات القبول، التسجيل الفصلي وتسكين الشعب',
      path: '/sis/admissions',
      portalRole: 'sis',
      categoryEn: 'SIS Portal',
      categoryAr: 'بوابة الطلاب SIS',
      tagType: 'green',
      icon: Catalog,
      keywordsEn: ['sis', 'admissions', 'enrollment', 'registration', 'applicants'],
      keywordsAr: ['قبول', 'تسجيل', 'قيد', 'متقدمين'],
    },

    // Admin Console Modules
    {
      id: 'admin-users',
      labelEn: 'User Account Directory',
      labelAr: 'دليل حسابات المستخدمين',
      descEn: 'Manage platform user accounts, authentication & MFA',
      descAr: 'إدارة حسابات المستخدمين، المصادقة والتحقق الثنائي',
      path: '/admin/identity/users',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: UserAdmin,
      keywordsEn: ['users', 'directory', 'accounts', 'mfa', 'people'],
      keywordsAr: ['مستخدمين', 'دليل', 'حسابات', 'أفراد'],
    },
    {
      id: 'admin-groups',
      labelEn: 'User Groups & Teams',
      labelAr: 'مجموعات المستخدمين والفرق',
      descEn: 'Manage user access groups and departmental teams',
      descAr: 'إدارة مجموعات الوصول وفرق العمل بالقطاعات',
      path: '/admin/identity/groups',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Group,
      keywordsEn: ['groups', 'teams', 'departments'],
      keywordsAr: ['مجموعات', 'فرق', 'أقسام'],
    },
    {
      id: 'admin-orgs',
      labelEn: 'Organizations & Campuses',
      labelAr: 'المؤسسات والمجمعات الأكاديمية',
      descEn: 'Manage institutional tenants, campuses & units',
      descAr: 'إدارة المؤسسات التعليمية، الفروع والمجمعات',
      path: '/admin/organization/organizations',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Enterprise,
      keywordsEn: ['organizations', 'campuses', 'tenants', 'universities'],
      keywordsAr: ['مؤسسات', 'جامعات', 'فروع', 'مجمعات'],
    },
    {
      id: 'admin-roles',
      labelEn: 'RBAC Roles & Matrix',
      labelAr: 'مصفوفة أدوار الصلاحيات RBAC',
      descEn: 'Configure security roles, permissions & access rules',
      descAr: 'ضبط أدوار الأمان، الأذونات وقواعد الوصول',
      path: '/admin/access/roles',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Security,
      keywordsEn: ['roles', 'rbac', 'permissions', 'access', 'security'],
      keywordsAr: ['أدوار', 'صلاحيات', 'أمان', 'أذونات'],
    },
    {
      id: 'admin-settings',
      labelEn: 'System Configuration',
      labelAr: 'إعدادات النظام العامة',
      descEn: 'Global parameters, locale settings & institution rules',
      descAr: 'المعايير العامة، اللغات وقواعد المؤسسة',
      path: '/admin/system/general',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Settings,
      keywordsEn: ['settings', 'configuration', 'system', 'global'],
      keywordsAr: ['إعدادات', 'تهيئة', 'تكوين'],
    },
    {
      id: 'admin-flags',
      labelEn: 'Feature Flag Toggles',
      labelAr: 'مفاتيح الميزات البرمجية',
      descEn: 'Enable or disable platform features in real time',
      descAr: 'تفعيل أو تعطيل الميزات البرمجية بالوقت الفعلي',
      path: '/admin/feature-management/flags',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Flag,
      keywordsEn: ['flags', 'features', 'toggles', 'beta'],
      keywordsAr: ['ميزات', 'مفاتيح', 'تجريبي'],
    },
    {
      id: 'admin-audit',
      labelEn: 'Audit & Telemetry Logs',
      labelAr: 'سجلات التدقيق والأمان',
      descEn: 'Track administrative actions and security audit trails',
      descAr: 'تتبع الإجراءات الإدارية وسجلات التدقيق',
      path: '/admin/audit/logs',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Time,
      keywordsEn: ['audit', 'logs', 'telemetry', 'history', 'security'],
      keywordsAr: ['تدقيق', 'سجلات', 'تاريخ', 'تتبع'],
    },
    {
      id: 'admin-jobs',
      labelEn: 'Background Jobs & Operations',
      labelAr: 'العمليات المهام الخلفية',
      descEn: 'Monitor automated jobs, sync pipelines & queues',
      descAr: 'مراقبة المهام المؤتمتة وطوابير المزامنة',
      path: '/admin/operations/jobs',
      portalRole: 'admin',
      categoryEn: 'Admin Module',
      categoryAr: 'إدارة النظام',
      tagType: 'purple',
      icon: Task,
      keywordsEn: ['jobs', 'tasks', 'background', 'queue', 'cron'],
      keywordsAr: ['مهام', 'عمليات', 'خلفية', 'طابور'],
    },

    // Faculty / Instructor Modules
    {
      id: 'inst-classes',
      labelEn: 'My Teaching Classes',
      labelAr: 'الشعب والفصول الدراسية',
      descEn: 'View assigned course sections, rosters & rooms',
      descAr: 'عرض الشعب المسندة، القوائم والقاعات',
      path: '/instructor/classes',
      portalRole: 'instructor',
      categoryEn: 'Faculty Module',
      categoryAr: 'بوابة المعلم',
      tagType: 'teal',
      icon: Catalog,
      keywordsEn: ['classes', 'teaching', 'roster', 'students'],
      keywordsAr: ['فصول', 'شعب', 'طلاب', 'قوائم'],
    },
    {
      id: 'inst-grading',
      labelEn: 'Student Grading & Assessment',
      labelAr: 'رصد وتصحيح الدرجات',
      descEn: 'Review submissions, enter grades & post evaluations',
      descAr: 'مراجعة التكليفات، رصد الدرجات وإدخال التقييمات',
      path: '/instructor/grading',
      portalRole: 'instructor',
      categoryEn: 'Faculty Module',
      categoryAr: 'بوابة المعلم',
      tagType: 'teal',
      icon: CheckmarkOutline,
      keywordsEn: ['grading', 'marks', 'assessment', 'exams'],
      keywordsAr: ['درجات', 'تصحيح', 'تقييم', 'اختبارات'],
    },
    {
      id: 'inst-schedule',
      labelEn: 'Faculty Lecture Schedule',
      labelAr: 'جدول المحاضرات والساعات المكتبية',
      descEn: 'Timetable for classes, labs & office hours',
      descAr: 'جدول المحاضرات، المعامل والساعات المكتبية',
      path: '/instructor/schedule',
      portalRole: 'instructor',
      categoryEn: 'Faculty Module',
      categoryAr: 'بوابة المعلم',
      tagType: 'teal',
      icon: Calendar,
      keywordsEn: ['schedule', 'timetable', 'calendar', 'office hours'],
      keywordsAr: ['جدول', 'محاضرات', 'مواعيد'],
    },

    // Student Modules
    {
      id: 'stud-courses',
      labelEn: 'My Enrolled Courses',
      labelAr: 'مقرراتي الدراسية المسجلة',
      descEn: 'Access course materials, syllabus & term progress',
      descAr: 'استعراض المواد، التوصيف ومستوى التقدم',
      path: '/student/courses',
      portalRole: 'student',
      categoryEn: 'Student Module',
      categoryAr: 'بوابة الطالب',
      tagType: 'blue',
      icon: Catalog,
      keywordsEn: ['courses', 'classes', 'academics', 'learning'],
      keywordsAr: ['مقررات', 'مواد', 'دراسة'],
    },
    {
      id: 'stud-schedule',
      labelEn: 'Student Timetable & Schedule',
      labelAr: 'الجدول الدراسي التفاعلي',
      descEn: 'Class locations, times & exam schedule',
      descAr: 'أوقات المحاضرات، القاعات وجدول الاختبارات',
      path: '/student/schedule',
      portalRole: 'student',
      categoryEn: 'Student Module',
      categoryAr: 'بوابة الطالب',
      tagType: 'blue',
      icon: Calendar,
      keywordsEn: ['schedule', 'timetable', 'classes', 'calendar'],
      keywordsAr: ['جدول', 'حضور', 'مواعيد'],
    },
    {
      id: 'stud-records',
      labelEn: 'Academic Records & Transcript',
      labelAr: 'السجل الأكاديمي والدرجات',
      descEn: 'View cumulative GPA, grade history & certificates',
      descAr: 'عرض المعدل التراكمي، تاريخ الدرجات والشهادات',
      path: '/student/records',
      portalRole: 'student',
      categoryEn: 'Student Module',
      categoryAr: 'بوابة الطالب',
      tagType: 'blue',
      icon: Education,
      keywordsEn: ['records', 'transcript', 'gpa', 'grades'],
      keywordsAr: ['سجل', 'درجات', 'معدل', 'شهادة'],
    },

    // System Preferences Actions
    {
      id: 'sys-language',
      labelEn: isAr ? 'Switch Language to English' : 'تحويل للغة العربية',
      labelAr: isAr ? 'Switch Language to English' : 'تحويل للغة العربية',
      descEn: isAr ? 'Switch platform language to English' : 'تغيير واجهة النظام إلى اللغة العربية',
      descAr: isAr ? 'Switch platform language to English' : 'تغيير واجهة النظام إلى اللغة العربية',
      categoryEn: 'Preferences',
      categoryAr: 'التفضيلات',
      tagType: 'cool-gray',
      icon: Globe,
      action: () => {
        changeLanguage(isAr ? 'en' : 'ar');
      },
      keywordsEn: ['language', 'arabic', 'english', 'i18n', 'locale'],
      keywordsAr: ['لغة', 'عربي', 'إنجليزي', 'ترجمة'],
    },
    {
      id: 'sys-theme',
      labelEn: isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      labelAr: isDarkTheme ? 'التحويل إلى المظهر الفاتح' : 'التحويل إلى المظهر الداكن',
      descEn: isDarkTheme ? 'Enable high-contrast light mode' : 'Enable eye-safe dark theme',
      descAr: isDarkTheme ? 'تفعيل الوضع الفاتح عالي التباين' : 'تفعيل الوضع الداكن المريح للعين',
      categoryEn: 'Preferences',
      categoryAr: 'التفضيلات',
      tagType: 'cool-gray',
      icon: isDarkTheme ? LightFilled : Asleep,
      action: () => {
        toggleDarkTheme();
      },
      keywordsEn: ['theme', 'dark', 'light', 'mode', 'appearance'],
      keywordsAr: ['مظهر', 'داكن', 'فاتح', 'ثيم'],
    },
  ];

  // Filter commands based on query (English + Arabic match)
  const filteredCommands = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();

    const titleEnMatch = item.labelEn.toLowerCase().includes(q);
    const titleArMatch = item.labelAr.toLowerCase().includes(q);
    const descEnMatch = item.descEn.toLowerCase().includes(q);
    const descArMatch = item.descAr.toLowerCase().includes(q);
    const kwEnMatch = item.keywordsEn?.some((k) => k.toLowerCase().includes(q));
    const kwArMatch = item.keywordsAr?.some((k) => k.toLowerCase().includes(q));

    return titleEnMatch || titleArMatch || descEnMatch || descArMatch || kwEnMatch || kwArMatch;
  });

  // Execute selected command
  const executeCommand = useCallback((item: CommandItem) => {
    handleClose();
    if (item.portalRole) {
      setActiveRole(item.portalRole);
    }
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  }, [handleClose, navigate, setActiveRole]);

  // Handle keyboard arrow navigation inside popup
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex] || filteredCommands[0];
      if (target) {
        executeCommand(target);
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      passiveModal
      size="md"
      className="educore-command-palette-modal"
      modalHeading={isAr ? 'بحث لوحة الأوامر العامة' : 'Global Command Palette'}
      modalLabel={isAr ? 'اختصار المفاتيح (Cmd+K / Ctrl+K)' : 'Keyboard Shortcut (Cmd+K / Ctrl+K)'}
    >
      <Layer>
        <div style={{ margin: '0 0 1rem 0' }}>
          <Search
            id="educore-command-palette-search-input"
            size="lg"
            placeholder={
              isAr
                ? 'ابحث بين البوابات، الوحدات، والميزات (مثال: "المستخدمين"، "المقررات")...'
                : "Search portals, modules & actions (e.g., 'Users', 'Courses', 'Schedule')..."
            }
            labelText={isAr ? 'بحث الأوامر' : 'Search Commands'}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyDown={handleListKeyDown}
            ref={searchInputRef}
            autoFocus
          />
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            paddingRight: '0.25rem',
          }}
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const IconComp = cmd.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      executeCommand(cmd);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: isSelected
                      ? 'var(--cds-layer-active, var(--cds-background-hover))'
                      : 'var(--cds-layer-01)',
                    border: isSelected
                      ? '1px solid var(--cds-focus, #0f62fe)'
                      : '1px solid var(--cds-border-subtle)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                    outline: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        padding: '0.375rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--cds-layer-02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={20} style={{ color: 'var(--cds-icon-primary)' }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--cds-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {isAr ? cmd.labelAr : cmd.labelEn}
                        </span>

                        <Tag type={cmd.tagType} size="sm" style={{ margin: 0, padding: '0 6px', flexShrink: 0 }}>
                          {isAr ? cmd.categoryAr : cmd.categoryEn}
                        </Tag>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--cds-text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isAr ? cmd.descAr : cmd.descEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <ArrowIcon size={16} style={{ color: 'var(--cds-icon-secondary)' }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--cds-text-secondary)',
                backgroundColor: 'var(--cds-layer-01)',
                border: '1px solid var(--cds-border-subtle)',
              }}
            >
              <SearchIcon size={28} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {isAr ? `لا توجد نتائج مطابقة لـ "${query}"` : `No commands or modules found matching "${query}"`}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--cds-text-helper)' }}>
                {isAr ? 'جرب البحث بكلمات مثل "المستخدمين"، "المقررات"، "الجدول"' : 'Try searching for terms like "Users", "Courses", "Schedule", or "Roles"'}
              </div>
            </div>
          )}
        </div>
      </Layer>
    </Modal>
  );
}
