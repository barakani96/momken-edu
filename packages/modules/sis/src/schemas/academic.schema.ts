/**
 * @schools/module-sis — Academic Record Schemas & Types (with Zod Validation)
 * Defines academic performance records, courses, semester GPA history, and placement schemas with Zod validation.
 */

import { z } from 'zod';

export interface AcademicRecordSchema {
  id: string;
  studentId: string;
  code: string;
  nameEn: string;
  nameAr: string;
  term: string;
  credits: number;
  courseworkScore: number;
  finalExamScore: number;
  totalScore: number;
  grade: string;
  instructor: string;
  status: 'In Progress' | 'Completed' | 'Dropped';
}

export const zAcademicRecordSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  code: z.string().min(1, 'Course code is required'),
  nameEn: z.string().min(1, 'Course name (English) is required'),
  nameAr: z.string().min(1, 'Course name (Arabic) is required'),
  term: z.string().min(1, 'Term is required'),
  credits: z.number().min(1).max(6),
  courseworkScore: z.number().min(0).max(100),
  finalExamScore: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
  grade: z.string().min(1),
  instructor: z.string().min(1, 'Instructor name is required'),
  status: z.enum(['In Progress', 'Completed', 'Dropped']),
});

export const zAcademicRecordInputSchema = zAcademicRecordSchema.omit({ id: true });

export interface TermGpaRecordSchema {
  term: string;
  gpa: number;
  credits: number;
  cumulativeGpa: number;
}

export interface AcademicPlacementSchema {
  id: string;
  studentId: string;
  campus: string;
  academicYear: string;
  term: string;
  program: string;
  gradeLevel: string;
  classSection: string;
  cohort: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}
