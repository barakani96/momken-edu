# Student Information System (SIS) — Document Vault Feature Specification

## 1. Executive Summary & Objective
The **Document Vault** is a core sub-system within `@schools/module-sis` designed to securely store, categorize, inspect, verify, and audit all official student records and administrative paperwork. It enforces zero-trust compliance, record immutability, and strict role-based access control (RBAC).

---

## 2. Core Capabilities & Architecture
* **Authoritative Ownership**: Owned exclusively by `@schools/module-sis`. Other modules reference student documents via immutable ID contracts.
* **Metadata-Driven Indexing**: Every document is tracked with structured metadata including document type, category, upload timestamp, file size, academic term/year, expiry date, verification status, and serial numbers.
* **Interactive Inspection Modal (`DocumentInspectorModal`)**: Provides high-fidelity previews for transcripts, certificates, ID cards (National ID / Iqama), and medical records with certified institutional stamps and verification action buttons.
* **Verification Workflow**: Supports four distinct verification states: `Verified`, `Pending`, `Rejected`, and `Flagged`.

---

## 3. Document Categories & Classifications
1. **Academic Transcripts (`academic_transcripts`)**: Term-by-term GPA, course credits, grade breakdowns, and cumulative transcripts.
2. **Certificates & Diplomas (`certificates`)**: Graduation diplomas, honor awards, and participation certificates.
3. **Identification Documents (`id_documents`)**: National ID cards, residency permits (Iqama), birth certificates, and passport copies.
4. **Medical & Immunization Records (`medical`)**: Vaccination history, chronic condition notices, and emergency medical consent forms.
5. **Disciplinary Records (`disciplinary`)**: Official conduct notes, commendations, or administrative warnings.
6. **Other Administrative Documents (`other`)**: Transport authorizations, hostel residency agreements, and special accommodation letters.

---

## 4. Metadata Schema & Zod Validation
Document metadata is strictly validated using Zod schemas (`StudentDocumentSchema`):

```ts
export interface StudentDocumentSchema {
  id: string;
  studentId: string;
  category: 'academic_transcripts' | 'certificates' | 'id_documents' | 'medical' | 'disciplinary' | 'other';
  documentType: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Flagged';
  serialNumber?: string;
  academicYear?: string;
  expiryDate?: string;
  summary?: string;
  verificationNotes?: string;
  downloadUrl?: string;
}
```

---

## 5. UI / UX Design & Carbon Design System Compliance
* **Design System**: Built entirely using IBM Carbon v11 React components (`DataTable`, `Modal`, `Tag`, `Tabs`, `Button`, `Tile`).
* **Multi-Lingual Support**: Full Arabic (RTL) and English (LTR) localization with dynamic translation keys (`sis.documents.*`).
* **Accessibility**: Full keyboard navigation, high contrast focus indicators, and screen-reader aria labels.
