export interface Todo {
  _id: string;
  text: string;
  done: boolean;
  dueDate?: string | null;
  order: number;
  createdAt: string;
}
