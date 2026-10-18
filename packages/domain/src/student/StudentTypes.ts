/**
 * Student Domain Type Definitions and Enums
 */

export enum StudentStatus {
  APPLICANT = 'applicant',
  ADMITTED = 'admitted',
  ENROLLED = 'enrolled',
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface ArabicName {
  first: string;
  father: string;
  grandfather: string;
  family: string;
  tribalTitle?: string;
}

export interface EnglishName {
  first: string;
  father: string;
  grandfather: string;
  family: string;
}

/**
 * Sensitive Personally Identifiable Information (PII) field keys for Student records.
 */
export enum StudentPIIField {
  NATIONAL_ID = 'nationalId',
  DATE_OF_BIRTH = 'dateOfBirth',
  MEDICAL_CONDITIONS = 'medicalConditions'
}
