# Schools Systems ERP — Master Feature & Module Specifications

## 1. Monorepo Architecture & Workspace Topology (`@schools/*`)
The application is structured as an enterprise-grade monorepo enforcing strict boundary isolation, domain-driven entity ownership, and zero record duplication.
* **Workspace Packages**:
  * `@schools/core`: Application core engine, routing, and provider bootstrapping.
  * `@schools/domain`: Domain ownership contracts and cross-module reference rules.
  * `@schools/ui`: Reusable UI architecture (Carbon Design System v11 -> Primitives -> Patterns -> Dynamic UI -> Shells).
  * `@schools/module-sis`: Authoritative Student Information System module.
  * `@schools/module-academics`: Authoritative Academics & Curriculum module.
  * `@schools/module-finance`: Authoritative Finance & Billing module.
  * `@schools/module-hr`: Authoritative Human Resources & Faculty module.
  * `@schools/module-library`: Authoritative Library, Circulation & Campus Services module.
  * `@schools/module-admin`: Authoritative Administration, Security & Audit module.

---

## 2. Domain-Driven Entity Ownership & Strict ID Contracts
Following AGENTS.md §13:
* **Authoritative Ownership**: Each module owns specific institutional entities exclusively. No module duplicates records owned by another module.
* **Referencing vs Duplication**: Modules may reference external entities strictly via stable IDs and strict domain contracts (e.g., Finance and Library reference `Student` by ID owned by SIS; they never duplicate student profile tables).

---

## 3. Module Specifications by Domain

### 3.1. Student Information System (`@schools/module-sis`)
* **Authoritative Entities**: `Student`, `Guardian`, `Enrollment`, `AcademicPlacement`, `Transfer`, `Withdrawal`, `Graduation`, `StudentDocument`.
* **Key Features**:
  * **Student Directory & Search**: Carbon DataTable with real-time filtering, search, and status tags (`StatusBadge`).
  * **360 Student Profile**: Comprehensive view covering personal information, contact/address, guardians/emergency contacts, academic performance, and document vault.
  * **Document Vault**: Metadata tracking, file classification, verification workflow (`Verified`, `Pending`, `Rejected`, `Flagged`), and `DocumentInspectorModal`.
  * **Registration & Term Enrollment**: Multi-step registration wizard and term enrollment course selection with prerequisite validation.

### 3.2. Academics & Curriculum (`@schools/module-academics`)
* **Authoritative Entities**: `Course`, `Subject`, `Assessment`, `Attendance`, `TimetableSlot`, `ExamHallSchedule`.
* **Key Features**:
  * **Curriculum Management**: Course catalog, credit hours, prerequisites, and grade scale configurations.
  * **Attendance Tracking**: Biometric/manual attendance logging (Present, Late, Absent, Excused) and monthly rate analytics.
  * **Timetable Matrix**: Weekly class scheduling and room assignment matrix.

### 3.3. Finance & Billing (`@schools/module-finance`)
* **Authoritative Entities**: `Invoice`, `PaymentReceipt`, `InstallmentPlan`, `FeeStructure`.
* **Key Features**:
  * **Tuition Billing**: Fee structure assignment per grade level/program and automated invoice generation.
  * **Payment Processing**: Receipt logging, installment tracking, and outstanding balance alerts.
  * **Financial Ledger**: Student account statements referencing student IDs via strict domain contracts.

### 3.4. Human Resources & Faculty (`@schools/module-hr`)
* **Authoritative Entities**: `Staff`, `FacultyContract`, `LeaveQuota`.
* **Key Features**:
  * **Staff Directory**: Teacher and administrative staff profiles, departmental allocation, and employment status.
  * **Payroll & PII Protection**: Encrypted PII storage (`encryptPII`, `decryptPII`, `maskSensitivePII`) for salary and personal records.
  * **Leave Management**: Leave requests, quota tracking, and approval workflows.

### 3.5. Library & Campus Services (`@schools/module-library`)
* **Authoritative Entities**: `Book`, `BookCheckout`, `TransportRoute`, `HostelRoom`, `ClinicRecord`, `InventoryAsset`.
* **Key Features**:
  * **Library Circulation**: Catalog search, book checkouts, renewals, and overdue tracking referencing students by ID.
  * **Campus Services**: Transport fleet management, hostel room allocation, and school clinic health logs.

### 3.6. Administration & Security (`@schools/module-admin`)
* **Authoritative Entities**: `UserAccount`, `Role`, `AuditLog`, `SystemPolicy`.
* **Key Features**:
  * **IAM & RBAC Console**: Role assignment (`Admin`, `Registrar`, `Bursar`, `Teacher`, `Student`, `Guardian`), permission matrices, and security audit logs.
  * **System Configuration**: Term dates, campus definitions, and global parameter settings.

---

## 4. UI/UX & Design System Standards (`@schools/ui`)
* **Source of Truth**: IBM Carbon Design System v11 (`@carbon/react`).
* **Multi-Lingual Setup**: Full English (LTR) and Arabic (RTL) localization with dynamic translation dictionaries and automatic layout flipping.
* **Component Sizing & States**: Medium sizing as baseline; mandatory state handling (Default, Hover, Focus, Active, Disabled, Loading, Skeleton, Empty, Error, Success).
