import { Enrollment, TenantSchema } from '@schools/domain';

export interface IEnrollmentRepository {
  findById(id: string, tenantId: TenantSchema): Promise<Enrollment | null>;
  findByStudentId(studentId: string, tenantId: TenantSchema): Promise<Enrollment[]>;
  findByAcademicTerm(academicYear: string, term: string, tenantId: TenantSchema): Promise<Enrollment[]>;
  save(enrollment: Enrollment): Promise<Enrollment>;
  cancel(id: string, reason: string, tenantId: TenantSchema): Promise<boolean>;
}
