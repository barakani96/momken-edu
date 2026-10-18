import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Button,
  Tag,
  Modal,
  Select,
  SelectItem,
  TextInput,
  Search,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Add,
  Document,
  Checkmark,
  Close,
  TrashCan,
  View,
  Education,
  Certificate,
  Identification,
  Grid as GridIcon,
  Table as TableIcon,
  Upload,
  FolderDetails,
} from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import {
  DocumentCategory,
  DocumentType,
  DocumentVerificationStatus,
  StudentDocument,
  StudentRecord,
  resolveDocumentCategory,
} from '../sisTypes';
import { useBreakpoint } from '@schools/ui';
import { DocumentInspectorModal } from './DocumentInspectorModal';

const CATEGORY_DOCUMENT_TYPES: Record<DocumentCategory, DocumentType[]> = {
  academic_transcripts: [
    'Official Academic Transcript',
    'Previous Transcript',
    'Term Grade Report',
  ],
  certificates: [
    'Graduation Diploma',
    'STEM Honors Certificate',
    'Transfer Certificate',
    'Good Conduct Certificate',
  ],
  id_documents: [
    'National ID / Passport',
    'Birth Certificate',
    'Student Campus ID Card',
    'Residence Permit (Iqama)',
  ],
  medical_consent: ['Medical Clearance', 'Guardian Consent', 'Other'],
};

interface EnrichedDocumentItem {
  doc: StudentDocument;
  student: StudentRecord;
  category: DocumentCategory;
}

export const DocumentsView: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const {
    students,
    activeStudentId,
    addDocument,
    updateDocumentStatus,
    updateDocumentCategory,
    deleteDocument,
  } = useSisStore();

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // View State
  const [scope, setScope] = useState<'student' | 'all'>('student');
  const [selectedCategory, setSelectedCategory] = useState<'all' | DocumentCategory>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Inspector Modal State
  const [inspectedItem, setInspectedItem] = useState<{
    doc: StudentDocument;
    student: StudentRecord;
  } | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadStudentId, setUploadStudentId] = useState(activeStudent?.id || '1');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('academic_transcripts');
  const [uploadDocType, setUploadDocType] = useState<DocumentType>('Official Academic Transcript');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.2 MB');
  const [serialNumber, setSerialNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [expiryDate, setExpiryDate] = useState('');
  const [summary, setSummary] = useState('');

  // Aggregate documents according to scope
  const allScopedDocuments: EnrichedDocumentItem[] = useMemo(() => {
    const sourceStudents =
      scope === 'student' && activeStudent ? [activeStudent] : students;
    const list: EnrichedDocumentItem[] = [];
    sourceStudents.forEach((stu) => {
      stu.documents.forEach((doc) => {
        list.push({
          doc,
          student: stu,
          category: resolveDocumentCategory(doc),
        });
      });
    });
    return list;
  }, [scope, activeStudent, students]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: allScopedDocuments.length,
      academic_transcripts: 0,
      certificates: 0,
      id_documents: 0,
      medical_consent: 0,
      verified: 0,
    };
    allScopedDocuments.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      if (item.doc.status === 'Verified') counts.verified += 1;
    });
    return counts;
  }, [allScopedDocuments]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return allScopedDocuments.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (statusFilter !== 'all' && item.doc.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.doc.fileName.toLowerCase().includes(q);
        const matchType = item.doc.documentType.toLowerCase().includes(q);
        const matchSerial = (item.doc.serialNumber || '').toLowerCase().includes(q);
        const matchStudent = `${item.student.firstName} ${item.student.lastName} ${item.student.studentNumber}`
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchType && !matchSerial && !matchStudent) {
          return false;
        }
      }
      return true;
    });
  }, [allScopedDocuments, selectedCategory, statusFilter, searchQuery]);

  if (!activeStudent) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleCategorySelectionInModal = (cat: DocumentCategory) => {
    setUploadCategory(cat);
    const defaultTypes = CATEGORY_DOCUMENT_TYPES[cat];
    if (defaultTypes && defaultTypes.length > 0) {
      setUploadDocType(defaultTypes[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(Number(mb) > 0.05 ? `${mb} MB` : `${Math.max(120, Math.round(file.size / 1024))} KB`);
    }
  };

  const handleUploadDoc = () => {
    const targetId = uploadStudentId || activeStudent.id;
    const cleanName =
      fileName.trim() ||
      `${uploadDocType.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${academicYear}.pdf`;

    addDocument(targetId, {
      category: uploadCategory,
      documentType: uploadDocType,
      fileName: cleanName,
      fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Registrar Office',
      status: 'Pending',
      serialNumber:
        serialNumber.trim() ||
        `${uploadCategory.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      academicYear,
      expiryDate: expiryDate || undefined,
      summary: summary.trim() || undefined,
    });

    setUploadModalOpen(false);
    setFileName('');
    setSerialNumber('');
    setExpiryDate('');
    setSummary('');
  };

  const getCategoryIcon = (cat: DocumentCategory) => {
    if (cat === 'academic_transcripts') {
      return <Education size={20} style={{ fill: 'var(--cds-interactive-01)', flexShrink: 0 }} />;
    }
    if (cat === 'certificates') {
      return <Certificate size={20} style={{ fill: 'var(--cds-support-04, #8a3ffc)', flexShrink: 0 }} />;
    }
    if (cat === 'id_documents') {
      return <Identification size={20} style={{ fill: 'var(--cds-support-02)', flexShrink: 0 }} />;
    }
    return <Document size={20} style={{ fill: 'var(--cds-text-secondary)', flexShrink: 0 }} />;
  };

  const getCategoryTagType = (cat: DocumentCategory) => {
    if (cat === 'academic_transcripts') return 'blue';
    if (cat === 'certificates') return 'purple';
    if (cat === 'id_documents') return 'teal';
    return 'cyan';
  };

  const getStatusTagType = (status: DocumentVerificationStatus) => {
    if (status === 'Verified') return 'green';
    if (status === 'Rejected') return 'red';
    if (status === 'Archived') return 'gray';
    return 'warm-gray';
  };

  const verifiedPercentage =
    categoryCounts.all > 0
      ? Math.round((categoryCounts.verified / categoryCounts.all) * 100)
      : 100;

  return (
    <div style={{ padding: '0.5rem 0 1.5rem' }}>
      {/* Top Workspace Header */}
      <Tile
        style={{
          marginBottom: '1.25rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
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
          <div style={{ flex: '1 1 18rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <FolderDetails size={22} style={{ fill: 'var(--cds-interactive-01)' }} />
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem' }}>
                {t('sis.documents.title')}
              </h3>
              <Tag type="blue" size="sm">
                {scope === 'student'
                  ? `${activeStudent.firstName} ${activeStudent.lastName} (${activeStudent.studentNumber})`
                  : t('sis.documents.scopeAll')}
              </Tag>
            </div>
            <p
              style={{
                margin: '0.375rem 0 0',
                color: 'var(--cds-text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              {t('sis.documents.subtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <div
              role="group"
              aria-label="Document Vault Scope"
              style={{
                display: 'inline-flex',
                border: '1px solid var(--cds-border-subtle-01)',
                background: 'var(--cds-layer-02)',
              }}
            >
              <button
                type="button"
                onClick={() => setScope('student')}
                style={{
                  border: 'none',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: scope === 'student' ? 600 : 400,
                  cursor: 'pointer',
                  background:
                    scope === 'student' ? 'var(--cds-interactive-01)' : 'transparent',
                  color: scope === 'student' ? '#ffffff' : 'var(--cds-text-primary)',
                }}
              >
                {t('sis.documents.scopeStudent')}
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                style={{
                  border: 'none',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: scope === 'all' ? 600 : 400,
                  cursor: 'pointer',
                  background:
                    scope === 'all' ? 'var(--cds-interactive-01)' : 'transparent',
                  color: scope === 'all' ? '#ffffff' : 'var(--cds-text-primary)',
                }}
              >
                {t('sis.documents.scopeAll')}
              </button>
            </div>

            <Button
              kind="primary"
              size="sm"
              renderIcon={Add}
              onClick={() => {
                setUploadStudentId(activeStudent.id);
                setUploadModalOpen(true);
              }}
            >
              {t('sis.documents.uploadBtn')}
            </Button>
          </div>
        </div>
      </Tile>

      {/* 4-Pillar Category Summary Cards (Interactive Filter Tiles) */}
      <div className="cds-grid-cols-4-responsive" style={{ marginBottom: '1.25rem' }}>
        <Tile
          onClick={() =>
            setSelectedCategory(
              selectedCategory === 'academic_transcripts' ? 'all' : 'academic_transcripts'
            )
          }
          style={{
            cursor: 'pointer',
            border:
              selectedCategory === 'academic_transcripts'
                ? '2px solid var(--cds-interactive-01)'
                : '1px solid var(--cds-border-subtle-01)',
            background: 'var(--cds-layer-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.documents.kpis.transcriptsCount')}
            </span>
            <Education size={20} style={{ fill: 'var(--cds-interactive-01)' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.5rem 0 0.25rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {categoryCounts.academic_transcripts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
            {t('sis.documents.categoryDesc.academic_transcripts')}
          </div>
        </Tile>

        <Tile
          onClick={() =>
            setSelectedCategory(
              selectedCategory === 'certificates' ? 'all' : 'certificates'
            )
          }
          style={{
            cursor: 'pointer',
            border:
              selectedCategory === 'certificates'
                ? '2px solid var(--cds-interactive-01)'
                : '1px solid var(--cds-border-subtle-01)',
            background: 'var(--cds-layer-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.documents.kpis.certificatesCount')}
            </span>
            <Certificate size={20} style={{ fill: '#8a3ffc' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.5rem 0 0.25rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {categoryCounts.certificates}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
            {t('sis.documents.categoryDesc.certificates')}
          </div>
        </Tile>

        <Tile
          onClick={() =>
            setSelectedCategory(
              selectedCategory === 'id_documents' ? 'all' : 'id_documents'
            )
          }
          style={{
            cursor: 'pointer',
            border:
              selectedCategory === 'id_documents'
                ? '2px solid var(--cds-interactive-01)'
                : '1px solid var(--cds-border-subtle-01)',
            background: 'var(--cds-layer-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.documents.kpis.idDocumentsCount')}
            </span>
            <Identification size={20} style={{ fill: 'var(--cds-support-02)' }} />
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.5rem 0 0.25rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {categoryCounts.id_documents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
            {t('sis.documents.categoryDesc.id_documents')}
          </div>
        </Tile>

        <Tile
          style={{
            border: '1px solid var(--cds-border-subtle-01)',
            background: 'var(--cds-layer-01)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>
              {t('sis.documents.kpis.verifiedRate')}
            </span>
            <Tag type="green" size="sm">
              {categoryCounts.verified} / {categoryCounts.all}
            </Tag>
          </div>
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              margin: '0.5rem 0 0.25rem',
              color: 'var(--cds-support-02)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {verifiedPercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
            {t('sis.documents.kpis.totalFiles')}: {categoryCounts.all}
          </div>
        </Tile>
      </div>

      {/* Category Filter Tabs + Search & View Controls */}
      <Tile
        style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '0.875rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {(
              [
                'all',
                'academic_transcripts',
                'certificates',
                'id_documents',
                'medical_consent',
              ] as const
            ).map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 400,
                    border: isSelected
                      ? '1px solid var(--cds-interactive-01)'
                      : '1px solid var(--cds-border-subtle-01)',
                    background: isSelected
                      ? 'var(--cds-layer-selected-01)'
                      : 'var(--cds-layer-02)',
                    color: 'var(--cds-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <span>{t(`sis.documents.categories.${cat}`)}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--cds-text-secondary)',
                    }}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label={t('common.actions')}
            style={{
              display: 'inline-flex',
              border: '1px solid var(--cds-border-subtle-01)',
            }}
          >
            <Button
              kind={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              hasIconOnly
              renderIcon={GridIcon}
              iconDescription={t('common.cardsView', 'Cards View')}
              onClick={() => setViewMode('cards')}
            />
            <Button
              kind={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              hasIconOnly
              renderIcon={TableIcon}
              iconDescription={t('common.tableView', 'Table View')}
              onClick={() => setViewMode('table')}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 16rem' }}>
            <Search
              id="sis-documents-search"
              size="md"
              labelText={t('common.search')}
              placeholder={t('sis.documents.searchPlaceholder')}
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '12rem' }}>
            <Select
              id="sis-documents-status-filter"
              size="md"
              hideLabel
              labelText={t('sis.documents.filterStatus')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <SelectItem value="all" text={t('sis.documents.allStatuses')} />
              <SelectItem value="Verified" text="Verified" />
              <SelectItem value="Pending" text="Pending" />
              <SelectItem value="Rejected" text="Rejected" />
              <SelectItem value="Archived" text="Archived" />
            </Select>
          </div>
        </div>
      </Tile>

      {/* Empty State */}
      {filteredDocuments.length === 0 ? (
        <Tile
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid var(--cds-border-subtle-01)',
          }}
        >
          <FolderDetails size={32} style={{ fill: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }} />
          <h4 style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>No matching files in this category</h4>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
            Upload an academic transcript, certificate, or identity document or clear active filters.
          </p>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setUploadModalOpen(true)}>
            {t('sis.documents.uploadBtn')}
          </Button>
        </Tile>
      ) : viewMode === 'cards' ? (
        /* Categorized File Cards Grid */
        <div className="cds-grid-cols-2-responsive">
          {filteredDocuments.map(({ doc, student: docOwner, category }) => (
            <Tile
              key={`${docOwner.id}-${doc.id}`}
              style={{
                background: 'var(--cds-layer-01)',
                border: '1px solid var(--cds-border-subtle-01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.875rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'var(--cds-layer-02)',
                        border: '1px solid var(--cds-border-subtle-01)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>
                          {doc.documentType}
                        </h4>
                        <Tag type={getCategoryTagType(category)} size="sm">
                          {t(`sis.documents.categories.${category}`)}
                        </Tag>
                      </div>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '0.8125rem',
                          color: 'var(--cds-text-secondary)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {doc.fileName} ({doc.fileSize})
                      </div>
                    </div>
                  </div>

                  <Tag type={getStatusTagType(doc.status)} size="sm">
                    {doc.status.toUpperCase()}
                  </Tag>
                </div>

                {doc.summary && (
                  <p
                    style={{
                      margin: '0.625rem 0 0',
                      fontSize: '0.8125rem',
                      color: 'var(--cds-text-secondary)',
                    }}
                  >
                    {doc.summary}
                  </p>
                )}

                <div
                  style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.625rem',
                    borderTop: '1px solid var(--cds-border-subtle-01)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.375rem 1rem',
                    fontSize: '0.75rem',
                    color: 'var(--cds-text-helper)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {scope === 'all' && (
                    <span>
                      <strong>{t('sis.documents.table.student')}:</strong> {docOwner.firstName}{' '}
                      {docOwner.lastName} ({docOwner.studentNumber})
                    </span>
                  )}
                  <span>
                    <strong>REF:</strong>{' '}
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      {doc.serialNumber || `DOC-${doc.id.toUpperCase()}`}
                    </span>
                  </span>
                  {doc.academicYear && (
                    <span>
                      <strong>{t('sis.documents.table.academicYear')}:</strong> {doc.academicYear}
                    </span>
                  )}
                  <span>
                    <strong>{t('sis.documents.table.uploadDate')}:</strong> {doc.uploadDate}
                  </span>
                </div>
              </div>

              {/* Card Footer: Category Reassignment & Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--cds-border-subtle-01)',
                }}
              >
                <div style={{ minWidth: '11.5rem', flex: '1 1 11rem' }}>
                  <Select
                    id={`cat-sel-${doc.id}`}
                    size="sm"
                    hideLabel
                    labelText={t('sis.documents.category')}
                    value={category}
                    onChange={(e) =>
                      updateDocumentCategory(
                        docOwner.id,
                        doc.id,
                        e.target.value as DocumentCategory
                      )
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={View}
                    onClick={() => setInspectedItem({ doc, student: docOwner })}
                  >
                    {t('sis.documents.inspectBtn')}
                  </Button>
                  {doc.status === 'Pending' && (
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Checkmark}
                      onClick={() =>
                        updateDocumentStatus(
                          docOwner.id,
                          doc.id,
                          'Verified',
                          'Verified by Compliance Auditor'
                        )
                      }
                    >
                      {t('sis.documents.verifyBtn')}
                    </Button>
                  )}
                  <Button
                    kind="ghost"
                    className="cds--btn--danger--ghost"
                    size="sm"
                    hasIconOnly
                    iconDescription="Delete Document"
                    renderIcon={TrashCan}
                    onClick={() => deleteDocument(docOwner.id, doc.id)}
                  />
                </div>
              </div>
            </Tile>
          ))}
        </div>
      ) : (
        /* High-Density Categorized File Table View */
        <Tile
          style={{
            padding: 0,
            border: '1px solid var(--cds-border-subtle-01)',
            overflowX: 'auto',
          }}
        >
          <Table size="md" aria-label={t('sis.documents.title')}>
            <TableHead>
              <TableRow>
                <TableHeader>{t('sis.documents.table.fileName')}</TableHeader>
                {scope === 'all' && <TableHeader>{t('sis.documents.table.student')}</TableHeader>}
                <TableHeader>{t('sis.documents.table.category')}</TableHeader>
                <TableHeader>{t('sis.documents.table.docType')}</TableHeader>
                <TableHeader>{t('sis.documents.table.uploadDate')}</TableHeader>
                <TableHeader>{t('sis.documents.table.status')}</TableHeader>
                <TableHeader>{t('sis.documents.table.actions')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map(({ doc, student: docOwner, category }) => (
                <TableRow key={`${docOwner.id}-${doc.id}`}>
                  <TableCell>
                    <div style={{ fontWeight: 600 }}>{doc.fileName}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-secondary)',
                        fontFamily: 'IBM Plex Mono, monospace',
                      }}
                    >
                      {doc.serialNumber || `DOC-${doc.id.toUpperCase()}`} · {doc.fileSize}
                    </div>
                  </TableCell>
                  {scope === 'all' && (
                    <TableCell>
                      <div style={{ fontWeight: 500 }}>
                        {docOwner.firstName} {docOwner.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--cds-text-secondary)',
                          fontFamily: 'IBM Plex Mono, monospace',
                        }}
                      >
                        {docOwner.studentNumber}
                      </div>
                    </TableCell>
                  )}
                  <TableCell style={{ minWidth: '12rem' }}>
                    <Select
                      id={`tbl-cat-${doc.id}`}
                      size="sm"
                      hideLabel
                      labelText={t('sis.documents.category')}
                      value={category}
                      onChange={(e) =>
                        updateDocumentCategory(
                          docOwner.id,
                          doc.id,
                          e.target.value as DocumentCategory
                        )
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
                  </TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {doc.uploadDate}
                  </TableCell>
                  <TableCell>
                    <Tag type={getStatusTagType(doc.status)} size="sm">
                      {doc.status}
                    </Tag>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={View}
                        onClick={() => setInspectedItem({ doc, student: docOwner })}
                      >
                        {t('sis.documents.inspectBtn')}
                      </Button>
                      {doc.status === 'Pending' && (
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={Checkmark}
                          iconDescription={t('sis.documents.verifyBtn')}
                          onClick={() =>
                            updateDocumentStatus(
                              docOwner.id,
                              doc.id,
                              'Verified',
                              'Verified via File Registry'
                            )
                          }
                        />
                      )}
                      <Button
                        kind="ghost"
                        className="cds--btn--danger--ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription="Delete"
                        onClick={() => deleteDocument(docOwner.id, doc.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Tile>
      )}

      {/* Upload & Categorize Modal */}
      <Modal
        open={uploadModalOpen}
        modalHeading={t('sis.documents.uploadModal.heading')}
        primaryButtonText={t('sis.documents.uploadModal.submitBtn')}
        secondaryButtonText={t('sis.documents.uploadModal.cancelBtn')}
        onRequestClose={() => setUploadModalOpen(false)}
        onRequestSubmit={handleUploadDoc}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            id="upload-student-select"
            labelText={t('sis.documents.uploadModal.selectStudent')}
            value={uploadStudentId}
            onChange={(e) => setUploadStudentId(e.target.value)}
          >
            {students.map((stu) => (
              <SelectItem
                key={stu.id}
                value={stu.id}
                text={`${stu.firstName} ${stu.lastName} (${stu.studentNumber})`}
              />
            ))}
          </Select>

          <div className="cds-grid-cols-2-responsive">
            <Select
              id="upload-category-select"
              labelText={t('sis.documents.uploadModal.selectCategory')}
              value={uploadCategory}
              onChange={(e) =>
                handleCategorySelectionInModal(e.target.value as DocumentCategory)
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

            <Select
              id="upload-doctype-select"
              labelText={t('sis.documents.uploadModal.selectType')}
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value as DocumentType)}
            >
              {CATEGORY_DOCUMENT_TYPES[uploadCategory].map((dt) => (
                <SelectItem key={dt} value={dt} text={dt} />
              ))}
            </Select>
          </div>

          <label
            htmlFor="sis-file-upload-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.25rem',
              border: '1px dashed var(--cds-border-strong-01)',
              background: 'var(--cds-layer-02)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <Upload size={20} style={{ fill: 'var(--cds-interactive-01)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-primary)', fontWeight: 500 }}>
              {t('sis.documents.uploadModal.dropzoneText')}
            </span>
            <input
              id="sis-file-upload-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </label>

          <div className="cds-grid-cols-2-responsive">
            <TextInput
              id="upload-filename-input"
              labelText={t('sis.documents.uploadModal.fileName')}
              placeholder="e.g. official_transcript_2026.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <TextInput
              id="upload-serial-input"
              labelText={t('sis.documents.uploadModal.serialNumber')}
              placeholder="e.g. TRN-2026-8841"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="cds-grid-cols-2-responsive">
            <Select
              id="upload-year-select"
              labelText={t('sis.documents.uploadModal.academicYear')}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <SelectItem value="2026-2027" text="2026-2027" />
              <SelectItem value="2025-2026" text="2025-2026" />
              <SelectItem value="2024-2025" text="2024-2025" />
              <SelectItem value="2023-2024" text="2023-2024" />
            </Select>

            <TextInput
              id="upload-expiry-input"
              type="date"
              labelText={t('sis.documents.uploadModal.expiryDate')}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <TextInput
            id="upload-summary-input"
            labelText={t('sis.documents.uploadModal.summary')}
            placeholder="Brief compliance or archival note..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
      </Modal>

      {/* Official Document Inspector Modal */}
      <DocumentInspectorModal
        open={Boolean(inspectedItem)}
        document={inspectedItem?.doc || null}
        student={inspectedItem?.student || null}
        onClose={() => setInspectedItem(null)}
        onUpdateCategory={(stuId, docId, cat) => {
          updateDocumentCategory(stuId, docId, cat);
          setInspectedItem((prev) =>
            prev ? { ...prev, doc: { ...prev.doc, category: cat } } : null
          );
        }}
        onUpdateStatus={(stuId, docId, status, notes) => {
          updateDocumentStatus(stuId, docId, status, notes);
          setInspectedItem((prev) =>
            prev ? { ...prev, doc: { ...prev.doc, status, verificationNotes: notes } } : null
          );
        }}
      />
    </div>
  );
};
