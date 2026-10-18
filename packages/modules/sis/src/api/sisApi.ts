/**
 * @schools/module-sis — Module API
 * Dynamic API services communicating with SQLite database via Express backend.
 */

import axios from 'axios';
import { StudentRecord, StudentDocument } from '../types';

export { sisApiHandlers } from './handlers';

export const sisApi = {
  getStudents: async (): Promise<StudentRecord[]> => {
    try {
      const res = await axios.get('/api/students');
      return res.data;
    } catch {
      return [];
    }
  },

  getStudentById: async (id: string): Promise<StudentRecord | null> => {
    try {
      const res = await axios.get(`/api/students/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createStudent: async (studentData: any): Promise<StudentRecord> => {
    const res = await axios.post('/api/students', studentData);
    return res.data;
  },

  updateStudent: async (id: string, updates: any): Promise<void> => {
    await axios.put(`/api/students/${id}`, updates);
  },

  getStudentDocuments: async (studentId: string): Promise<StudentDocument[]> => {
    try {
      const res = await axios.get(`/api/students/${studentId}/documents`);
      return res.data;
    } catch {
      return [];
    }
  },

  uploadStudentDocument: async (studentId: string, doc: any): Promise<void> => {
    await axios.post(`/api/students/${studentId}/documents`, doc);
  },

  validateRegistration: async (studentId: string, courseIds: string[]): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    const student = await sisApi.getStudentById(studentId);
    if (!student) {
      return { valid: false, errors: ['Student record not found'] };
    }
    if (student.gpa < 2.0 && courseIds.length > 5) {
      errors.push('Student GPA is below 2.0 threshold for maximum course load');
    }
    if (student.documents && !student.documents.some((d: any) => d.status === 'Verified')) {
      errors.push('Student lacks verified identity or transcript documents');
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
