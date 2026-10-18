import { BaseAuditableEntity, PIIControlled, TenantSchema, CampusBranchId } from '../entities';
import { StudentStatus, Gender, ArabicName, EnglishName } from './StudentTypes';

/**
 * Domain Student Entity
 * Represents the complete student model with audit tracking and PII handling.
 */
export interface Student extends BaseAuditableEntity, PIIControlled {
  id: string;
  tenantId: TenantSchema;
  campusId: CampusBranchId;
  studentNumber: string; // e.g. TAZ-2026-0891
  nationalId: string; // Iqama / Civil ID (AES-256 encrypted at rest)
  nameAr: ArabicName;
  nameEn: EnglishName;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: string;
  medicalConditions?: string[];
  status: StudentStatus;
  gradeLevel: string;
  section: string;
  guardianId: string;
  gpa: number;
  enrolledDate: string;
}
