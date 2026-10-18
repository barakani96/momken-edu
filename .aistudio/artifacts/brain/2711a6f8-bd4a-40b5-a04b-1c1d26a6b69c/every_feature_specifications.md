# Schools Systems ERP — Granular Feature Specifications (Every Feature)

This document provides granular technical and functional specifications for every feature implemented across the Schools Systems ERP monorepo workspace.

---

## 1. Student Information & Registry (SIS Core)
* **Objective**: Authoritative repository for student demographics, enrollment statuses, and lifecycle records.
* **Key Components**: `StudentDirectory.tsx`, `StudentDirectoryView.tsx`, `sisStore.ts`.
* **Features**:
  * Real-time search across names, student numbers, and national IDs.
  * Filtering by grade level, campus, and lifecycle status (`active`, `enrolled`, `admitted`, `applicant`, `graduated`, `withdrawn`, `suspended`).
  * Reusable `StatusBadge` component reflecting enrollment state.

## 2. Student 360 Profile
* **Objective**: Comprehensive single-page view of a student's complete institutional record.
* **Key Components**: `StudentProfile.tsx`, `StudentProfileView.tsx`.
* **Features**:
  * Tabbed interface: Personal Info, Contact & Address, Guardians & Emergency Contacts, Academic Performance, Document Vault.
  * Inline editing and lifecycle status management modals.

## 3. Document Vault & Verification Workflow
* **Objective**: Secure storage, classification, and verification of official student documents.
* **Key Components**: `StudentDocuments.tsx`, `DocumentsView.tsx`, `DocumentInspectorModal.tsx`.
* **Features**:
  * File classification into categories (transcripts, certificates, ID documents, medical, disciplinary, other).
  * Verification state machine (`Verified`, `Pending`, `Rejected`, `Flagged`).
  * High-fidelity inspector modal with certified institutional stamps.

## 4. Student Registration & Admissions Wizard
* **Objective**: Multi-step guided workflow for onboarding new student applicants.
* **Key Components**: `StudentRegistrationWizard.tsx`, `AdmissionsView.tsx`.
* **Features**:
  * Step 1: Personal & Demographic Data (Zod validation).
  * Step 2: Guardian & Emergency Contact Linkage.
  * Step 3: Campus & Program Placement.
  * Step 4: Initial Document Upload & Verification.

## 5. Term Enrollment & Course Selection
* **Objective**: Term-based course registration and prerequisite verification.
* **Key Components**: `TermEnrollmentWizard.tsx`, `EnrollmentView.tsx`.
* **Features**:
  * Credit hour load limit enforcement based on GPA thresholds.
  * Schedule conflict analysis and course selection validation.

## 6. Academic Performance & GPA Tracking
* **Objective**: Comprehensive tracking of coursework, final exams, term GPA, and cumulative GPA.
* **Key Components**: `AcademicRecords.tsx`, `AcademicsView.tsx`.
* **Features**:
  * Course-level score breakdown (Coursework + Final Exam = Total Score & Letter Grade).
  * Term-by-term GPA snapshot history.

## 7. Attendance & Biometric Logs
* **Objective**: Daily period-by-period attendance tracking and rate analytics.
* **Key Components**: `AttendanceView.tsx`.
* **Features**:
  * Status options: Present, Late, Absent, Excused.
  * Monthly attendance rate metrics and biometric gate check-in logs.

## 8. Timetable & Scheduling Matrix
* **Objective**: Weekly class scheduling and room allocation.
* **Key Components**: `TimetableView.tsx`.
* **Features**:
  * Period grid matrix matching course sections to classrooms and instructors.

## 9. Tuition Billing & Financial Ledger
* **Objective**: Fee structures, invoicing, payment receipts, and financial statements.
* **Key Components**: `FinanceView.tsx`.
* **Features**:
  * Automated tuition calculation based on grade level and program.
  * Payment receipt logging and outstanding balance alerts.

## 10. HR Faculty Management & PII Encryption
* **Objective**: Staff directory, contracts, leave quotas, and secure PII handling.
* **Key Components**: `HrView.tsx`.
* **Features**:
  * PII encryption functions (`encryptPII`, `decryptPII`, `maskSensitivePII`) for sensitive staff data.
  * Departmental allocation and leave approval workflows.

## 11. Library Circulation & Book Checkouts
* **Objective**: Catalog search, book checkouts, renewals, and overdue tracking.
* **Key Components**: `LibraryView.tsx`.
* **Features**:
  * Student ID contract linking for book loans and returns.

## 12. Campus Services (Transport, Hostel, Clinic, Inventory)
* **Objective**: Specialized campus operations support.
* **Key Components**: `TransportView.tsx`, `HostelView.tsx`, `ClinicView.tsx`, `InventoryView.tsx`.
* **Features**:
  * Fleet route assignments, dorm room allocations, clinic health logs, and asset tagging.

## 13. IAM, RBAC & Security Audit Console
* **Objective**: Role assignment, permission matrices, and security audit logs.
* **Key Components**: `AdminConsoleView.tsx`.
* **Features**:
  * Role-based access control (`Admin`, `Registrar`, `Bursar`, `Teacher`, `Student`, `Guardian`).

## 14. Multi-Lingual (English & Arabic RTL) Support
* **Objective**: Seamless bilingual user experience with right-to-left layout adaptation.
* **Key Components**: `src/i18n/`, `LanguageProvider.tsx`.
* **Features**:
  * Dynamic translation dictionaries (`en.json`, `ar.json`) covering all UI elements.

## 15. Carbon Design System UI/UX Standards
* **Objective**: Consistent, accessible design implementation using IBM Carbon v11.
* **Key Components**: `@carbon/react`, `@schools/ui`.
* **Features**:
  * Strict adherence to Carbon tokens, grid, layout, typography, and component states.
