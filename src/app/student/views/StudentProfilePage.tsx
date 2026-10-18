import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Tag,
  Button,
  TextInput,
  InlineNotification,
  Layer,
} from '@carbon/react';
import {
  UserProfile,
  User,
  Phone,
  Email,
  Education,
  Location,
  Edit,
  Save,
  CheckmarkFilled,
} from '@carbon/icons-react';

import { AdminPage, AdminSection } from '../../../ui/admin/AdminPage';
import { useAuth } from '../../../auth/AuthProvider';

export function StudentProfilePage() {
  const { i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isAr = i18n.language === 'ar';

  return (
    <AdminPage
      title={isAr ? 'الملف الشخصي للطالب' : 'Student Academic Profile'}
      description={isAr
        ? 'بيانات الهوية الجامعية، تفاصيل المرشد الأكاديمي، معلومات الاتصال بالطوارئ، والتفضيلات.'
        : 'View your official student ID digital badge, academic advisor contact, emergency details, and settings.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', href: '/student' },
        { label: isAr ? 'الملف الشخصي' : 'Profile' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Digital Student ID Badge */}
        <div>
          <Tile
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle)',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--cds-interactive-01, #0f62fe)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                margin: '0 auto 1rem auto',
              }}
            >
              AK
            </div>

            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
              {currentUser?.name || (isAr ? 'أحمد خالد منصور' : 'Ahmed Khaled Mansoor')}
            </h3>

            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.75rem' }}>
              {isAr ? 'طالب بكالوريوس - علوم الحاسب' : 'B.Sc Student - Computer Science'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Tag type="blue" size="md">
                {isAr ? 'الرقم الأكاديمي: 2024-8841' : 'ID: 2024-8841'}
              </Tag>
              <Tag type="green" size="md">
                {isAr ? 'نشط' : 'Active'}
              </Tag>
            </div>

            <div style={{ borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '1rem', textAlign: isAr ? 'right' : 'left', fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{isAr ? 'البريد الجامعي:' : 'University Email:'}</strong> ahmed.khaled@educore.edu
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{isAr ? 'المستوى الأكاديمي:' : 'Academic Level:'}</strong> {isAr ? 'السنة الثانية (Level 4)' : 'Level 4 (Sophomore)'}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{isAr ? 'الكلية:' : 'College:'}</strong> {isAr ? 'كلية علوم وهندسة الحاسب' : 'College of Computer Science & Eng'}
              </div>
            </div>
          </Tile>

          {/* Academic Advisor Contact Card */}
          <Tile
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle)',
              borderRadius: '4px',
              marginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <UserProfile size={20} style={{ color: 'var(--cds-icon-primary)' }} />
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
                {isAr ? 'المرشد الأكاديمي' : 'Academic Advisor'}
              </h4>
            </div>

            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
              {isAr ? 'د. سارة المنصور' : 'Dr. Sarah Al-Mansoor'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.75rem' }}>
              {isAr ? 'قسم علوم الحاسب - مكتب 304B' : 'Computer Science Dept - Office 304B'}
            </div>

            <Button kind="tertiary" size="sm" renderIcon={Email} className="cds-w-full">
              {isAr ? 'مراسلة المرشد' : 'Email Advisor'}
            </Button>
          </Tile>
        </div>

        {/* Right Column: Profile Information Form */}
        <div>
          <AdminSection title={isAr ? 'البيانات الشخصية والمعلومات العامة' : 'Personal & Contact Information'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <TextInput
                id="student-full-name-en"
                labelText={isAr ? 'الاسم باللغة الإنجليزية' : 'Full Name (English)'}
                defaultValue="Ahmed Khaled Mansoor"
                readOnly
              />
              <TextInput
                id="student-full-name-ar"
                labelText={isAr ? 'الاسم باللغة العربية' : 'Full Name (Arabic)'}
                defaultValue="أحمد خالد منصور"
                readOnly
              />
              <TextInput
                id="student-phone"
                labelText={isAr ? 'رقم الجوال' : 'Mobile Phone Number'}
                defaultValue="+966 50 123 4567"
              />
              <TextInput
                id="student-national-id"
                labelText={isAr ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
                defaultValue="1088239410"
                readOnly
              />
            </div>
          </AdminSection>

          <AdminSection title={isAr ? 'بيانات الطوارئ والاتصال' : 'Emergency Contact Details'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <TextInput
                id="emergency-contact-name"
                labelText={isAr ? 'اسم جهة الاتصال بالطوارئ' : 'Emergency Contact Name'}
                defaultValue={isAr ? 'خالد منصور (الأب)' : 'Khaled Mansoor (Father)'}
              />
              <TextInput
                id="emergency-contact-phone"
                labelText={isAr ? 'رقم جوال الطوارئ' : 'Emergency Contact Phone'}
                defaultValue="+966 50 987 6543"
              />
            </div>
          </AdminSection>

          <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: '1rem' }}>
            <Button kind="primary" size="md" renderIcon={Save}>
              {isAr ? 'حفظ التغييرات' : 'Save Profile Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

export default StudentProfilePage;
