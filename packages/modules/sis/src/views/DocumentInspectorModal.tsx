import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Tile,
  Tag,
  Select,
  SelectItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  CheckmarkFilled,
  Certificate,
  Identification,
  Education,
  Document,
  Checkmark,
  Close,
} from '@carbon/icons-react';
import {
  StudentDocument,
  StudentRecord,
  DocumentCategory,
  DocumentVerificationStatus,
  resolveDocumentCategory,
} from '../sisTypes';

interface DocumentInspectorModalProps {
  open: boolean;
  document: StudentDocument | null;
  student: StudentRecord | null;
  onClose: () => void;
  onUpdateCategory: (studentId: string, docId: string, category: DocumentCategory) => void;
  onUpdateStatus: (studentId: string, docId: string, status: DocumentVerificationStatus, notes?: string) => void;
}

const DEFAULT_ACADEMIC_COURSES = [
  { code: 'MATH-301', nameEn: 'Advanced Calculus & Analytical Geometry', nameAr: 'التفاضل والتكامل المتقدم', credits: 4, totalScore: 95, grade: 'A+' },
  { code: 'PHYS-302', nameEn: 'Honors Electromagnetism & Mechanics', nameAr: 'الكهرومغناطيسية والميكانيكا', credits: 4, totalScore: 91, grade: 'A' },
  { code: 'CS-305', nameEn: 'Data Structures & Algorithmic Systems', nameAr: 'هياكل البيانات والخوارزميات', credits: 3, totalScore: 97, grade: 'A+' },
  { code: 'CHEM-301', nameEn: 'Organic & Analytical Chemistry', nameAr: 'الكيمياء العضوية والتحليلية', credits: 3, totalScore: 88, grade: 'B+' },
  { code: 'ARAB-301', nameEn: 'Rhetoric & Classical Arabic Literature', nameAr: 'البلاغة والأدب العربي', credits: 2, totalScore: 93, grade: 'A' },
];

export const DocumentInspectorModal: React.FC<DocumentInspectorModalProps> = ({
  open,
  document,
  student,
  onClose,
  onUpdateCategory,
  onUpdateStatus,
}) => {
  const { t, i18n } = useTranslation();

  if (!document || !student) return null;

  const category = resolveDocumentCategory(document);
  const courses =
    student.academicRecords && student.academicRecords.length > 0
      ? student.academicRecords
      : DEFAULT_ACADEMIC_COURSES;
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  const getStatusTagType = (status: DocumentVerificationStatus) => {
    if (status === 'Verified') return 'green';
    if (status === 'Rejected') return 'red';
    if (status === 'Archived') return 'gray';
    return 'warm-gray';
  };

  const getCategoryTagType = (cat: DocumentCategory) => {
    if (cat === 'academic_transcripts') return 'blue';
    if (cat === 'certificates') return 'purple';
    if (cat === 'id_documents') return 'teal';
    return 'cyan';
  };

  return (
    <Modal
      open={open}
      size="lg"
      modalHeading={t('sis.documents.preview.modalTitle')}
      modalLabel={`${student.firstName} ${student.lastName} (${student.studentNumber})`}
      primaryButtonText={
        document.status !== 'Verified'
          ? t('sis.documents.preview.markVerifiedBtn')
          : t('sis.documents.preview.closeBtn')
      }
      secondaryButtonText={t('sis.documents.preview.closeBtn')}
      onRequestClose={onClose}
      onRequestSubmit={() => {
        if (document.status !== 'Verified') {
          onUpdateStatus(
            student.id,
            document.id,
            'Verified',
            'Digitally inspected and certified via SIS File Inspector'
          );
        }
        onClose();
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Metadata & Category Control Bar */}
        <Tile
          style={{
            background: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle-01)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>{document.fileName}</h4>
                <Tag type={getCategoryTagType(category)} size="sm">
                  {t(`sis.documents.categories.${category}`)}
                </Tag>
                <Tag type={getStatusTagType(document.status)} size="sm">
                  {document.status.toUpperCase()}
                </Tag>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem 1.25rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>
                  <strong>{t('sis.documents.preview.serialNumber')}:</strong>{' '}
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    {document.serialNumber || `DOC-${document.id.toUpperCase()}`}
                  </span>
                </span>
                <span>
                  <strong>{t('sis.documents.preview.issueDate')}:</strong> {document.uploadDate}
                </span>
                {document.expiryDate && (
                  <span>
                    <strong>{t('sis.documents.preview.expiryDate')}:</strong> {document.expiryDate}
                  </span>
                )}
                <span>
                  <strong>{t('sis.documents.preview.fileSize')}:</strong> {document.fileSize}
                </span>
                <span>
                  <strong>{t('sis.documents.preview.uploadedBy')}:</strong> {document.uploadedBy}
                </span>
              </div>
            </div>

            <div style={{ minWidth: '14rem' }}>
              <Select
                id="inspector-category-select"
                size="sm"
                labelText={t('sis.documents.preview.reassignCategory')}
                value={category}
                onChange={(e) =>
                  onUpdateCategory(student.id, document.id, e.target.value as DocumentCategory)
                }
              >
                <SelectItem
                  value="academic_transcripts"
                  text={t('sis.documents.categories.academic_transcripts')}
                />
                <SelectItem
                  value="certificates"
                  text={t('sis.documents.categories.certificates')}
                />
                <SelectItem
                  value="id_documents"
                  text={t('sis.documents.categories.id_documents')}
                />
                <SelectItem
                  value="medical_consent"
                  text={t('sis.documents.categories.medical_consent')}
                />
              </Select>
            </div>
          </div>
        </Tile>

        {/* Category-Specific Digital Document Preview Surface */}
        {category === 'academic_transcripts' && (
          <div
            style={{
              background: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-strong-01)',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid var(--cds-interactive-01)',
                paddingBottom: '0.75rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Education size={24} style={{ fill: 'var(--cds-interactive-01)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.04em' }}>
                    {t('sis.documents.preview.transcriptHeader')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                    {student.campus} · {student.program}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-secondary)',
                }}
              >
                {document.serialNumber || 'TRN-2026-OFFICIAL'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                padding: '0.75rem',
                background: 'var(--cds-layer-02)',
              }}
            >
              <div>
                <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                  {t('sis.table.fullName')}
                </span>
                <strong>
                  {student.firstName} {student.lastName}
                  {student.firstNameAr ? ` (${student.firstNameAr} ${student.lastNameAr})` : ''}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                  {t('sis.table.studentNumber')}
                </span>
                <strong style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{student.studentNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                  {t('sis.table.gradeLevel')}
                </span>
                <strong>
                  {student.gradeLevel} ({student.classSection})
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                  {t('sis.documents.preview.cumulativeGpa')}
                </span>
                <strong
                  style={{
                    color: 'var(--cds-interactive-01)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '0.9375rem',
                  }}
                >
                  {student.gpa.toFixed(2)} / 4.00 ({totalCredits} Cr)
                </strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <Table size="sm" aria-label={t('sis.documents.preview.transcriptHeader')}>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('sis.documents.preview.courseCode')}</TableHeader>
                    <TableHeader>{t('sis.documents.preview.courseTitle')}</TableHeader>
                    <TableHeader>{t('sis.documents.preview.credits')}</TableHeader>
                    <TableHeader>{t('sis.documents.preview.score')}</TableHeader>
                    <TableHeader>{t('sis.documents.preview.grade')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.code}>
                      <TableCell style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
                        {c.code}
                      </TableCell>
                      <TableCell>{i18n.language === 'ar' ? c.nameAr : c.nameEn}</TableCell>
                      <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>{c.credits}</TableCell>
                      <TableCell style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {c.totalScore}%
                      </TableCell>
                      <TableCell>
                        <Tag type="blue" size="sm">
                          {c.grade}
                        </Tag>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--cds-border-subtle-01)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--cds-support-02)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                <CheckmarkFilled size={16} />
                {t('sis.documents.preview.certifiedStamp')}
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cds-text-secondary)' }}>
                SHA256: 8F94-E2A1-{student.studentNumber}
              </span>
            </div>
          </div>
        )}

        {category === 'certificates' && (
          <div
            style={{
              background: 'var(--cds-layer-01)',
              border: '2px solid var(--cds-interactive-01)',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Certificate size={32} style={{ fill: 'var(--cds-interactive-01)', marginBottom: '0.5rem' }} />
            <div
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--cds-text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {t('sis.documents.preview.certificateHeader')}
            </div>
            <h3 style={{ margin: '0.5rem 0', fontSize: '1.375rem', fontWeight: 700 }}>
              {document.documentType}
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
              {student.campus} · {student.program}
            </p>
            <div
              style={{
                margin: '1.25rem auto',
                padding: '1rem',
                maxWidth: '32rem',
                background: 'var(--cds-layer-02)',
                border: '1px solid var(--cds-border-subtle-01)',
              }}
            >
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {student.firstName} {student.lastName}
                {student.firstNameAr ? ` — ${student.firstNameAr} ${student.lastNameAr}` : ''}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--cds-text-secondary)',
                  marginTop: '0.375rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {t('sis.table.studentNumber')}: {student.studentNumber} · {t('sis.table.gpa')}:{' '}
                {student.gpa.toFixed(2)} / 4.00
              </div>
              {document.summary && (
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem' }}>{document.summary}</p>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--cds-text-secondary)',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--cds-border-subtle-01)',
              }}
            >
              <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                REF: {document.serialNumber || `CERT-${document.id.toUpperCase()}`}
              </span>
              <span style={{ color: 'var(--cds-support-02)', fontWeight: 600 }}>
                {t('sis.documents.preview.certifiedStamp')}
              </span>
              <span>{document.uploadDate}</span>
            </div>
          </div>
        )}

        {(category === 'id_documents' || category === 'medical_consent') && (
          <div
            style={{
              background: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-strong-01)',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--cds-border-subtle-01)',
                paddingBottom: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {category === 'id_documents' ? (
                  <Identification size={22} style={{ fill: 'var(--cds-interactive-01)' }} />
                ) : (
                  <Document size={22} style={{ fill: 'var(--cds-interactive-01)' }} />
                )}
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  {t('sis.documents.preview.idDocumentHeader')} — {document.documentType}
                </span>
              </div>
              <Tag type="teal" size="sm">
                {document.serialNumber || student.nationalId}
              </Tag>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '4.5rem',
                  height: '5.25rem',
                  background: 'var(--cds-layer-02)',
                  border: '1px solid var(--cds-border-strong-01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'var(--cds-interactive-01)',
                  flexShrink: 0,
                }}
              >
                {student.firstName[0]}
                {student.lastName[0]}
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                    {t('sis.student360.personalSection.fullNameEn')}
                  </span>
                  <strong>
                    {student.firstName} {student.lastName}
                  </strong>
                </div>
                {student.firstNameAr && (
                  <div>
                    <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                      {t('sis.student360.personalSection.fullNameAr')}
                    </span>
                    <strong>
                      {student.firstNameAr} {student.lastNameAr}
                    </strong>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                    {t('sis.student360.personalSection.nationalId')}
                  </span>
                  <strong style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{student.nationalId}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                    {t('sis.student360.personalSection.dob')}
                  </span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{student.dateOfBirth}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                    {t('sis.student360.personalSection.gender')}
                  </span>
                  <strong>{student.gender}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--cds-text-secondary)', display: 'block', fontSize: '0.6875rem' }}>
                    {t('sis.student360.personalSection.campus')}
                  </span>
                  <strong>{student.campus}</strong>
                </div>
              </div>
            </div>

            {document.summary && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: '0 0 0.75rem' }}>
                {document.summary}
              </p>
            )}

            {/* Machine Readable Zone (MRZ) for Identity Verification */}
            <div
              style={{
                padding: '0.625rem 0.75rem',
                background: 'var(--cds-layer-02)',
                borderTop: '1px solid var(--cds-border-subtle-01)',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                color: 'var(--cds-text-secondary)',
                overflowX: 'auto',
              }}
            >
              IDSAU{student.nationalId.replace(/[^A-Z0-9]/gi, '')}&lt;&lt;{student.lastName.toUpperCase()}&lt;&lt;
              {student.firstName.toUpperCase()}&lt;&lt;&lt;&lt;{student.studentNumber.replace('-', '')}
            </div>
          </div>
        )}

        {/* Quick Compliance Action Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
            {document.verificationNotes && (
              <span>
                <strong>{t('sis.documents.preview.verificationNotes')}:</strong> {document.verificationNotes}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {document.status !== 'Verified' && (
              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Checkmark}
                onClick={() =>
                  onUpdateStatus(student.id, document.id, 'Verified', 'Verified by Registrar Auditor')
                }
              >
                {t('sis.documents.verifyBtn')}
              </Button>
            )}
            {document.status !== 'Rejected' && (
              <Button
                kind="danger--ghost"
                size="sm"
                renderIcon={Close}
                onClick={() =>
                  onUpdateStatus(student.id, document.id, 'Rejected', 'Requires higher resolution scan')
                }
              >
                {t('sis.documents.rejectBtn')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
