import { User } from './task.model';

export interface Attachment {
  _id: string;
  entityType: 'task' | 'ticket';
  entityId: string;
  uploader: User;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
