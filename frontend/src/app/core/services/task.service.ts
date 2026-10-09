import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Board } from '../models/task.model';

const API = 'http://192.168.100.112:5000/api';

export interface TaskFilters {
  assignee?: string;
  status?: string;
  priority?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(`${API}/boards`);
  }

  getTasks(boardId?: string, filters: TaskFilters = {}): Observable<Task[]> {
    const params = new URLSearchParams();
    if (boardId) params.set('board', boardId);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return this.http.get<Task[]>(query ? `${API}/tasks?${query}` : `${API}/tasks`);
  }

  getTasksByAssignee(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${API}/tasks?assignee=${userId}`);
  }

  // Director/admin only — sets the order in which one employee should work through their tasks
  reorderTasks(updates: { id: string; priorityOrder: number }[]): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API}/tasks/reorder`, { updates });
  }

  createTask(payload: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${API}/tasks`, payload);
  }

  moveTask(taskId: string, columnKey: string): Observable<Task> {
    return this.http.patch<Task>(`${API}/tasks/${taskId}/move`, { columnKey });
  }

  updateTask(taskId: string, payload: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${API}/tasks/${taskId}`, payload);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${API}/tasks/${taskId}`);
  }
}
