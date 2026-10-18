/**
 * @schools/module-sis — Student Document Metadata Schemas & Types
 * Defines document metadata schemas, file classifications, verification status, and storage records.
 */

export interface StudentDocumentSchema {
  id: string;
  studentId: string;
  category: 'academic_transcripts' | 'certificates' | 'id_documents' | 'medical' | 'disciplinary' | 'other';
  documentType: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Flagged';
  serialNumber?: string;
  academicYear?: string;
  expiryDate?: string;
  summary?: string;
  verificationNotes?: string;
  downloadUrl?: string;
}

export const documentCategoryLabels = {
  academic_transcripts: 'Academic Transcripts',
  certificates: 'Certificates & Diplomas',
  id_documents: 'Identification & National ID / Iqama',
  medical: 'Medical & Immunization Records',
  disciplinary: 'Disciplinary Records',
  other: 'Other Administrative Documents'
};
