import { User } from './task.model';

export interface AuditLog {
  _id: string;
  entityType: string;
  entityId: string;
  actor: User;
  action: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}
