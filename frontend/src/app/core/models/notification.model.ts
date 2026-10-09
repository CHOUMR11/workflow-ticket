export interface AppNotification {
  _id: string;
  type: 'task_assigned' | 'task_due_soon' | 'ticket_assigned' | 'comment_added' | 'status_changed' | 'meeting_invite';
  message: string;
  entityType?: 'task' | 'ticket' | null;
  entityId?: string | null;
  read: boolean;
  createdAt: string;
}
