import { Student, TenantSchema } from '@schools/domain';

export interface IStudentRepository {
  findById(id: string, tenantId: TenantSchema): Promise<Student | null>;
  findByStudentNumber(studentNumber: string, tenantId: TenantSchema): Promise<Student | null>;
  findAll(tenantId: TenantSchema): Promise<Student[]>;
  save(student: Student): Promise<Student>;
  delete(id: string, tenantId: TenantSchema): Promise<boolean>;
  findByGuardianId(guardianId: string, tenantId: TenantSchema): Promise<Student[]>;
}
