import { PrismaClient } from '@prisma/client';
import { NavigationRepository } from './navigation.repository';
import { NavigationAuditService } from './navigation.audit.service';
import { NavigationService } from './navigation.service';
import { createNavigationRouter } from './navigation.controller';

export function createNavigationModule(prisma: PrismaClient) {
  const repository = new NavigationRepository(prisma);
  const auditService = new NavigationAuditService(prisma);
  const service = new NavigationService(repository, auditService);
  const router = createNavigationRouter(service);

  return {
    repository,
    auditService,
    service,
    router,
  };
}

export * from './navigation.types';
export * from './navigation.dto';
export * from './navigation.errors';
export * from './navigation.policy';
export * from './navigation.cache';
export * from './navigation.repository';
export * from './navigation.audit.service';
export * from './navigation.service';
export * from './navigation.controller';
