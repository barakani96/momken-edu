import { create } from 'zustand';
import {
  StudentRecord,
  GuardianRecord,
  EnrollmentRecord,
  AcademicPlacementRecord,
  TransferRecord,
  WithdrawalRecord,
  GraduationRecord,
  StudentDocument,
  TimelineEvent,
  StudentStatus,
  DocumentVerificationStatus,
  DocumentCategory,
  DocumentType,
  AcademicCourseRecord,
  StudentAttendanceRecord,
  resolveDocumentCategory,
} from './sisTypes';
import { INITIAL_STUDENTS } from './sisData';

export interface DuplicateMatch {
  existingStudent: StudentRecord;
  matchScore: number; // percentage
  matchFields: string[]; // e.g. ['nationalId', 'lastName', 'dateOfBirth']
}

export interface SisState {
  students: StudentRecord[];
  activeStudentId: string | null;
  selectedStudentIds: string[];
  activeTab: string; // 'dashboard' | 'directory' | 'profile' | 'registration' | 'guardians' | 'lifecycle' | 'enrollment' | 'placement' | 'transfers' | 'withdrawal' | 'graduation' | 'documents' | 'history' | 'timeline' | 'import-export' | 'reports';
  
  // Filtering & Saved Views
  searchQuery: string;
  statusFilter: string;
  gradeFilter: string;
  campusFilter: string;
  programFilter: string;
  savedViews: Array<{ id: string; name: string; filters: Record<string, string> }>;
  activeSavedViewId: string | null;

  // Actions
  setActiveStudentId: (id: string | null) => void;
  setSelectedStudentIds: (ids: string[]) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: { status?: string; grade?: string; campus?: string; program?: string }) => void;
  resetFilters: () => void;
  
  // Student Actions
  createStudent: (student: Partial<StudentRecord>) => StudentRecord;
  updateStudent: (id: string, changes: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  
  // Duplicate Detection & Merge
  checkDuplicates: (nationalId: string, firstName: string, lastName: string, dob: string) => DuplicateMatch[];
  mergeStudents: (primaryId: string, duplicateId: string) => void;

  // Guardian Actions
  addGuardian: (studentId: string, guardian: Omit<GuardianRecord, 'id' | 'studentId' | 'studentLinked'>) => void;
  updateGuardian: (studentId: string, guardianId: string, changes: Partial<GuardianRecord>) => void;
  deleteGuardian: (studentId: string, guardianId: string) => void;

  // Status Lifecycle Actions
  changeStudentStatus: (studentId: string, newStatus: StudentStatus, reason: string, effectiveDate: string, notes?: string, actor?: string) => void;

  // Enrollment Actions
  createEnrollment: (studentId: string, enrollment: Omit<EnrollmentRecord, 'id' | 'studentId' | 'studentName'>) => void;
  cancelEnrollment: (studentId: string, enrollmentId: string, reason: string) => void;

  // Placement Actions
  changePlacement: (studentId: string, placement: Omit<AcademicPlacementRecord, 'id' | 'studentId' | 'isCurrent'>) => void;

  // Transfer Actions
  initiateTransfer: (transfer: Omit<TransferRecord, 'id' | 'status'>) => void;
  updateTransferStatus: (studentId: string, transferId: string, status: TransferRecord['status'], notes?: string, reviewer?: string) => void;

  // Withdrawal Actions
  initiateWithdrawal: (withdrawal: Omit<WithdrawalRecord, 'id' | 'status'>) => void;
  updateWithdrawalStatus: (studentId: string, withdrawalId: string, status: WithdrawalRecord['status'], notes?: string, reviewer?: string) => void;

  // Graduation Actions
  updateGraduationReview: (studentId: string, status: GraduationRecord['eligibilityStatus'], notes?: string) => void;

  // Document Actions
  addDocument: (studentId: string, doc: Omit<StudentDocument, 'id' | 'studentId'>) => void;
  updateDocumentStatus: (studentId: string, docId: string, status: DocumentVerificationStatus, notes?: string) => void;
  updateDocumentCategory: (studentId: string, docId: string, category: DocumentCategory, documentType?: DocumentType) => void;
  deleteDocument: (studentId: string, docId: string) => void;

  // Academic & Attendance 360 Actions
  addAcademicRecord: (studentId: string, record: Omit<AcademicCourseRecord, 'id'>) => void;
  addAttendanceRecord: (studentId: string, record: Omit<StudentAttendanceRecord, 'id'>) => void;

  // Timeline Action
  addTimelineEvent: (studentId: string, event: Omit<TimelineEvent, 'id' | 'studentId' | 'timestamp'>) => void;

  // Bulk Operations
  bulkStatusChange: (studentIds: string[], newStatus: StudentStatus, reason: string) => void;
  bulkPlacementChange: (studentIds: string[], placement: Partial<AcademicPlacementRecord>) => void;
  bulkEnrollment: (studentIds: string[], academicYear: string, term: string) => void;

  // Import Action
  importStudents: (records: Partial<StudentRecord>[]) => number;
}

export const useSisStore = create<SisState>((set, get) => ({
  students: INITIAL_STUDENTS,
  activeStudentId: '1',
  selectedStudentIds: [],
  activeTab: 'dashboard',
  
  searchQuery: '',
  statusFilter: 'all',
  gradeFilter: 'all',
  campusFilter: 'all',
  programFilter: 'all',
  savedViews: [
    { id: 'v1', name: 'Active High Schoolers', filters: { status: 'active', grade: 'Grade 11' } },
    { id: 'v2', name: 'Pending Transfer Applicants', filters: { status: 'applicant' } },
  ],
  activeSavedViewId: null,

  setActiveStudentId: (id) => set({ activeStudentId: id }),
  setSelectedStudentIds: (ids) => set({ selectedStudentIds: ids }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set((state) => ({
    statusFilter: filters.status !== undefined ? filters.status : state.statusFilter,
    gradeFilter: filters.grade !== undefined ? filters.grade : state.gradeFilter,
    campusFilter: filters.campus !== undefined ? filters.campus : state.campusFilter,
    programFilter: filters.program !== undefined ? filters.program : state.programFilter,
  })),
  resetFilters: () => set({ searchQuery: '', statusFilter: 'all', gradeFilter: 'all', campusFilter: 'all', programFilter: 'all' }),

  createStudent: (studentData) => {
    const id = Date.now().toString();
    const studentNumber = `STU-${1000 + get().students.length + 1}`;
    const newStudent: StudentRecord = {
      id,
      studentNumber,
      firstName: studentData.firstName || 'New',
      lastName: studentData.lastName || 'Student',
      gender: studentData.gender || 'Male',
      dateOfBirth: studentData.dateOfBirth || '2008-01-01',
      nationalId: studentData.nationalId || `NAT-${Math.floor(100000 + Math.random() * 900000)}`,
      status: studentData.status || 'active',
      enrollmentStatus: studentData.enrollmentStatus || 'Enrolled',
      campus: studentData.campus || 'Main Riyadh Campus',
      program: studentData.program || 'General Academic Track',
      gradeLevel: studentData.gradeLevel || 'Grade 10',
      classSection: studentData.classSection || 'Sec-10A',
      cohort: studentData.cohort || '2027-Cohort',
      gpa: studentData.gpa || 3.5,
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
      attendanceRate: 98.0,
      contact: studentData.contact || { email: 'student@school.edu', phone: '+966 50 000 0000' },
      address: studentData.address || { street: 'Street Address', city: 'Riyadh', state: 'Central', postalCode: '12345', country: 'Saudi Arabia' },
      guardians: studentData.guardians || [],
      placements: studentData.placements || [],
      enrollments: studentData.enrollments || [],
      transfers: [],
      withdrawals: [],
      documents: studentData.documents || [],
      timeline: [
        {
          id: `t_${Date.now()}`,
          studentId: id,
          type: 'Student Created',
          title: 'Student Registered',
          description: `Registered student ${studentData.firstName} ${studentData.lastName} with ID ${studentNumber}`,
          actor: 'Admissions Officer',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    };

    set((state) => ({
      students: [newStudent, ...state.students],
      activeStudentId: id,
    }));

    return newStudent;
  },

  updateStudent: (id, changes) => {
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    }));
  },

  deleteStudent: (id) => {
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
      selectedStudentIds: state.selectedStudentIds.filter((sel) => sel !== id),
      activeStudentId: state.activeStudentId === id ? (state.students.find((s) => s.id !== id)?.id || null) : state.activeStudentId,
    }));
  },

  checkDuplicates: (nationalId, firstName, lastName, dob) => {
    const students = get().students;
    const matches: DuplicateMatch[] = [];

    students.forEach((s) => {
      let score = 0;
      const fields: string[] = [];

      if (nationalId && s.nationalId.toLowerCase().trim() === nationalId.toLowerCase().trim()) {
        score += 70;
        fields.push('National ID');
      }
      if (firstName && s.firstName.toLowerCase().trim() === firstName.toLowerCase().trim()) {
        score += 15;
        fields.push('First Name');
      }
      if (lastName && s.lastName.toLowerCase().trim() === lastName.toLowerCase().trim()) {
        score += 15;
        fields.push('Last Name');
      }
      if (dob && s.dateOfBirth === dob) {
        score += 20;
        fields.push('Date of Birth');
      }

      if (score >= 40) {
        matches.push({
          existingStudent: s,
          matchScore: Math.min(score, 100),
          matchFields: fields,
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  },

  mergeStudents: (primaryId, duplicateId) => {
    const state = get();
    const primary = state.students.find((s) => s.id === primaryId);
    const duplicate = state.students.find((s) => s.id === duplicateId);

    if (!primary || !duplicate) return;

    // Merge guardians, documents, timeline from duplicate to primary
    const mergedGuardians = [...primary.guardians, ...duplicate.guardians];
    const mergedDocuments = [...primary.documents, ...duplicate.documents];
    const mergedTimeline: TimelineEvent[] = [
      ...primary.timeline,
      ...duplicate.timeline,
      {
        id: `t_merge_${Date.now()}`,
        studentId: primaryId,
        type: 'Profile Updated',
        title: 'Duplicate Student Merged',
        description: `Merged duplicate student record (${duplicate.studentNumber}) into primary record.`,
        actor: 'Registrar System',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    ];

    set((prev) => ({
      students: prev.students
        .filter((s) => s.id !== duplicateId)
        .map((s) =>
          s.id === primaryId
            ? {
                ...s,
                guardians: mergedGuardians,
                documents: mergedDocuments,
                timeline: mergedTimeline,
              }
            : s
        ),
      activeStudentId: primaryId,
    }));
  },

  addGuardian: (studentId, guardianData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newGuardian: GuardianRecord = {
      ...guardianData,
      id: `g_${Date.now()}`,
      studentId,
      studentLinked: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
    };

    get().updateStudent(studentId, {
      guardians: [...student.guardians, newGuardian],
    });

    get().addTimelineEvent(studentId, {
      type: 'Guardian Added',
      title: 'New Guardian Linked',
      description: `Linked ${newGuardian.guardianName} (${newGuardian.relationship})`,
      actor: 'Registrar / Family Portal',
    });
  },

  updateGuardian: (studentId, guardianId, changes) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedGuardians = student.guardians.map((g) => (g.id === guardianId ? { ...g, ...changes } : g));
    get().updateStudent(studentId, { guardians: updatedGuardians });
  },

  deleteGuardian: (studentId, guardianId) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    get().updateStudent(studentId, {
      guardians: student.guardians.filter((g) => g.id !== guardianId),
    });
  },

  changeStudentStatus: (studentId, newStatus, reason, effectiveDate, notes, actor = 'School Administrator') => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    get().updateStudent(studentId, { status: newStatus });

    get().addTimelineEvent(studentId, {
      type: 'Status Changed',
      title: `Status Changed to ${newStatus.toUpperCase()}`,
      description: `Reason: ${reason}. Effective: ${effectiveDate}. ${notes || ''}`,
      actor,
    });
  },

  createEnrollment: (studentId, enrollmentData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newEnrollment: EnrollmentRecord = {
      ...enrollmentData,
      id: `e_${Date.now()}`,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
    };

    get().updateStudent(studentId, {
      enrollments: [newEnrollment, ...student.enrollments],
      enrollmentStatus: newEnrollment.status,
    });

    get().addTimelineEvent(studentId, {
      type: 'Enrollment Created',
      title: 'Term Enrollment Registered',
      description: `Enrolled in ${newEnrollment.term} (${newEnrollment.academicYear}) - ${newEnrollment.program}`,
      actor: 'Academic Registrar',
    });
  },

  cancelEnrollment: (studentId, enrollmentId, reason) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updated = student.enrollments.map((e) =>
      e.id === enrollmentId ? { ...e, status: 'Withdrawn' as const, notes: `Cancelled: ${reason}` } : e
    );

    get().updateStudent(studentId, { enrollments: updated });
  },

  changePlacement: (studentId, placementData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newPlacement: AcademicPlacementRecord = {
      ...placementData,
      id: `p_${Date.now()}`,
      studentId,
      isCurrent: true,
    };

    const updatedPlacements = student.placements.map((p) => ({ ...p, isCurrent: false }));

    get().updateStudent(studentId, {
      campus: newPlacement.campus,
      program: newPlacement.program,
      gradeLevel: newPlacement.gradeLevel,
      classSection: newPlacement.classSection,
      cohort: newPlacement.cohort,
      placements: [newPlacement, ...updatedPlacements],
    });

    get().addTimelineEvent(studentId, {
      type: 'Placement Changed',
      title: 'Academic Placement Updated',
      description: `Moved to ${newPlacement.campus} - ${newPlacement.gradeLevel} (${newPlacement.classSection})`,
      actor: 'Academic Coordinator',
    });
  },

  initiateTransfer: (transferData) => {
    const student = get().students.find((s) => s.id === transferData.studentId);
    if (!student) return;

    const newTransfer: TransferRecord = {
      ...transferData,
      id: `tr_${Date.now()}`,
      status: 'initiated',
    };

    get().updateStudent(student.id, {
      transfers: [newTransfer, ...student.transfers],
    });

    get().addTimelineEvent(student.id, {
      type: 'Transfer Initiated',
      title: 'Campus Transfer Initiated',
      description: `Transfer requested from ${newTransfer.sourceCampus} to ${newTransfer.destinationCampus}`,
      actor: transferData.requestedBy,
    });
  },

  updateTransferStatus: (studentId, transferId, status, notes, reviewer = 'Registrar Director') => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedTransfers = student.transfers.map((t) =>
      t.id === transferId
        ? {
            ...t,
            status,
            notes: notes || t.notes,
            reviewedBy: reviewer,
            approvalDate: status === 'approved' || status === 'completed' ? new Date().toISOString().split('T')[0] : t.approvalDate,
          }
        : t
    );

    get().updateStudent(studentId, { transfers: updatedTransfers });

    get().addTimelineEvent(studentId, {
      type: status === 'completed' ? 'Transfer Completed' : 'Status Changed',
      title: `Transfer Request ${status.toUpperCase()}`,
      description: notes || `Transfer status updated to ${status}`,
      actor: reviewer,
    });
  },

  initiateWithdrawal: (withdrawalData) => {
    const student = get().students.find((s) => s.id === withdrawalData.studentId);
    if (!student) return;

    const newWithdrawal: WithdrawalRecord = {
      ...withdrawalData,
      id: `w_${Date.now()}`,
      status: 'initiated',
    };

    get().updateStudent(student.id, {
      withdrawals: [newWithdrawal, ...student.withdrawals],
    });

    get().addTimelineEvent(student.id, {
      type: 'Withdrawal Initiated',
      title: 'Student Withdrawal Request Initiated',
      description: `Reason: ${newWithdrawal.reason}`,
      actor: withdrawalData.requestedBy,
    });
  },

  updateWithdrawalStatus: (studentId, withdrawalId, status, notes, reviewer = 'Dean of Student Affairs') => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedWithdrawals = student.withdrawals.map((w) =>
      w.id === withdrawalId
        ? {
            ...w,
            status,
            notes: notes || w.notes,
            reviewedBy: reviewer,
            approvalDate: status === 'approved' || status === 'completed' ? new Date().toISOString().split('T')[0] : w.approvalDate,
          }
        : w
    );

    const changes: Partial<StudentRecord> = { withdrawals: updatedWithdrawals };
    if (status === 'completed') {
      changes.status = 'withdrawn';
      changes.enrollmentStatus = 'Withdrawn';
    }

    get().updateStudent(studentId, changes);

    get().addTimelineEvent(studentId, {
      type: status === 'completed' ? 'Student Withdrawn' : 'Status Changed',
      title: `Withdrawal ${status.toUpperCase()}`,
      description: notes || `Withdrawal request status updated to ${status}`,
      actor: reviewer,
    });
  },

  updateGraduationReview: (studentId, status, notes) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student || !student.graduation) return;

    const updatedGraduation: GraduationRecord = {
      ...student.graduation,
      eligibilityStatus: status,
      approvalNotes: notes || student.graduation.approvalNotes,
      certificateIssued: status === 'graduated' ? true : student.graduation.certificateIssued,
    };

    const changes: Partial<StudentRecord> = { graduation: updatedGraduation };
    if (status === 'graduated') {
      changes.status = 'graduated';
    }

    get().updateStudent(studentId, changes);

    get().addTimelineEvent(studentId, {
      type: status === 'graduated' ? 'Student Graduated' : 'Graduation Approved',
      title: `Graduation Status Updated to ${status.toUpperCase()}`,
      description: notes || `Graduation clearance status set to ${status}`,
      actor: 'Graduation Review Board',
    });
  },

  addDocument: (studentId, docData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newDoc: StudentDocument = {
      ...docData,
      id: `doc_${Date.now()}`,
      studentId,
      category: docData.category || resolveDocumentCategory(docData),
      serialNumber: docData.serialNumber || `REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      academicYear: docData.academicYear || '2026-2027',
    };

    get().updateStudent(studentId, {
      documents: [newDoc, ...student.documents],
    });

    get().addTimelineEvent(studentId, {
      type: 'Document Uploaded',
      title: `Document Uploaded: ${newDoc.documentType}`,
      description: `${newDoc.fileName} (${newDoc.fileSize}) [${newDoc.category}]`,
      actor: newDoc.uploadedBy,
    });
  },

  updateDocumentStatus: (studentId, docId, status, notes) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedDocs = student.documents.map((d) =>
      d.id === docId ? { ...d, status, verificationNotes: notes || d.verificationNotes } : d
    );

    get().updateStudent(studentId, { documents: updatedDocs });

    get().addTimelineEvent(studentId, {
      type: 'Document Verified',
      title: `Document ${status.toUpperCase()}: ${student.documents.find((d) => d.id === docId)?.documentType}`,
      description: notes || `Status changed to ${status}`,
      actor: 'Compliance Auditor',
    });
  },

  updateDocumentCategory: (studentId, docId, category, documentType) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedDocs = student.documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            category,
            documentType: documentType || d.documentType,
          }
        : d
    );

    get().updateStudent(studentId, { documents: updatedDocs });
  },

  deleteDocument: (studentId, docId) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    get().updateStudent(studentId, {
      documents: student.documents.filter((d) => d.id !== docId),
    });
  },

  addAcademicRecord: (studentId, recordData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newRec: AcademicCourseRecord = {
      ...recordData,
      id: `ar_${Date.now()}`,
    };
    const existing = student.academicRecords || [];
    get().updateStudent(studentId, {
      academicRecords: [newRec, ...existing],
    });

    get().addTimelineEvent(studentId, {
      type: 'Academic Record Updated',
      title: `Course Grade Recorded: ${newRec.code}`,
      description: `${newRec.nameEn} — Total: ${newRec.totalScore}% (${newRec.grade})`,
      actor: newRec.instructor || 'Academic Registrar',
    });
  },

  addAttendanceRecord: (studentId, recordData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newAtt: StudentAttendanceRecord = {
      ...recordData,
      id: `att_${Date.now()}`,
    };
    const existing = student.attendanceRecords || [];
    const updatedList = [newAtt, ...existing];
    const presentOrExcused = updatedList.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Excused').length;
    const newRate = Number(((presentOrExcused / updatedList.length) * 100).toFixed(1));

    get().updateStudent(studentId, {
      attendanceRecords: updatedList,
      attendanceRate: newRate,
    });

    get().addTimelineEvent(studentId, {
      type: 'Attendance Logged',
      title: `Attendance Logged: ${newAtt.status} (${newAtt.subject})`,
      description: `Period ${newAtt.period} on ${newAtt.date} — ${newAtt.notes || 'Standard session log'}`,
      actor: 'Attendance Officer',
    });
  },

  addTimelineEvent: (studentId, eventData) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student) return;

    const newEvent: TimelineEvent = {
      ...eventData,
      id: `t_${Date.now()}`,
      studentId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    get().updateStudent(studentId, {
      timeline: [newEvent, ...student.timeline],
    });
  },

  bulkStatusChange: (studentIds, newStatus, reason) => {
    const state = get();
    studentIds.forEach((id) => {
      state.changeStudentStatus(id, newStatus, reason, new Date().toISOString().split('T')[0], 'Bulk status update');
    });
    set({ selectedStudentIds: [] });
  },

  bulkPlacementChange: (studentIds, placement) => {
    const state = get();
    studentIds.forEach((id) => {
      const student = state.students.find((s) => s.id === id);
      if (student) {
        state.changePlacement(id, {
          campus: placement.campus || student.campus,
          academicYear: placement.academicYear || '2026-2027',
          term: placement.term || 'Fall Semester',
          program: placement.program || student.program,
          gradeLevel: placement.gradeLevel || student.gradeLevel,
          classSection: placement.classSection || student.classSection,
          cohort: placement.cohort || student.cohort,
          startDate: new Date().toISOString().split('T')[0],
        });
      }
    });
    set({ selectedStudentIds: [] });
  },

  bulkEnrollment: (studentIds, academicYear, term) => {
    const state = get();
    studentIds.forEach((id) => {
      const student = state.students.find((s) => s.id === id);
      if (student) {
        state.createEnrollment(id, {
          enrollmentCode: `ENR-${academicYear.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
          academicYear,
          term,
          program: student.program,
          enrollmentType: 'continuing',
          status: 'Enrolled',
          creditHours: 16,
          enrollmentDate: new Date().toISOString().split('T')[0],
        });
      }
    });
    set({ selectedStudentIds: [] });
  },

  importStudents: (records) => {
    const state = get();
    let count = 0;
    records.forEach((rec) => {
      if (rec.firstName && rec.lastName) {
        state.createStudent(rec);
        count++;
      }
    });
    return count;
  },
}));
