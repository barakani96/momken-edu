/**
 * @schools/module-sis — API Route Handlers
 * Zod-validated CRUD route handlers for Student Profiles and Academic Records.
 */

import { zStudentProfileInputSchema } from '../schemas/student.schema';
import { zAcademicRecordInputSchema } from '../schemas/academic.schema';
import { useSisStore } from '../db/store';
import { StudentRecord, AcademicRecordItem } from '../types';

export interface ApiHandlerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export const sisApiHandlers = {
  // --- Student Profiles CRUD Handlers ---

  listStudents: async (): Promise<ApiHandlerResponse<StudentRecord[]>> => {
    try {
      const students = useSisStore.getState().students;
      return { success: true, data: students };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to list students' };
    }
  },

  getStudent: async (id: string): Promise<ApiHandlerResponse<StudentRecord>> => {
    try {
      const student = useSisStore.getState().students.find((s) => s.id === id || s.studentNumber === id);
      if (!student) {
        return { success: false, error: 'Student profile not found' };
      }
      return { success: true, data: student };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to get student profile' };
    }
  },

  createStudent: async (payload: unknown): Promise<ApiHandlerResponse<StudentRecord>> => {
    const parseResult = zStudentProfileInputSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        errors: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }

    try {
      const store = useSisStore.getState();
      store.addStudent(parseResult.data as any);
      const created = useSisStore.getState().students[0];
      return { success: true, data: created };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create student profile' };
    }
  },

  updateStudent: async (id: string, payload: unknown): Promise<ApiHandlerResponse<StudentRecord>> => {
    try {
      const store = useSisStore.getState();
      store.updateStudent(id, payload as any);
      const updated = store.students.find((s) => s.id === id);
      if (!updated) {
        return { success: false, error: 'Student record not found for update' };
      }
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update student profile' };
    }
  },

  // --- Academic Records CRUD Handlers ---

  getAcademicRecords: async (studentId: string): Promise<ApiHandlerResponse<AcademicRecordItem[]>> => {
    try {
      const student = useSisStore.getState().students.find((s) => s.id === studentId);
      if (!student) {
        return { success: false, error: 'Student not found' };
      }
      return { success: true, data: student.academicRecords || [] };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch academic records' };
    }
  },

  createAcademicRecord: async (studentId: string, payload: unknown): Promise<ApiHandlerResponse<AcademicRecordItem>> => {
    const parseResult = zAcademicRecordInputSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Academic record validation failed',
        errors: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }

    try {
      const store = useSisStore.getState();
      const student = store.students.find((s) => s.id === studentId);
      if (!student) {
        return { success: false, error: 'Student not found for academic record creation' };
      }

      const newRecord: AcademicRecordItem = {
        id: `ar_${Date.now()}`,
        ...parseResult.data,
      };

      const updatedRecords = [...(student.academicRecords || []), newRecord];
      store.updateStudent(studentId, { academicRecords: updatedRecords });

      return { success: true, data: newRecord };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create academic record' };
    }
  },
};
