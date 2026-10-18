import { Guardian, TenantSchema } from '@schools/domain';

export interface IGuardianRepository {
  findById(id: string, tenantId: TenantSchema): Promise<Guardian | null>;
  findByNationalId(nationalId: string, tenantId: TenantSchema): Promise<Guardian | null>;
  findAll(tenantId: TenantSchema): Promise<Guardian[]>;
  save(guardian: Guardian): Promise<Guardian>;
  delete(id: string, tenantId: TenantSchema): Promise<boolean>;
}
