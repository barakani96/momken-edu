/**
 * @schools/module-sis — Student Profile Schemas & Types (with Zod Validation)
 * Defines authoritative student profile data structures, validation rules, and Zod schemas.
 */

import { z } from 'zod';

export interface StudentProfileSchema {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  nationalId: string;
  status: 'active' | 'enrolled' | 'admitted' | 'applicant' | 'graduated' | 'withdrawn' | 'suspended';
  enrollmentStatus: string;
  campus: string;
  program: string;
  gradeLevel: string;
  classSection: string;
  cohort: string;
  gpa: number;
  enrollmentDate: string;
  attendanceRate: number;
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  guardians: {
    id: string;
    guardianName: string;
    relationship: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
  }[];
}

export const zStudentProfileSchema = z.object({
  id: z.string().min(1),
  studentNumber: z.string().min(1),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.string().min(1),
  nationalId: z.string().min(5, 'Valid National ID required'),
  status: z.enum(['active', 'enrolled', 'admitted', 'applicant', 'graduated', 'withdrawn', 'suspended']),
  enrollmentStatus: z.string().min(1),
  campus: z.string().min(1),
  program: z.string().min(1),
  gradeLevel: z.string().min(1),
  classSection: z.string().min(1),
  cohort: z.string().min(1),
  gpa: z.number().min(0).max(4.0),
  enrollmentDate: z.string().min(1),
  attendanceRate: z.number().min(0).max(100),
  contact: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5),
    alternatePhone: z.string().optional(),
  }),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  guardians: z.array(
    z.object({
      id: z.string(),
      guardianName: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(5),
      email: z.string().email(),
      isPrimary: z.boolean(),
      isEmergencyContact: z.boolean(),
    })
  ),
});

export const zStudentProfileInputSchema = zStudentProfileSchema.omit({ id: true });

export const studentProfileFieldMetadata = {
  studentNumber: { type: 'string', required: true, label: 'Student Number' },
  firstName: { type: 'string', required: true, label: 'First Name' },
  lastName: { type: 'string', required: true, label: 'Last Name' },
  gender: { type: 'select', options: ['Male', 'Female', 'Other'], required: true, label: 'Gender' },
  dateOfBirth: { type: 'date', required: true, label: 'Date of Birth' },
  nationalId: { type: 'string', required: true, label: 'National ID / Iqama' },
  gradeLevel: { type: 'string', required: true, label: 'Grade Level' },
  campus: { type: 'string', required: true, label: 'Campus' },
  status: { type: 'select', options: ['active', 'enrolled', 'graduated', 'withdrawn', 'suspended'], required: true, label: 'Status' }
};
