import { PrismaClient } from '@prisma/client';
import { PrincipalContext } from './navigation.policy';

export type NavigationAuditAction =
  | 'CREATE_MENU'
  | 'UPDATE_MENU'
  | 'DELETE_MENU'
  | 'CREATE_ITEM'
  | 'UPDATE_ITEM'
  | 'DELETE_ITEM'
  | 'REORDER_ITEMS';

export interface RecordAuditInput {
  action: NavigationAuditAction;
  entityId?: string | null;
  principal?: PrincipalContext | null;
  details?: any;
  ipAddress?: string | null;
}

export class NavigationAuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async logAction(input: RecordAuditInput): Promise<void> {
    try {
      const detailsStr =
        input.details !== undefined && input.details !== null
          ? typeof input.details === 'string'
            ? input.details
            : JSON.stringify(input.details)
          : null;

      await this.prisma.navigationAuditLog.create({
        data: {
          action: input.action,
          entityId: input.entityId || null,
          actorId: input.principal?.id || 'system',
          actorEmail: (input.principal as any)?.email || null,
          details: detailsStr,
          ipAddress: input.ipAddress || null,
        },
      });
    } catch (err) {
      console.error('Failed to write navigation audit log:', err);
      // Non-blocking fallback so audit failure does not crash core transactional mutations
    }
  }

  async getAuditLogs(limit = 100, offset = 0, action?: string): Promise<any[]> {
    const where: any = {};
    if (action) {
      where.action = action;
    }
    return this.prisma.navigationAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}
