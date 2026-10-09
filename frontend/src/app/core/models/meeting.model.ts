import { User } from './task.model';

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  organizer: User;
  participants: User[];
  videoLink: string;
  chatRoom: string | null;
  status: 'scheduled' | 'cancelled' | 'done';
  aiSummary?: string;
  aiActionItems?: string[];
}
