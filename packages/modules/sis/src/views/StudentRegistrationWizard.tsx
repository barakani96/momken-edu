import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  ProgressIndicator,
  ProgressStep,
  TextInput,
  Select,
  SelectItem,
  Button,
  InlineNotification,
  Checkbox,
  Tag,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import {
  UserFollow,
  CheckmarkOutline,
  Warning,
  ArrowRight,
  ArrowLeft,
  User,
  Document,
  Group,
} from '@carbon/icons-react';
import { useSisStore, DuplicateMatch } from '../sisStore';
import { Gender, StudentStatus } from '../sisTypes';

export const StudentRegistrationWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkDuplicates, createStudent, setActiveTab } = useSisStore();

  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState('2009-05-14');
  const [nationalId, setNationalId] = useState('');

  // Step 2: Contact & Placement
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Riyadh');
  const [campus, setCampus] = useState('Main Riyadh Campus');
  const [program, setProgram] = useState('General Academic Track');
  const [gradeLevel, setGradeLevel] = useState('Grade 10');

  // Step 3: Guardian
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<any>('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);

  // Step 4: Documents
  const [birthCertUploaded, setBirthCertUploaded] = useState(true);
  const [passportUploaded, setPassportUploaded] = useState(true);

  // Step 5: Duplicate Matches
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);

  // Step 6: Confirmation
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState('');

  const handleNextToDuplicateCheck = () => {
    // Run duplicate check algorithm
    const matches = checkDuplicates(nationalId, firstName, lastName, dob);
    setDuplicates(matches);
    setCurrentStep(4);
  };

  const handleSubmitRegistration = () => {
    const created = createStudent({
      firstName,
      lastName,
      gender,
      dateOfBirth: dob,
      nationalId: nationalId || `NAT-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'applicant' as StudentStatus,
      campus,
      program,
      gradeLevel,
      classSection: 'Sec-10A',
      cohort: '2027-Cohort',
      contact: { email: email || 'student@school.edu', phone: phone || '+966 50 000 0000' },
      address: { street, city, state: 'Central', postalCode: '12345', country: 'Saudi Arabia' },
      guardians: guardianName
        ? [
            {
              id: `g_${Date.now()}`,
              guardianName,
              relationship,
              studentLinked: `${firstName} ${lastName}`,
              phone: guardianPhone || phone,
              email: guardianEmail || email,
              isPrimary,
              isEmergencyContact: true,
              isFinancialResponsible: true,
              canPickup: true,
              preferredLanguage: 'en',
            },
          ]
        : [],
    });

    setCreatedStudentId(created.id);
    setIsSubmitted(true);
    setCurrentStep(5);
  };

  if (isSubmitted) {
    return (
      <Tile style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <CheckmarkOutline size={48} style={{ fill: 'var(--cds-support-02)', marginBottom: '1rem' }} />
        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Student Registration Successful!</h3>
        <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1.5rem' }}>
          Registered {firstName} {lastName} into the Student Information System. Official record generated with applicant status.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button
            kind="primary"
            size="sm"
            onClick={() => {
              setActiveTab('directory');
              navigate('/sis/directory');
            }}
          >
            View Student Directory
          </Button>
          <Button
            kind="tertiary"
            size="sm"
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(0);
              setFirstName('');
              setLastName('');
              setNationalId('');
            }}
          >
            Register Another Student
          </Button>
        </div>
      </Tile>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.wizard.step1').replace('1. ', '')} Registration Wizard</h3>
        <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Follow the 6-step workflow to register a new student and verify duplicate entries.
        </p>
      </Tile>

      {/* Carbon Stepper */}
      <ProgressIndicator currentIndex={currentStep} style={{ marginBottom: '2rem' }}>
        <ProgressStep label={t('sis.wizard.step1')} />
        <ProgressStep label={t('sis.wizard.step2')} />
        <ProgressStep label={t('sis.wizard.step3')} />
        <ProgressStep label={t('sis.wizard.step4')} />
        <ProgressStep label={t('sis.wizard.step5')} />
        <ProgressStep label={t('sis.wizard.step6')} />
      </ProgressIndicator>

      {/* Step Content Containers */}
      <Tile style={{ padding: '1.5rem', background: 'var(--cds-layer-01)' }}>
        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 1: Student Personal Details</h4>
            <Grid>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-fn" labelText="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Column>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-ln" labelText="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Column>
            </Grid>

            <Grid>
              <Column sm={4} md={4} lg={4}>
                <Select id="reg-gender" labelText="Gender *" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                  <SelectItem value="Male" text="Male" />
                  <SelectItem value="Female" text="Female" />
                </Select>
              </Column>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-dob" labelText="Date of Birth (YYYY-MM-DD) *" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Column>
            </Grid>

            <TextInput id="reg-natid" labelText="National ID / Passport Number *" placeholder="e.g. 1098234710" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="primary" size="sm" renderIcon={ArrowRight} disabled={!firstName || !lastName} onClick={() => setCurrentStep(1)}>
                Next: Contact & Placement
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Placement */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 2: Contact Information & Academic Placement</h4>
            <Grid>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-email" labelText="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Column>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-phone" labelText="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Column>
            </Grid>

            <Grid>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-street" labelText="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} />
              </Column>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-city" labelText="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </Column>
            </Grid>

            <Select id="reg-campus" labelText="Campus Assignment" value={campus} onChange={(e) => setCampus(e.target.value)}>
              <SelectItem value="Main Riyadh Campus" text="Main Riyadh Campus" />
              <SelectItem value="Jeddah International Campus" text="Jeddah International Campus" />
              <SelectItem value="Dammam Academy" text="Dammam Academy" />
            </Select>

            <Grid>
              <Column sm={4} md={4} lg={4}>
                <Select id="reg-program" labelText="Academic Program" value={program} onChange={(e) => setProgram(e.target.value)}>
                  <SelectItem value="General Academic Track" text="General Academic Track" />
                  <SelectItem value="High School Diploma - Honors STEM" text="High School Diploma - Honors STEM" />
                  <SelectItem value="International Baccalaureate" text="International Baccalaureate" />
                </Select>
              </Column>
              <Column sm={4} md={4} lg={4}>
                <Select id="reg-grade" labelText="Grade Level" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                  <SelectItem value="Grade 9" text="Grade 9" />
                  <SelectItem value="Grade 10" text="Grade 10" />
                  <SelectItem value="Grade 11" text="Grade 11" />
                  <SelectItem value="Grade 12" text="Grade 12" />
                </Select>
              </Column>
            </Grid>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={() => setCurrentStep(0)}>
                Back
              </Button>
              <Button kind="primary" size="sm" renderIcon={ArrowRight} onClick={() => setCurrentStep(2)}>
                Next: Guardians
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Guardian */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 3: Guardian & Family Linking</h4>
            <TextInput id="reg-gname" labelText="Guardian Full Name *" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />

            <Select id="reg-grel" labelText="Relationship *" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <SelectItem value="Father" text="Father" />
              <SelectItem value="Mother" text="Mother" />
              <SelectItem value="Legal Guardian" text="Legal Guardian" />
            </Select>

            <Grid>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-gphone" labelText="Guardian Phone" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
              </Column>
              <Column sm={4} md={4} lg={4}>
                <TextInput id="reg-gemail" labelText="Guardian Email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
              </Column>
            </Grid>

            <Checkbox id="reg-primary" labelText="Designate as Primary Guardian" checked={isPrimary} onChange={(_, { checked }) => setIsPrimary(checked)} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button kind="primary" size="sm" renderIcon={ArrowRight} onClick={() => setCurrentStep(3)}>
                Next: Documents
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Documents Upload */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 4: Required Initial Documents</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              Verify receipt of required registration documentation.
            </p>

            <Tile style={{ background: 'var(--cds-layer-02)' }}>
              <Checkbox id="doc-bc" labelText="Birth Certificate Copy Received" checked={birthCertUploaded} onChange={(_, { checked }) => setBirthCertUploaded(checked)} />
              <Checkbox id="doc-passport" labelText="National ID / Passport Copy Received" checked={passportUploaded} onChange={(_, { checked }) => setPassportUploaded(checked)} />
            </Tile>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button kind="primary" size="sm" renderIcon={ArrowRight} onClick={handleNextToDuplicateCheck}>
                Next: Check Duplicates
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Duplicate Check */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 5: Automated Duplicate Detection</h4>

            {duplicates.length > 0 ? (
              <div>
                <InlineNotification
                  kind="warning"
                  title={t('sis.wizard.duplicateWarningTitle')}
                  subtitle={t('sis.wizard.duplicateWarningDesc')}
                  hideCloseButton
                  style={{ marginBottom: '1rem' }}
                />

                {duplicates.map((d, i) => (
                  <Tile key={i} style={{ marginBottom: '1rem', background: 'var(--cds-layer-02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ fontWeight: 600, margin: 0 }}>
                          {d.existingStudent.firstName} {d.existingStudent.lastName} ({d.existingStudent.studentNumber})
                        </h5>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                          Matching Fields: {d.matchFields.join(', ')} | National ID: {d.existingStudent.nationalId}
                        </p>
                      </div>
                      <Tag type="red" size="sm">{d.matchScore}% Match</Tag>
                    </div>
                  </Tile>
                ))}
              </div>
            ) : (
              <InlineNotification
                kind="success"
                title="Zero Duplicate Matches Found"
                subtitle="The system verified that this national ID and student name combination is unique."
                hideCloseButton
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button kind="primary" size="sm" renderIcon={ArrowRight} onClick={() => setCurrentStep(5)}>
                Proceed to Review & Submit
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <h4 style={{ fontWeight: 600 }}>Step 6: Review Registration & Confirm</h4>

            <Tile style={{ background: 'var(--cds-layer-02)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Student Name:</strong> {firstName} {lastName}</div>
                <div><strong>Gender & DOB:</strong> {gender}, {dob}</div>
                <div><strong>National ID:</strong> {nationalId}</div>
                <div><strong>Campus:</strong> {campus}</div>
                <div><strong>Program & Grade:</strong> {program} ({gradeLevel})</div>
                <div><strong>Guardian:</strong> {guardianName || 'None'} ({relationship})</div>
              </div>
            </Tile>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={() => setCurrentStep(4)}>
                Back
              </Button>
              <Button kind="primary" size="sm" renderIcon={CheckmarkOutline} onClick={handleSubmitRegistration}>
                Confirm & Create Student Record
              </Button>
            </div>
          </div>
        )}
      </Tile>
    </div>
  );
};
