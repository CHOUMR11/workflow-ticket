export type UserRole = 'admin' | 'agent' | 'accounting' | 'support';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  board: string;
  columnKey: string;
  priority: Priority;
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  assignee?: User | null;
  creator: User;
  dueDate?: string | null;
  createdAt: string;
  priorityOrder?: number;
  progress?: number;
  commentCount?: number;
  attachmentCount?: number;
}

export interface BoardColumn {
  _id: string;
  key: string;
  label: string;
  order: number;
}

export interface Board {
  _id: string;
  name: string;
  columns: BoardColumn[];
}
