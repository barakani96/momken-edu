/**
 * @schools/module-sis — Database Store & Persistence
 * Authoritative Zustand store managing Student records, active student context, documents, guardians, and lifecycle workflows.
 */

import { create } from 'zustand';
import { StudentRecord, StudentDocument, TimelineEvent, GuardianRecord } from '../types';
import { INITIAL_STUDENTS } from './initialData';

export interface SisState {
  students: StudentRecord[];
  activeStudentId: string;
  activeTab: string;
  searchQuery: string;
  filterCampus: string;
  filterGrade: string;
  filterStatus: string;
  
  // Actions
  setActiveStudentId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterCampus: (campus: string) => void;
  setFilterGrade: (grade: string) => void;
  setFilterStatus: (status: string) => void;
  
  addStudent: (student: Omit<StudentRecord, 'id' | 'timeline'>) => void;
  updateStudent: (id: string, updates: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  
  addDocument: (studentId: string, doc: Omit<StudentDocument, 'id'>) => void;
  verifyDocument: (studentId: string, docId: string) => void;
  deleteDocument: (studentId: string, docId: string) => void;
  
  addGuardian: (studentId: string, guardian: Omit<GuardianRecord, 'id' | 'studentId' | 'studentLinked'>) => void;
  addTimelineEvent: (studentId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
}

export const useSisStore = create<SisState>((set) => ({
  students: INITIAL_STUDENTS,
  activeStudentId: INITIAL_STUDENTS[0]?.id || '1',
  activeTab: 'dashboard',
  searchQuery: '',
  filterCampus: 'all',
  filterGrade: 'all',
  filterStatus: 'all',

  setActiveStudentId: (id) => set({ activeStudentId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCampus: (campus) => set({ filterCampus: campus }),
  setFilterGrade: (grade) => set({ filterGrade: grade }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  addStudent: (studentData) => set((state) => {
    const newId = String(Date.now());
    const newStudent: StudentRecord = {
      ...studentData,
      id: newId,
      timeline: [
        {
          id: `t_${Date.now()}`,
          studentId: newId,
          type: 'Student Created',
          title: 'Student Record Created',
          description: `Student ${studentData.firstName} ${studentData.lastName} (${studentData.studentNumber}) added to SIS.`,
          actor: 'Registrar Staff',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
      ],
    };
    return { students: [newStudent, ...state.students], activeStudentId: newId };
  }),

  updateStudent: (id, updates) => set((state) => ({
    students: state.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  })),

  deleteStudent: (id) => set((state) => ({
    students: state.students.filter((s) => s.id !== id),
    activeStudentId: state.activeStudentId === id ? (state.students.find((s) => s.id !== id)?.id || '') : state.activeStudentId,
  })),

  addDocument: (studentId, docData) => set((state) => ({
    students: state.students.map((s) => {
      if (s.id === studentId) {
        const newDoc: StudentDocument = {
          ...docData,
          id: `doc_${Date.now()}`,
          studentId,
          uploadDate: new Date().toISOString().substring(0, 10),
        };
        const newTimelineEvent: TimelineEvent = {
          id: `t_${Date.now()}`,
          studentId,
          type: 'Document Uploaded',
          title: `Document Uploaded: ${docData.documentType}`,
          description: `Uploaded file ${docData.fileName} (${docData.fileSize}) into category ${docData.category}.`,
          actor: docData.uploadedBy || 'System User',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        return {
          ...s,
          documents: [newDoc, ...s.documents],
          timeline: [newTimelineEvent, ...s.timeline],
        };
      }
      return s;
    }),
  })),

  verifyDocument: (studentId, docId) => set((state) => ({
    students: state.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          documents: s.documents.map((d) => (d.id === docId ? { ...d, status: 'Verified' } : d)),
        };
      }
      return s;
    }),
  })),

  deleteDocument: (studentId, docId) => set((state) => ({
    students: state.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          documents: s.documents.filter((d) => d.id !== docId),
        };
      }
      return s;
    }),
  })),

  addGuardian: (studentId, guardianData) => set((state) => ({
    students: state.students.map((s) => {
      if (s.id === studentId) {
        const studentFullName = `${s.firstName} ${s.lastName} (${s.studentNumber})`;
        const newG: GuardianRecord = {
          ...guardianData,
          id: `g_${Date.now()}`,
          studentId,
          studentLinked: studentFullName,
        };
        return {
          ...s,
          guardians: [...s.guardians, newG],
        };
      }
      return s;
    }),
  })),

  addTimelineEvent: (studentId, eventData) => set((state) => ({
    students: state.students.map((s) => {
      if (s.id === studentId) {
        const ev: TimelineEvent = {
          ...eventData,
          id: `t_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        return {
          ...s,
          timeline: [ev, ...s.timeline],
        };
      }
      return s;
    }),
  })),
}));
