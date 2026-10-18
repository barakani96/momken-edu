/**
 * @schools/module-sis — StudentProfile
 * 360 Student Profile component displaying personal info, guardians, contact, and academic summary.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tile, Tag, Grid, Column, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { ArrowLeft, User, Phone, Email, Location, Document, Book } from '@carbon/icons-react';
import { StudentRecord } from '../types';

interface StudentProfileProps {
  student: StudentRecord;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const { t } = useTranslation();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button kind="secondary" size="sm" renderIcon={ArrowLeft} onClick={onBack}>
          Back to Directory
        </Button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {student.firstName} {student.lastName} ({student.studentNumber})
        </h2>
        <Tag type={student.status === 'active' ? 'green' : 'blue'}>{student.status}</Tag>
      </div>

      <Tabs>
        <TabList aria-label="Student profile tabs">
          <Tab>{t('sis.profile.personalInfo', 'Personal Information')}</Tab>
          <Tab>{t('sis.profile.contactDetails', 'Contact & Address')}</Tab>
          <Tab>{t('sis.profile.guardiansInfo', 'Guardians & Contacts')}</Tab>
          <Tab>{t('sis.profile.academicHistory', 'Academic Records')}</Tab>
          <Tab>{t('sis.profile.documentVault', 'Document Vault')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Tile style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Personal Details</h3>
              <Grid>
                <Column sm={4} md={4} lg={6}>
                  <p><strong>Full Name (En):</strong> {student.firstName} {student.lastName}</p>
                  <p><strong>Full Name (Ar):</strong> {student.firstNameAr || '-'} {student.lastNameAr || ''}</p>
                  <p><strong>Gender:</strong> {student.gender}</p>
                  <p><strong>Date of Birth:</strong> {student.dateOfBirth}</p>
                  <p><strong>National ID / Iqama:</strong> {student.nationalId}</p>
                </Column>
                <Column sm={4} md={4} lg={6}>
                  <p><strong>Campus:</strong> {student.campus}</p>
                  <p><strong>Program:</strong> {student.program}</p>
                  <p><strong>Grade Level:</strong> {student.gradeLevel}</p>
                  <p><strong>Class Section:</strong> {student.classSection}</p>
                  <p><strong>Cumulative GPA:</strong> {student.gpa.toFixed(2)}</p>
                </Column>
              </Grid>
            </Tile>
          </TabPanel>
          <TabPanel>
            <Tile style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Contact & Address</h3>
              <p><strong>Email:</strong> {student.contact.email}</p>
              <p><strong>Phone:</strong> {student.contact.phone}</p>
              {student.contact.alternatePhone && <p><strong>Alternate Phone:</strong> {student.contact.alternatePhone}</p>}
              <hr style={{ margin: '1rem 0', borderColor: 'var(--cds-border-subtle)' }} />
              <p><strong>Street:</strong> {student.address.street}</p>
              <p><strong>City / State:</strong> {student.address.city}, {student.address.state} {student.address.postalCode}</p>
              <p><strong>Country:</strong> {student.address.country}</p>
            </Tile>
          </TabPanel>
          <TabPanel>
            <Tile style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Guardians & Emergency Contacts</h3>
              {student.guardians && student.guardians.length > 0 ? (
                student.guardians.map((g) => (
                  <div key={g.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--cds-border-subtle)' }}>
                    <p><strong>Name:</strong> {g.guardianName} ({g.relationship})</p>
                    <p><strong>Phone:</strong> {g.phone} | <strong>Email:</strong> {g.email}</p>
                    <p><strong>Primary Contact:</strong> {g.isPrimary ? 'Yes' : 'No'} | <strong>Emergency:</strong> {g.isEmergencyContact ? 'Yes' : 'No'}</p>
                  </div>
                ))
              ) : (
                <p>No guardians registered.</p>
              )}
            </Tile>
          </TabPanel>
          <TabPanel>
            <Tile style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Academic Performance</h3>
              <p>Current Cumulative GPA: <strong>{student.gpa.toFixed(2)}</strong></p>
              <p>Attendance Rate: <strong>{student.attendanceRate}%</strong></p>
              {student.academicRecords && student.academicRecords.length > 0 ? (
                <ul style={{ marginTop: '1rem', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                  {student.academicRecords.map((rec) => (
                    <li key={rec.id} style={{ marginBottom: '0.5rem' }}>
                      {rec.code} - {rec.nameEn}: Grade <strong>{rec.grade}</strong> ({rec.totalScore}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: '1rem' }}>No individual course records loaded.</p>
              )}
            </Tile>
          </TabPanel>
          <TabPanel>
            <Tile style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>Document Vault</h3>
              {student.documents && student.documents.length > 0 ? (
                student.documents.map((doc) => (
                  <div key={doc.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--cds-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p><strong>{doc.fileName}</strong> ({doc.category})</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--cds-text-secondary)' }}>Uploaded: {doc.uploadDate} | Size: {doc.fileSize}</p>
                    </div>
                    <Tag type={doc.status === 'Verified' ? 'green' : 'purple'}>{doc.status}</Tag>
                  </div>
                ))
              ) : (
                <p>No documents uploaded in vault.</p>
              )}
            </Tile>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};
