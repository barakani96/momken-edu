import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Dropdown, ToastNotification, InlineNotification } from '@carbon/react';
import { Renew } from '@carbon/icons-react';

import { useAuth } from '../../auth/AuthProvider';
import { useAdminStore } from '../../core/admin/adminStore';
import { AdminAuthEngine } from '../../core/admin/adminAuth';
import { AdminApiError } from '../../services/adminApi';
import { useBreakpoint } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { EduCoreShell, NavItem } from '../../ui/layout/EduCoreShell';
import { useNavigationMenu } from '../../hooks/useNavigationMenu';
import { resolveCarbonIcon } from '../../ui/layout/iconResolver';

// Sidebar Navigation Configuration with Role/Permission attributes

const ARABIC_LABELS: Record<string, string> = {
  // Navigation categories and links
  'Core Administration': 'الإدارة الأساسية',
  'System & Compliance': 'النظام والامتثال',
  'Advanced': 'إعدادات متقدمة',
  'nav_dashboard': 'لوحة التحكم',
  'Dashboard Overview': 'لوحة التحكم العامة',
  'nav_sis': 'نظام معلومات الطلاب',
  'Student Information System': 'نظام معلومات الطلاب (SIS)',
  'SIS Portal Overview': 'لوحة قيادة نظام الطلاب',
  'Student Directory': 'دليل الطلاب الشامل',
  'Student 360° Profile': 'ملف الطالب الشامل 360°',
  'Admissions & Enrollment': 'القبول والقيد الفصلي',
  'Academics & Gradebook': 'الأكاديميات ودفتر الدرجات',
  'Finance & Billing Hub': 'المالية والرسوم الدراسية',
  'SIS Security & Audit': 'أمان وتدقيق نظام SIS',
  'nav_org': 'المؤسسات والفروع',
  'Organization & Campuses': 'المؤسسات والفروع',
  'nav_org_list': 'قائمة المؤسسات',
  'Organizations': 'المؤسسات',
  'nav_campuses': 'الفروع والبلدان',
  'Campuses': 'الفروع والبلدان',
  'nav_departments': 'الأقسام الإدارية',
  'Departments': 'الأقسام الإدارية',
  'nav_units': 'الوحدات الأكاديمية',
  'Academic Units': 'الوحدات الأكاديمية',
  'nav_identity': 'دليل الهوية والحسابات',
  'Identity & Accounts': 'دليل الهوية والحسابات',
  'nav_users': 'دليل المستخدمين',
  'User Directory': 'دليل المستخدمين',
  'nav_groups': 'مجموعات الصلاحيات',
  'User Groups': 'مجموعات الصلاحيات',
  'nav_access': 'التحكم بالصلاحيات والأدوار',
  'Access Control & RBAC': 'التحكم بالصلاحيات والأدوار',
  'nav_roles': 'مصفوفة الأدوار',
  'Roles Matrix': 'مصفوفة الأدوار',
  'nav_policies': 'سياسات الوصول',
  'Access Policies': 'سياسات الوصول',
  'nav_sessions': 'الجلسات النشطة',
  'Active Sessions': 'الجلسات النشطة',
  'nav_system': 'تكوين النظام الأساسي',
  'System & Configuration': 'تكوين النظام الأساسي',
  'nav_feature_flags': 'إدارة ميزات النظام',
  'Feature Management': 'إدارة ميزات النظام',
  'nav_audit': 'سجلات التدقيق والامتثال',
  'Audit & Compliance': 'سجلات التدقيق والامتثال',
  'nav_platform': 'خدمات المنصة الأساسية',
  'Platform Services': 'خدمات المنصة الأساسية',
  'nav_notifications': 'محرك الإشعارات',
  'Notifications Engine': 'محرك الإشعارات',
  'nav_workflows': 'سير العمل والموافقات',
  'Workflows & Approvals': 'سير العمل والموافقات',
  'nav_operations': 'العمليات والمهام',
  'Task Operations': 'العمليات والمهام',
  'nav_console': 'إعدادات لوحة التحكم',
  'Console Settings': 'إعدادات لوحة التحكم',

  // Breadcrumbs
  'admin': 'لوحة الإدارة',
  'organization': 'المؤسسة',
  'organizations': 'المؤسسات',
  'campuses': 'الفروع',
  'departments': 'الأقسام',
  'academic-units': 'الوحدات الأكاديمية',
  'identity': 'الهوية',
  'users': 'المستخدمين',
  'groups': 'المجموعات',
  'access': 'الصلاحيات',
  'roles': 'الأدوار',
  'policies': 'السياسات',
  'sessions': 'الجلسات',
  'system': 'النظام',
  'general': 'عام',
  'feature-management': 'الميزات',
  'flags': 'علامات الميزات',
  'platform': 'خدمات المنصة',
  'notifications': 'الإشعارات',
  'workflows': 'سير العمل',
  'audit': 'التدقيق',
  'logs': 'السجلات',
  'operations': 'العمليات',
  'jobs': 'المهام',
  'administration': 'الإدارة',
  'console-settings': 'الإعدادات',

  // Static
  'Admin Console': 'لوحة الإدارة',
  'Platform Scope (Global Superadmin)': 'نطاق المنصة (المدير العام)',
  'SUPERADMIN': 'المدير العام',
  'Platform Admin': 'مسؤول المنصة',
  'Actions': 'الإجراءات',
  'Search...': 'بحث...',
  'Refresh Console State': 'تحديث لوحة الإدارة',
  'Org:': 'مؤسسة:',
  'Campus:': 'فرع:',
  'Active System Notice': 'تنبيه النظام النشط',
  'Systems Nominal': 'النظام يعمل بشكل ممتاز',
  'Scheduled maintenance on Al-Noor Datacenter (Riyadh-01) this Sunday, September 14, at 02:00 UTC.': 'صيانة مجدولة في مركز بيانات النور (Riyadh-01) يوم الأحد القادم، 14 سبتمبر، الساعة 02:00 بالتوقيت العالمي المنسق.',
  'All core services operating normally. Next health audit is scheduled in 4 hours.': 'تعمل جميع الخدمات الأساسية بشكل طبيعي. تم جدولة تدقيق الحالة التالي خلال 4 ساعات.',
};

export function AdminLayout() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLabel = (enText: string) => {
    if (isAr && ARABIC_LABELS[enText]) {
      return ARABIC_LABELS[enText];
    }
    return enText;
  };

  const location = useLocation();
  const { currentUser } = useAuth();
  const { tenantContext, setTenantContext, organizations, campuses } = useAdminStore();
  const { isMobile } = useBreakpoint();

  const [apiErrorNotification, setApiErrorNotification] = useState<AdminApiError | null>(null);
  const [activeAlert, setActiveAlert] = useState<'maintenance' | 'nominal' | null>('maintenance');

  // Subscribe to central API error events
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvt = event as CustomEvent<AdminApiError>;
      if (customEvt.detail) {
        setApiErrorNotification(customEvt.detail);
      }
    };

    window.addEventListener('admin-api-error', handleApiError);
    return () => window.removeEventListener('admin-api-error', handleApiError);
  }, []);

  // Fetch authoritative database-backed navigation menu from PostgreSQL / Navigation API
  const { items: dbNavItems, loading: navLoading, error: navError } = useNavigationMenu('admin');

  // Build breadcrumbs path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbLabel = (segment: string) => {
    return tLabel(segment);
  };

  const breadcrumbs = [
    { label: tLabel('Admin Console'), href: '/admin' },
    ...pathSegments.slice(1).map((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 2).join('/')}`;
      const isLast = index === pathSegments.length - 2;
      return {
        label: getBreadcrumbLabel(segment),
        href: isLast ? undefined : url,
      };
    })
  ];

  // Map database items to NavItem for EduCoreShell (using dynamic localized labels)
  const shellNavigation: NavItem[] = (dbNavItems || []).map((item) => ({
    id: item.id,
    kind: item.type === 'DIVIDER' ? ('divider' as const) : ('item' as const),
    label: item.label,
    path: item.path || undefined,
    icon: resolveCarbonIcon(item.icon),
    children: item.children?.map((child) => ({
      id: child.id,
      kind: child.type === 'DIVIDER' ? ('divider' as const) : ('item' as const),
      label: child.label,
      path: child.path || undefined,
      icon: resolveCarbonIcon(child.icon),
    })),
  }));

  // Compute Tenant Dropdown Options
  const tenantOptions = [
    {
      id: 'platform',
      label: tLabel('Platform Scope (Global Superadmin)'),
      scope: 'platform' as const,
      organizationId: undefined,
      campusId: undefined,
    },
    ...organizations.map(org => ({
      id: `org_${org.id}`,
      label: `${tLabel('Org:')} ${org.name}`,
      scope: 'organization' as const,
      organizationId: org.id,
      campusId: undefined,
    })),
    ...campuses.map(campus => ({
      id: `campus_${campus.id}`,
      label: `${tLabel('Campus:')} ${campus.name}`,
      scope: 'campus' as const,
      organizationId: campus.organizationId,
      campusId: campus.id,
    }))
  ];

  const activeTenantOption = tenantOptions.length > 0 ? (
    tenantContext.scope === 'platform'
      ? tenantOptions[0]
      : tenantContext.scope === 'campus'
        ? tenantOptions.find(o => o.id === `campus_${tenantContext.campusId}`) || tenantOptions[0]
        : tenantOptions.find(o => o.id === `org_${tenantContext.organizationId}`) || tenantOptions[0]
  ) : null;

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: isMobile ? '130px' : '260px', marginInlineEnd: isMobile ? '0.5rem' : '1rem' }}>
        <Dropdown
          id="global-tenant-scope-dropdown"
          titleText=""
          label={tLabel('Search...')}
          size="sm"
          items={tenantOptions}
          itemToString={(item) => (item ? item.label : '')}
          selectedItem={activeTenantOption || null}
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              setTenantContext({
                scope: selectedItem.scope,
                organizationId: selectedItem.organizationId,
                campusId: selectedItem.campusId,
              });
            }
          }}
        />
      </div>
      {!isMobile && (
        <button
          aria-label={tLabel('Refresh Console State')}
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--cds-icon-primary)',
            cursor: 'pointer',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Renew size={20} />
        </button>
      )}
    </div>
  );

  return (
    <EduCoreShell
      headerName={isAr ? "لوحة الإدارة" : "Console"}
      navigation={shellNavigation}
      homeUrl="/admin"
      headerActions={headerActions}
    >
      {/* Dynamic System Status Banner */}
      {activeAlert && (
        <div className="system-status-banner" style={{ marginBottom: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <InlineNotification
            lowContrast={false}
            style={{ maxWidth: '100%', width: '100%' }}
            kind={activeAlert === 'maintenance' ? 'warning' : 'success'}
            title={activeAlert === 'maintenance' ? tLabel('Active System Notice') : tLabel('Systems Nominal')}
            subtitle={activeAlert === 'maintenance' ? tLabel('Scheduled maintenance on Al-Noor Datacenter (Riyadh-01) this Sunday, September 14, at 02:00 UTC.') : tLabel('All core services operating normally. Next health audit is scheduled in 4 hours.')}
            onClose={() => setActiveAlert(null)}
          />
          {activeAlert === 'maintenance' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 0.5rem' }}>
              <button
                onClick={() => setActiveAlert('nominal')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cds-link-primary, #0f62fe)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0',
                  textDecoration: 'underline'
                }}
              >
                {isAr ? 'عرض الوضع الطبيعي' : 'Switch to Nominal'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Central Toast Notification Listener for API Errors */}
      {apiErrorNotification && (
        <div style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
          <ToastNotification
            kind="error"
            title={`Admin API Error (HTTP ${apiErrorNotification.status})`}
            subtitle={apiErrorNotification.message}
            caption={new Date().toLocaleTimeString()}
            onClose={() => setApiErrorNotification(null)}
            timeout={8000}
          />
        </div>
      )}

      {/* Nested Child Route Content */}
      <Outlet />
    </EduCoreShell>
  );
}

export default AdminLayout;
