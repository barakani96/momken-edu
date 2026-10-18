# Schools Systems ERP — Faculty Instruction Portal Feature Specification

## 1. Executive Summary & Objective
The **Faculty Instruction Portal** is a dedicated educator workstation within Schools Systems ERP. It empowers teachers, professors, and instructors to manage their assigned teaching schedules, class rosters, digital gradebooks, daily attendance registers, and student communications securely and efficiently.

---

## 2. Core Capabilities & Architecture
* **Module Integration**: Integrates tightly with `@schools/module-hr` (staff authentication, employment contracts, and department allocation) and `@schools/module-academics` (course sections, timetables, and grade scales).
* **Role-Based Access Control (RBAC)**: Enforces permissions such as `faculty:read`, `faculty:write`, `grades:submit`, and `attendance:record`.
* **Data Isolation**: Instructors only view and modify records for courses and sections explicitly assigned to them in the academic term.

---

## 3. Key Functional Features

### 3.1. Assigned Class Roster & Student Directory
* **Feature Description**: Provides teachers with a unified list of all enrolled students across their teaching sections.
* **Capabilities**:
  * Quick search by student name or ID number.
  * View student summary cards including photo, attendance rate, and current term GPA.
  * Secure access to student 360 profiles and guardian contact details.

### 3.2. Digital Gradebook & Score Entry
* **Feature Description**: Allows instructors to record coursework, quizzes, midterms, and final exam scores.
* **Capabilities**:
  * Matrix-style score entry interface with real-time total percentage calculation.
  * Automated letter grade assignment based on institutional grading scales (A+, A, B+, B, C, D, F).
  * Formal grade submission workflow with registrar lock/approval mechanisms.

### 3.3. Daily & Period Attendance Register
* **Feature Description**: Streamlines attendance tracking for every class meeting.
* **Capabilities**:
  * One-click marking for `Present`, `Late`, `Absent`, or `Excused`.
  * Integration with biometric gate check-in logs for automated cross-verification.
  * Attendance remarks and automated notification triggers for unexcused absences.

### 3.4. Course Material Vault & Syllabus Management
* **Feature Description**: Repository for instructional resources.
* **Capabilities**:
  * Upload lecture slides, homework assignments, reading lists, and syllabus documents.
  * Set availability dates and download tracking.

### 3.5. Announcements & Direct Communications
* **Feature Description**: Messaging hub for connecting with students and parents.
* **Capabilities**:
  * Broadcast class announcements and deadline reminders.
  * Direct messaging threads with students or linked guardians.

---

## 4. Zod Validation & Data Contracts
All instructor submissions (grades, attendance, announcements) are strictly validated via Zod schemas before persisting to the reactive store or database.

```ts
export const zGradeSubmissionSchema = z.object({
  studentId: z.string().min(1),
  courseCode: z.string().min(1),
  term: z.string().min(1),
  courseworkScore: z.number().min(0).max(100),
  finalExamScore: z.number().min(0).max(100),
  instructorNotes: z.string().optional(),
});
```

---

## 5. UI / UX Design & Carbon Design System Standards
* **Design System**: Built using IBM Carbon v11 React components (`DataTable`, `Form`, `TextInput`, `NumberInput`, `Button`, `Tag`, `Tabs`, `Modal`).
* **Multi-Lingual Support**: Full Arabic (RTL) and English (LTR) localization.
* **Accessibility**: Mandatory keyboard navigation and screen-reader support.
