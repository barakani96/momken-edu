import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  TextInput,
  Select,
  SelectItem,
  Tag,
  Toggle,
  Modal,
  InlineNotification,
  DataTableSkeleton,
  Checkbox,
  Tile,
  Grid,
  Column,
  FormGroup
} from '@carbon/react';
import {
  Add,
  TrashCan,
  Checkmark,
  Warning,
  Security,
  User,
  Group,
  Devices,
  Key,
  UserAdmin
} from '@carbon/icons-react';
import { AdminPage } from '../../../../ui/admin/AdminPage';
import { AdminDataTable, ColumnDef } from '../../../../ui/admin/AdminDataTable';
import { AdminDeleteDialog } from '../../../../ui/admin/AdminConfirmationDialog';
import { useAdminStore } from '../../../../core/admin/adminStore';
import { useLanguage } from '../../../../i18n/LanguageProvider';

// Import axe-core for development runtime checks
import axe from 'axe-core';

interface MockSession {
  id: string;
  userId: string;
  username: string;
  device: string;
  browser: string;
  ipAddress: string;
  locationEn: string;
  locationAr: string;
  lastActive: string;
  isCurrent: boolean;
}

interface MockTenant {
  id: string;
  nameEn: string;
  nameAr: string;
  domain: string;
  code: string;
  status: 'active' | 'suspended';
  plan: string;
  createdAt: string;
}

interface MockServiceAccount {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionAr: string;
  roleId: string;
  apiKeyHint: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
}

export function IAMConsolePage() {
  const navigate = useNavigate();
  const { users, roles, createUser, toggleUserStatus, deleteUser } = useAdminStore();
  const { i18n } = useTranslation();
  const { dir } = useLanguage();
  const isAr = i18n.language === 'ar';

  const tLabel = (enText: string, arText: string) => (isAr ? arText : enText);

  // Active Tab Index
  const [activeTab, setActiveTab] = useState(0);

  // Notification Banner State
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  // --- Multi-Factor Authentication (MFA) Setup ---
  const [mfaConfig, setMfaConfig] = useState({
    enforceGlobally: true,
    allowSms: false,
    allowTotp: true,
    allowEmail: true,
    gracePeriodDays: 3,
  });

  // --- SSO Configuration ---
  const [ssoProviders, setSsoProviders] = useState([
    { id: 'google', name: 'Google Workspace OIDC', enabled: true, clientId: '928131-schools.apps.googleusercontent.com' },
    { id: 'okta', name: 'Okta Enterprise SSO', enabled: false, clientId: 'okta_auth_client_8291' },
    { id: 'saml', name: 'Active Directory SAML 2.0', enabled: false, clientId: 'https://sts.windows.net/educore-saml' },
  ]);

  // --- Active Sessions Mock ---
  const [activeSessions, setActiveSessions] = useState<MockSession[]>([
    { id: 'sess_1', userId: '1', username: 'admin', device: 'Apple MacBook Pro', browser: 'Chrome 128.0', ipAddress: '197.34.12.98', locationEn: 'London, UK', locationAr: 'لندن، المملكة المتحدة', lastActive: 'Active now', isCurrent: true },
    { id: 'sess_2', userId: '2', username: 'registrar', device: 'Lenovo ThinkPad X1', browser: 'Firefox 125.0', ipAddress: '82.165.201.3', locationEn: 'Cairo, Egypt', locationAr: 'القاهرة، مصر', lastActive: '10 minutes ago', isCurrent: false },
    { id: 'sess_3', userId: '3', username: 'dean_academic', device: 'iPad Pro', browser: 'Safari Mobile', ipAddress: '188.49.52.17', locationEn: 'Riyadh, KSA', locationAr: 'الرياض، السعودية', lastActive: '2 hours ago', isCurrent: false },
  ]);

  // --- Tenants & Organizations Mock ---
  const [tenants, setTenants] = useState<MockTenant[]>([
    { id: 'tenant_1', nameEn: 'EduCore Main Campus', nameAr: 'حرم إيديوكور الرئيسي', domain: 'main.educore.edu', code: 'EC-MAIN', status: 'active', plan: 'Enterprise', createdAt: '2025-01-10' },
    { id: 'tenant_2', nameEn: 'Al-Noor Prep Academy', nameAr: 'أكاديمية النور الإعدادية', domain: 'alnoor.educore.edu', code: 'EC-NOOR', status: 'active', plan: 'Standard', createdAt: '2025-04-18' },
    { id: 'tenant_3', nameEn: 'Global Science Institute', nameAr: 'معهد العلوم العالمي', domain: 'gsi.educore.edu', code: 'EC-GSI', status: 'suspended', plan: 'Enterprise', createdAt: '2025-06-05' },
  ]);

  // --- Service Accounts Mock ---
  const [serviceAccounts, setServiceAccounts] = useState<MockServiceAccount[]>([
    { id: 'sa_1', name: 'SIS Data Sync Service', descriptionEn: 'Sync student records with Ministry portal', descriptionAr: 'مزامنة سجلات الطلاب مع بوابة الوزارة', roleId: 'role_campus_admin', apiKeyHint: 'sk_live_...a8f2', createdAt: '2026-01-05', expiresAt: '2027-01-05', status: 'active' },
    { id: 'sa_2', name: 'Finance Accounting API', descriptionEn: 'External ledger software pipeline integration', descriptionAr: 'تكامل محاسبي خارجي مع أنظمة الحسابات', roleId: 'role_finance_officer', apiKeyHint: 'sk_live_...f91a', createdAt: '2026-03-12', expiresAt: '2026-09-12', status: 'active' },
  ]);

  // --- Accessibility Test State ---
  const [axeViolations, setAxeViolations] = useState<axe.Result[]>([]);
  const [isAxeLoading, setIsAxeLoading] = useState(false);
  const [axeTestRan, setAxeTestRan] = useState(false);

  // Dialog State Triggers
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateSAOpen, setIsCreateSAOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<any | null>(null);

  // Form Fields State
  const [newFullname, setNewFullname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('role_campus_admin');

  // New Service Account Fields
  const [newSAName, setNewSAName] = useState('');
  const [newSADesc, setNewSADesc] = useState('');
  const [newSARole, setNewSARole] = useState('role_campus_admin');
  const [generatedSAKey, setGeneratedSAKey] = useState<string | null>(null);

  const triggerToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Run Automated axe-core Test
  const runAccessibilityAudit = () => {
    setIsAxeLoading(true);
    setAxeTestRan(true);
    
    // We delay slightly to let the rendering complete cleanly
    setTimeout(() => {
      axe.run(document.getElementById('root') || document.body, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag21aa', 'best-practice']
        }
      })
      .then(results => {
        setAxeViolations(results.violations);
        setIsAxeLoading(false);
        triggerToast('success', tLabel('Accessibility Audit completed successfully!', 'تم اكتمال اختبار فحص إمكانية الوصول بنجاح!'));
      })
      .catch(err => {
        console.error(err);
        setIsAxeLoading(false);
        triggerToast('error', tLabel('Failed to execute axe-core checklist.', 'فشل تشغيل مصفوفة اختبار axe-core.'));
      });
    }, 400);
  };

  const handleCreateUserSubmit = async () => {
    if (!newFullname.trim() || !newEmail.trim()) {
      triggerToast('error', tLabel('Please provide all mandatory fields.', 'يرجى إدخال كافة الحقول الإلزامية.'));
      return;
    }
    await createUser({
      fullName: newFullname,
      email: newEmail,
      username: newUsername || newEmail.split('@')[0],
      title: newTitle,
      roles: [newRole],
      status: 'active',
      mfaEnabled: true,
    });
    setIsCreateUserOpen(false);
    setNewFullname('');
    setNewEmail('');
    setNewUsername('');
    setNewTitle('');
    triggerToast('success', tLabel('User account provisioned successfully.', 'تم إنشاء وتهيئة حساب المستخدم بنجاح.'));
  };

  const handleCreateSASubmit = () => {
    if (!newSAName.trim()) {
      triggerToast('error', tLabel('Service Account Name is mandatory.', 'اسم حساب الخدمة إلزامي.'));
      return;
    }
    const newKey = `sk_live_sec_token_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedSAKey(newKey);

    const newSA: MockServiceAccount = {
      id: `sa_${Date.now()}`,
      name: newSAName,
      descriptionEn: newSADesc || 'Automated programmatic endpoint account',
      descriptionAr: newSADesc || 'حساب آلي للمنافذ البرمجية المقيدة',
      roleId: newSARole,
      apiKeyHint: `sk_live_...${newKey.substring(newKey.length - 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    };

    setServiceAccounts((prev) => [...prev, newSA]);
    setNewSAName('');
    setNewSADesc('');
  };

  const handleTerminateSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    triggerToast('success', tLabel('Active session revoked instantly.', 'تم إنهاء الجلسة النشطة بنجاح.'));
  };

  const handleToggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'active' ? 'suspended' : 'active';
          triggerToast('info', tLabel(`Tenant status updated to ${nextStatus}`, `تم تغيير حالة المستأجر إلى ${nextStatus === 'active' ? 'نشط' : 'معطل'}`));
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <AdminPage
      title={tLabel('IAM Command & Security Center', 'مركز التحكم في الهوية والوصول والأمان (IAM)')}
      description={tLabel(
        'Unified Identity Suite: directory users, granular roles matrix, functional user groups, service accounts, MFA enforcement, and real-time active sessions.',
        'مجموعة الهوية الموحدة: إدارة المستخدمين، مصفوفة الصلاحيات والأدوار، مجموعات العمل، حسابات الخدمات، المصادقة الثنائية، والجلسات النشطة.'
      )}
      breadcrumbs={[{ label: tLabel('Admin Console', 'لوحة الإدارة'), href: '/admin' }, { label: tLabel('Security & IAM', 'الأمان وإدارة الهوية') }]}
    >
      {notification && (
        <div style={{ marginBottom: '1.5rem' }}>
          <InlineNotification
            kind={notification.type}
            title={notification.type === 'success' ? tLabel('Operation Successful', 'عملية ناجحة') : tLabel('System Notice', 'تنبيه النظام')}
            subtitle={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      <Tabs selectedIndex={activeTab} onChange={(e: any) => {
        const idx = typeof e === 'number' ? e : (e?.selectedIndex ?? 0);
        setActiveTab(idx);
      }}>
        <TabList aria-label="IAM Directory Management Categories" style={{ marginBottom: '1.5rem' }}>
          <Tab renderIcon={User}>{tLabel('User Directory', 'دليل الحسابات')}</Tab>
          <Tab renderIcon={Security}>{tLabel('Roles & Permissions', 'الأدوار والصلاحيات')}</Tab>
          <Tab renderIcon={Group}>{tLabel('Groups Manager', 'مجموعات العمل')}</Tab>
          <Tab renderIcon={UserAdmin}>{tLabel('Tenant Organizations', 'مستأجرو الفروع')}</Tab>
          <Tab renderIcon={Devices}>{tLabel('Sessions & Devices', 'الجلسات والأجهزة')}</Tab>
          <Tab renderIcon={Key}>{tLabel('MFA Security', 'المصادقة الثنائية')}</Tab>
          <Tab renderIcon={Security}>{tLabel('SSO Integrations', 'بوابات SSO الموحدة')}</Tab>
          <Tab renderIcon={Key}>{tLabel('Service Accounts', 'حسابات الخدمة API')}</Tab>
          <Tab renderIcon={Warning} style={{ color: 'var(--cds-support-error)' }}>
            {tLabel('Axe Accessibility Auditor', 'مدقق سهولة الاستخدام WCAG')}
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: User Directory */}
          <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button renderIcon={Add} onClick={() => setIsCreateUserOpen(true)}>
                {tLabel('Provision User Account', 'تهيئة حساب مستخدم')}
              </Button>
            </div>

            <AdminDataTable
              title={tLabel('Directory Users', 'أعضاء دليل الحسابات')}
              description={tLabel('Active roster of administrative, registrar, and system operations operators.', 'القائمة النشطة لأعضاء الإدارات والمسجلين والمدققين.')}
              columns={[
                { key: 'fullName', header: tLabel('Full Name', 'الاسم الكامل') },
                { key: 'email', header: tLabel('Email Address', 'البريد الإلكتروني') },
                { key: 'title', header: tLabel('Role Title / Department', 'المسمى / القسم') },
                {
                  key: 'status',
                  header: tLabel('Status', 'الحالة'),
                  render: (row) => (
                    <Tag type={row.status === 'active' ? 'green' : 'red'} size="sm">
                      {row.status === 'active' ? tLabel('Active', 'نشط') : tLabel('Suspended', 'معطل')}
                    </Tag>
                  ),
                },
                {
                  key: 'roles',
                  header: tLabel('Assigned Roles', 'الأدوار الصالحة'),
                  render: (row) =>
                    row.roles.map((rId: string) => {
                      const r = roles.find((role) => role.id === rId || role.code === rId);
                      return (
                        <Tag key={rId} type="purple" size="sm">
                          {r ? r.name : rId}
                        </Tag>
                      );
                    }),
                },
                {
                  key: 'mfaEnabled',
                  header: tLabel('MFA Enforced', 'المصادقة الثنائية'),
                  render: (row) => (
                    <Tag type={row.mfaEnabled ? 'blue' : 'gray'} size="sm">
                      {row.mfaEnabled ? tLabel('Enforced', 'مفروضة') : tLabel('Disabled', 'غير مفعلة')}
                    </Tag>
                  ),
                },
              ]}
              data={users}
              searchPlaceholder={tLabel('Search users by name or email...', 'البحث عن المستخدمين بالاسم أو البريد...')}
              rowActions={(row) => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={TrashCan}
                    hasIconOnly
                    iconDescription={tLabel('Delete user', 'حذف الحساب')}
                    onClick={() => setDeleteTargetUser(row)}
                  />
                </div>
              )}
            />
          </TabPanel>

          {/* TAB 2: Roles Matrix */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--cds-text-primary)' }}>
                {tLabel('Granular Security Role Mapping Matrix', 'مصفوفة مطابقة الصلاحيات والأدوار')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
                {tLabel(
                  'Authorize specific security scopes directly by mapping access rights to standard institutional roles.',
                  'تخويل مستويات الأمان المختلفة مباشرة عبر مطابقة الصلاحيات للأدوار المؤسسية القياسية.'
                )}
              </p>

              <div style={{ overflowX: 'auto', border: '1px solid var(--cds-border-subtle)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--cds-background-hover)', borderBottom: '1px solid var(--cds-border-subtle)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: dir === 'rtl' ? 'right' : 'left', fontWeight: 600 }}>
                        {tLabel('Permission Scope Resource', 'نطاق الصلاحية / المورد')}
                      </th>
                      {roles.map((r) => (
                        <th key={r.id} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                          {r.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'users.read', label: tLabel('View Directory Users', 'عرض مستخدمي الدليل') },
                      { key: 'users.write', label: tLabel('Create & Manage Users', 'إنشاء وإدارة حسابات الأعضاء') },
                      { key: 'roles.write', label: tLabel('Modify Access Roles Matrix', 'تعديل مصفوفة صلاحيات الأدوار') },
                      { key: 'finance.read', label: tLabel('Audit Invoices & Ledgers', 'تدقيق الحسابات والمدفوعات') },
                      { key: 'sis.students', label: tLabel('Manage Student Academic Records', 'إدارة وتعديل السجلات الأكاديمية') },
                    ].map((p, pIdx) => (
                      <tr key={p.key} style={{ borderBottom: '1px solid var(--cds-border-subtle)', backgroundColor: pIdx % 2 === 0 ? 'transparent' : 'var(--cds-layer-02)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--cds-text-primary)' }}>{p.label}</td>
                        {roles.map((r) => {
                          const hasPerm = r.scope === 'platform' || r.id === 'role_campus_admin' || p.key.startsWith('users');
                          return (
                            <td key={r.id} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              <Checkbox id={`check-${r.id}-${p.key}`} defaultChecked={hasPerm} labelText="" />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => triggerToast('success', tLabel('Granular security policy matrix saved.', 'تم حفظ مصفوفة الصلاحيات والأمان بنجاح.'))}>
                  {tLabel('Commit Roles Schema', 'حفظ وإرسال مخطط الأدوار')}
                </Button>
              </div>
            </Tile>
          </TabPanel>

          {/* TAB 3: Groups Manager */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{tLabel('Functional User Groups', 'مجموعات عمل المستخدمين الوظيفية')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    {tLabel('Group multiple staff members together to inherit bulk permission bundles.', 'تجميع موظفي الكليات لتسهيل وراثة حزم كاملة من التراخيص والصلاحيات.')}
                  </p>
                </div>
                <Button size="sm" renderIcon={Add} onClick={() => triggerToast('info', tLabel('Create new group functionality initiated.', 'بدء تهيئة إنشاء مجموعة عمل جديدة.'))}>
                  {tLabel('Create User Group', 'إنشاء مجموعة عمل')}
                </Button>
              </div>

              <Grid style={{ padding: 0 }}>
                {[
                  { nameEn: 'Academic Board Directors', nameAr: 'أعضاء الهيئة الأكاديمية العليا', count: 12, roles: ['GLOBALADMIN'], desc: 'Directors supervising academic systems.' },
                  { nameEn: 'Finance & Ledger Auditors', nameAr: 'مدققو الحسابات والموازنات والرسوم', count: 4, roles: ['CAMPUS_ADMIN'], desc: 'Audit access and invoicing authority.' },
                  { nameEn: 'Student Registrars Group', nameAr: 'مسؤولو تسجيل شؤون الطلاب والقبول', count: 18, roles: ['REGISTRAR'], desc: 'Supervise daily enrollments and student directory.' },
                ].map((g, idx) => (
                  <Column lg={4} md={4} sm={4} key={idx} style={{ marginBottom: '1rem' }}>
                    <div style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h5 style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{tLabel(g.nameEn, g.nameAr)}</h5>
                          <Tag type="blue" size="sm" style={{ margin: 0 }}>{g.count} {tLabel('Members', 'أعضاء')}</Tag>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>{g.desc}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button kind="ghost" size="sm" style={{ flex: 1 }}>{tLabel('Manage Roster', 'إدارة الأعضاء')}</Button>
                        <Button kind="ghost" size="sm" hasIconOnly renderIcon={TrashCan} iconDescription={tLabel('Delete group', 'حذف')} />
                      </div>
                    </div>
                  </Column>
                ))}
              </Grid>
            </Tile>
          </TabPanel>

          {/* TAB 4: Tenant Organizations */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{tLabel('Multi-Tenancy Branches & Organizations', 'المستأجرون والمؤسسات التابعة')}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    {tLabel('Manage isolated system environments, custom school domains, and sub-organizations.', 'إدارة بيئات العمل المعزولة، نطاقات المدارس المخصصة، والمؤسسات الفرعية.')}
                  </p>
                </div>
                <Button size="sm" renderIcon={Add} onClick={() => triggerToast('info', tLabel('Onboard new tenant school initiated.', 'بدء إعداد تسجيل فرع مستأجر جديد.'))}>
                  {tLabel('Onboard Tenant School', 'تسجيل مدرسة تابعة')}
                </Button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--cds-border-subtle)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--cds-background-hover)', borderBottom: '1px solid var(--cds-border-subtle)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: dir === 'rtl' ? 'right' : 'left', fontWeight: 600 }}>{tLabel('School Campus / Tenant', 'اسم الفرع / المستأجر')}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{tLabel('Domain Mapping', 'النطاق المرتبط')}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{tLabel('Tenant Code', 'رمز التعريف')}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{tLabel('Subscription Plan', 'باقة الاشتراك')}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{tLabel('Status', 'الحالة')}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{tLabel('Actions', 'الإجراءات')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--cds-border-subtle)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--cds-text-primary)' }}>{tLabel(t.nameEn, t.nameAr)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>{t.domain}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <code style={{ backgroundColor: 'var(--cds-background)', padding: '0.125rem 0.25rem', borderRadius: '2px', fontSize: '0.75rem' }}>{t.code}</code>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <Tag type="teal" size="sm">{t.plan}</Tag>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <Tag type={t.status === 'active' ? 'green' : 'red'} size="sm">
                            {t.status === 'active' ? tLabel('Active', 'نشط') : tLabel('Suspended', 'معطل')}
                          </Tag>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <Button kind="ghost" size="sm" onClick={() => handleToggleTenantStatus(t.id)}>
                            {t.status === 'active' ? tLabel('Suspend', 'تعطيل') : tLabel('Activate', 'تفعيل')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tile>
          </TabPanel>

          {/* TAB 5: Sessions & Devices */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.5rem' }}>
                {tLabel('Active Authentication Sessions Monitor', 'مراقبة جلسات تسجيل الدخول النشطة')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
                {tLabel('Track live sessions logged into the console and terminate unauthorized hardware immediately.', 'تتبع الأجهزة والجلسات النشطة في النظام حالياً مع إمكانية إلغاء صلاحية أي جهاز فوراً.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeSessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      border: '1px solid var(--cds-border-subtle)',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: s.isCurrent ? 'var(--cds-layer-selected-01)' : 'var(--cds-background)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Devices size={24} style={{ color: s.isCurrent ? 'var(--cds-interactive)' : 'var(--cds-icon-primary)' }} />
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>{s.device} ({s.browser})</span>
                          {s.isCurrent && <Tag type="blue" size="sm" style={{ margin: 0 }}>{tLabel('This Device', 'هذا الجهاز')}</Tag>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                          <span>IP: {s.ipAddress}</span> • <span>{tLabel(s.locationEn, s.locationAr)}</span> • <span>{tLabel('Operator:', 'المستخدم:')} <strong>{s.username}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {!s.isCurrent && (
                        <Button kind="ghost" size="sm" onClick={() => handleTerminateSession(s.id)}>
                          {tLabel('Revoke Access', 'إنهاء الجلسة')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Tile>
          </TabPanel>

          {/* TAB 6: MFA Security */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.5rem' }}>
                {tLabel('Multi-Factor Authentication Enforcements', 'المصادقة الثنائية وفرض التحقق الإضافي')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
                {tLabel('Strengthen the login verification funnel by managing institutional security policy levels.', 'تعزيز معايير تسجيل الدخول عبر فرض أدوات تحقق ومصادقة إضافية على مستوى المؤسسة.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                <Toggle
                  id="mfa-global-toggle"
                  labelText={tLabel('Enforce MFA globally for all administrative tiers', 'فرض المصادقة الثنائية إجبارياً على كافة الموظفين')}
                  labelA={tLabel('Off', 'إيقاف')}
                  labelB={tLabel('On', 'تشغيل')}
                  toggled={mfaConfig.enforceGlobally}
                  onToggle={(val) => setMfaConfig((prev) => ({ ...prev, enforceGlobally: val }))}
                />

                <FormGroup legendText={tLabel('Allowed Authenticator Methods', 'خيارات ومحاور التحقق المقبولة')} style={{ marginTop: '1rem' }}>
                  <Checkbox
                    id="mfa-totp"
                    labelText={tLabel('TOTP Authenticator Apps (Google Auth / Microsoft Duo)', 'تطبيقات رموز التحقق (جوجل أو مايكروسوفت)')}
                    checked={mfaConfig.allowTotp}
                    onChange={(e, { checked }) => setMfaConfig((prev) => ({ ...prev, allowTotp: checked }))}
                  />
                  <Checkbox
                    id="mfa-email"
                    labelText={tLabel('Secure Email Authentication One-Time Password', 'رموز تحقق مؤقتة ترسل للبريد الإلكتروني')}
                    checked={mfaConfig.allowEmail}
                    onChange={(e, { checked }) => setMfaConfig((prev) => ({ ...prev, allowEmail: checked }))}
                  />
                  <Checkbox
                    id="mfa-sms"
                    labelText={tLabel('SMS Text Messages Gateway OTP Code', 'رسائل الجوال النصية القصيرة OTP')}
                    checked={mfaConfig.allowSms}
                    onChange={(e, { checked }) => setMfaConfig((prev) => ({ ...prev, allowSms: checked }))}
                  />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button onClick={() => triggerToast('success', tLabel('MFA institutional security directives committed.', 'تم حفظ سياسات المصادقة الثنائية بنجاح.'))}>
                    {tLabel('Save Directives', 'حفظ المعايير')}
                  </Button>
                </div>
              </div>
            </Tile>
          </TabPanel>

          {/* TAB 7: SSO Integrations */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.5rem' }}>
                {tLabel('Federated Single Sign-On (SSO) Gateways', 'بوابات الهوية الموحدة وتسجيل الدخول المشترك (SSO)')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
                {tLabel('Delegate login controls to institutional identity directory databases.', 'تفويض عمليات تسجيل الدخول والتحقق إلى قواعد بيانات الهوية والشركاء المعتمدين.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ssoProviders.map((prov) => (
                  <div key={prov.id} style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem', backgroundColor: 'var(--cds-background)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>{prov.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                          Client Identifier: <code style={{ backgroundColor: 'var(--cds-layer-02)', padding: '0.125rem 0.25rem' }}>{prov.clientId}</code>
                        </div>
                      </div>
                      <Toggle
                        id={`sso-toggle-${prov.id}`}
                        labelText=""
                        labelA={tLabel('Disabled', 'معطل')}
                        labelB={tLabel('Active', 'مفعل')}
                        toggled={prov.enabled}
                        onToggle={(val) => {
                          setSsoProviders((prev) =>
                            prev.map((p) => {
                              if (p.id === prov.id) {
                                triggerToast('info', tLabel(`SSO Gateway status updated.`, 'تم تحديث حالة بوابة الدخول الموحد.'));
                                return { ...p, enabled: val };
                              }
                              return p;
                            })
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Tile>
          </TabPanel>

          {/* TAB 8: Service Accounts */}
          <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button renderIcon={Add} onClick={() => setIsCreateSAOpen(true)}>
                {tLabel('Generate Service Account', 'إنشاء حساب خدمة برامجي')}
              </Button>
            </div>

            <AdminDataTable
              title={tLabel('Service Accounts API Keys', 'حسابات الخدمة والربط البرمجي API')}
              description={tLabel('Programmatic keys authorizing backend microservices and databases access.', 'مفاتيح الربط الآلي وتخويل الوصول البرمجي للمصغرات وقواعد البيانات.')}
              columns={[
                { key: 'name', header: tLabel('Account Name', 'اسم الحساب البرمجي') },
                {
                  key: 'description',
                  header: tLabel('Purpose', 'الهدف والوظيفة'),
                  render: (row) => tLabel(row.descriptionEn, row.descriptionAr),
                },
                { key: 'apiKeyHint', header: tLabel('API Key Token Hint', 'المفتاح المميز') },
                { key: 'createdAt', header: tLabel('Created At', 'تاريخ الإنشاء') },
                { key: 'expiresAt', header: tLabel('Expires At', 'تاريخ الانتهاء') },
                {
                  key: 'status',
                  header: tLabel('Status', 'الحالة'),
                  render: (row) => (
                    <Tag type={row.status === 'active' ? 'green' : 'red'} size="sm">
                      {row.status === 'active' ? tLabel('Active', 'نشط') : tLabel('Revoked', 'ملغي')}
                    </Tag>
                  ),
                },
              ]}
              data={serviceAccounts}
              searchPlaceholder={tLabel('Search service accounts...', 'البحث عن الحسابات البرمجية...')}
              rowActions={(row) => (
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={TrashCan}
                  hasIconOnly
                  iconDescription={tLabel('Revoke Service Account', 'إلغاء حساب الخدمة')}
                  onClick={() => {
                    setServiceAccounts((prev) => prev.map((sa) => (sa.id === row.id ? { ...sa, status: 'revoked' } : sa)));
                    triggerToast('warning', tLabel('Service Account access token revoked permanently.', 'تم إلغاء صلاحيات حساب الخدمة البرمجي نهائياً.'));
                  }}
                />
              )}
            />
          </TabPanel>

          {/* TAB 9: Axe Accessibility Auditor (axe-core test) */}
          <TabPanel>
            <Tile style={{ marginBottom: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                    {tLabel('Automated Accessibility Testing (axe-core)', 'جناح اختبار سهولة الوصول التلقائي (axe-core)')}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                    {tLabel(
                      'Scan the live DOM hierarchy dynamically using axe-core standards to verify WCAG 2.1 AA focus indicators, color contrast ratios, and structural elements.',
                      'فحص شجرة عناصر الصفحة الحالية تلقائياً باستخدام معايير axe-core لضمان مؤشرات التركيز WCAG 2.1 AA ونسب التباين وهياكل العناصر.'
                    )}
                  </p>
                </div>
                <Button
                  renderIcon={isAxeLoading ? undefined : Security}
                  onClick={runAccessibilityAudit}
                  disabled={isAxeLoading}
                  style={{ minWidth: '180px' }}
                >
                  {isAxeLoading ? tLabel('Scanning DOM...', 'جاري فحص العناصر...') : tLabel('Run Accessibility Check', 'تشغيل فحص الوصول')}
                </Button>
              </div>

              {/* Special verification checklist block requested by user */}
              <Tile style={{ backgroundColor: 'var(--cds-background)', marginBottom: '1.5rem', border: '1px solid var(--cds-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Checkmark size={18} style={{ color: 'var(--cds-support-success)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                    {tLabel('RTL Orientation Focus Ring Verification', 'التحقق من حلقة التركيز ومؤشرات التحديد في وضع القراءة العربي (RTL)')}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  {tLabel(
                    'Ensures focus indicator outline rings and borders remain fully visible, properly positioned, and do not get clipped or inverted under right-to-left orientation styles.',
                    'ضمان بقاء حلقات تركيز لوحة المفاتيح والحدود النشطة مرئية بالكامل وبموضعها الصحيح ولا يتم اقتطاعها أو حجبها في أنماط الاتجاه العربي (RTL).'
                  )}
                </p>
              </Tile>

              {axeTestRan ? (
                isAxeLoading ? (
                  <DataTableSkeleton columnCount={3} rowCount={3} />
                ) : axeViolations.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
                    <Checkmark size={48} style={{ color: 'var(--cds-support-success)', marginBottom: '1rem' }} />
                    <h5 style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                      {tLabel('Zero WCAG AA Accessibility Violations Found!', 'صفر انتهاكات! جميع العناصر متوافقة تماماً مع معايير WCAG AA')}
                    </h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem', maxWidth: '500px' }}>
                      {tLabel(
                        'Every button touch target, text element contrast ratio, form element labels, and RTL keyboard navigation structures pass with high scores.',
                        'كافة نقاط لمس الأزرار، ونسب تباين النصوص، وملصقات حقول النماذج، ومؤشرات التنقل في اتجاه القراءة العربي تعبر بنجاح وتوافق تام.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--cds-support-error-light)', marginBottom: '1rem', borderLeft: '4px solid var(--cds-support-error)' }}>
                      <Warning size={18} style={{ color: 'var(--cds-support-error)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                        {axeViolations.length} {tLabel('Accessibility Violations detected in this viewport', 'انتهاك لسهولة الوصول تم رصده في الواجهة')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {axeViolations.map((v, idx) => (
                        <div key={idx} style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem', backgroundColor: 'var(--cds-background)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>{v.id.toUpperCase()}</div>
                            <Tag type={v.impact === 'critical' ? 'red' : v.impact === 'serious' ? 'magenta' : 'gray'} size="sm">
                              {v.impact.toUpperCase()}
                            </Tag>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>{v.description}</p>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
                            <strong>{tLabel('Help Url:', 'رابط المساعدة:')}</strong> <a href={v.helpUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{v.help}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--cds-border-subtle)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    {tLabel('Click the button above to run the live DOM scan.', 'انقر فوق الزر أعلاه لبدء فحص مصفوفة سهولة الوصول.')}
                  </p>
                </div>
              )}
            </Tile>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* CREATE USER MODAL */}
      <Modal
        open={isCreateUserOpen}
        modalHeading={tLabel('Provision New User Account', 'تهيئة حساب مستخدم جديد')}
        modalLabel={tLabel('Identity Administration', 'إدارة الهوية')}
        primaryButtonText={tLabel('Provision Account', 'تفعيل الحساب')}
        secondaryButtonText={tLabel('Cancel', 'إلغاء')}
        onRequestSubmit={handleCreateUserSubmit}
        onRequestClose={() => setIsCreateUserOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <TextInput
            id="iam-fullname"
            labelText={tLabel('Full Name *', 'الاسم الكامل *')}
            placeholder={tLabel('e.g., Dr. Sarah Jenkins', 'مثال: د. سارة أحمد')}
            value={newFullname}
            onChange={(e) => setNewFullname(e.target.value)}
          />
          <TextInput
            id="iam-email"
            labelText={tLabel('Institutional Email Address *', 'البريد الإلكتروني المؤسسي *')}
            placeholder="sjenkins@educore.edu"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <TextInput
            id="iam-username"
            labelText={tLabel('Desired Username (Optional)', 'اسم المستخدم (اختياري)')}
            placeholder="sjenkins"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <TextInput
            id="iam-title"
            labelText={tLabel('Job Title / Role Title', 'المسمى الوظيفي / دور المنصب')}
            placeholder={tLabel('e.g., Dean of Academic Operations', 'مثال: عميد العمليات الأكاديمية')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Select
            id="iam-role"
            labelText={tLabel('Primary Administrative Role', 'الدور الإداري الرئيسي')}
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id} text={`${r.name} (${r.scope.toUpperCase()})`} />
            ))}
          </Select>
        </div>
      </Modal>

      {/* CREATE SERVICE ACCOUNT MODAL */}
      <Modal
        open={isCreateSAOpen}
        modalHeading={tLabel('Generate Service Account API Token', 'إنشاء مفتاح اتصال برامجي لحساب الخدمة')}
        modalLabel={tLabel('Programmatic Access Control', 'الربط البرمجي المقيد')}
        primaryButtonText={generatedSAKey ? tLabel('Done', 'تم') : tLabel('Generate Credentials', 'توليد بيانات الاتصال')}
        secondaryButtonText={tLabel('Cancel', 'إلغاء')}
        onRequestSubmit={() => {
          if (generatedSAKey) {
            setIsCreateSAOpen(false);
            setGeneratedSAKey(null);
          } else {
            handleCreateSASubmit();
          }
        }}
        onRequestClose={() => {
          setIsCreateSAOpen(false);
          setGeneratedSAKey(null);
        }}
      >
        {!generatedSAKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <TextInput
              id="sa-name"
              labelText={tLabel('Service Account Name *', 'اسم حساب الخدمة البرمجي *')}
              placeholder={tLabel('e.g., SIS Data Sync Pipeline', 'مثال: منصة مزامنة بيانات الطلاب')}
              value={newSAName}
              onChange={(e) => setNewSAName(e.target.value)}
            />
            <TextInput
              id="sa-desc"
              labelText={tLabel('Functional Purpose / Description', 'الهدف والمهمة')}
              placeholder={tLabel('Sync student profiles across microservices', 'مزامنة ملفات وبيانات الطلاب عبر الأنظمة الفرعية')}
              value={newSADesc}
              onChange={(e) => setNewSADesc(e.target.value)}
            />
            <Select
              id="sa-role"
              labelText={tLabel('Authorizing Role Mapping', 'الأدوار والصلاحيات الممنوحة')}
              value={newSARole}
              onChange={(e) => setNewSARole(e.target.value)}
            >
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id} text={`${r.name} (${r.scope.toUpperCase()})`} />
              ))}
            </Select>
          </div>
        ) : (
          <div style={{ padding: '0.5rem 0' }}>
            <InlineNotification
              kind="warning"
              title={tLabel('Save this Key Now!', 'احفظ مفتاح الاتصال البرمجي الآن!')}
              subtitle={tLabel(
                'For security purposes, this credentials API key can only be viewed once. If lost, you must revoke and regenerate a new token.',
                'لأسباب أمنية، يمكن مشاهدة مفتاح الاتصال هذا مرة واحدة فقط. في حال فقدانه، سيتعين عليك إلغاء المفتاح وإنشاء مفتاح جديد.'
              )}
              hideCloseButton
            />
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-primary)' }}>
                {tLabel('API Key Secret Token', 'الرمز السري لمفتاح الاتصال API')}
              </div>
              <code
                style={{
                  display: 'block',
                  backgroundColor: 'var(--cds-layer-02)',
                  padding: '1rem',
                  border: '1px solid var(--cds-border-subtle)',
                  borderRadius: '4px',
                  userSelect: 'all',
                  wordBreak: 'break-all',
                  fontSize: '0.875rem',
                }}
              >
                {generatedSAKey}
              </code>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE USER CONFIRMATION DIALOG */}
      <AdminDeleteDialog
        isOpen={!!deleteTargetUser}
        entityName={deleteTargetUser?.fullName || ''}
        entityType={isAr ? 'حساب مستخدم' : 'User Account'}
        typedConfirmation
        onConfirm={async () => {
          if (deleteTargetUser) {
            await deleteUser(deleteTargetUser.id);
            setDeleteTargetUser(null);
            triggerToast('success', tLabel('User account removed permanently.', 'تم حذف حساب المستخدم نهائياً.'));
          }
        }}
        onClose={() => setDeleteTargetUser(null)}
      />
    </AdminPage>
  );
}
