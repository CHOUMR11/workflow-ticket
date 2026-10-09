import { User } from './task.model';

export interface Comment {
  _id: string;
  entityType: 'task' | 'ticket';
  entityId: string;
  author: User;
  body: string;
  visibility?: 'team' | 'internal';
  syncedAt?: string | null;
  createdAt: string;
}
