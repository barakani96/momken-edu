/**
 * @schools/module-sis — Database Schemas & Models
 * Authoritative schemas for Student, Guardian, Enrollment, AcademicPlacement, Transfer, Withdrawal, Graduation, and StudentDocument.
 */

export interface StudentRecord {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  arabicName?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  email: string;
  phone: string;
  gradeLevel: string;
  classSection: string;
  campusId: string;
  status: 'active' | 'enrolled' | 'admitted' | 'applicant' | 'graduated' | 'withdrawn' | 'suspended';
  enrollmentDate: string;
  gpa: number;
  avatarUrl?: string;
  address: string;
  medicalNotes?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  guardians: string[]; // Guardian IDs
  documents: string[]; // Document IDs
}

export interface GuardianRecord {
  id: string;
  name: string;
  arabicName?: string;
  relation: 'father' | 'mother' | 'guardian' | 'sponsor';
  phone: string;
  email: string;
  occupation?: string;
  nationalId: string;
  students: string[]; // Student IDs
}

export interface StudentDocumentRecord {
  id: string;
  studentId: string;
  title: string;
  category: 'transcript' | 'certificate' | 'id_document' | 'medical' | 'disciplinary' | 'other';
  fileType: string;
  fileSize: string;
  uploadDate: string;
  verified: boolean;
  downloadUrl?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  academicTerm: string;
  gradeLevel: string;
  status: 'pending' | 'approved' | 'rejected' | 'enrolled';
  submittedDate: string;
  courses: string[];
}
