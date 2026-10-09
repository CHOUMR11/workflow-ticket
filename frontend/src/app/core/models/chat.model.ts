import { User } from './task.model';

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'general' | 'task' | 'meeting';
  members: string[];
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  room: string;
  sender: User;
  body: string;
  createdAt: string;
}
