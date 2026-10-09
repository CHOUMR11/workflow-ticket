import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

const API = 'http://192.168.100.112:5000/api/todos';

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(API);
  }

  createTodo(text: string, dueDate?: string): Observable<Todo> {
    return this.http.post<Todo>(API, { text, dueDate });
  }

  toggleDone(id: string, done: boolean): Observable<Todo> {
    return this.http.patch<Todo>(`${API}/${id}`, { done });
  }

  updateText(id: string, text: string): Observable<Todo> {
    return this.http.patch<Todo>(`${API}/${id}`, { text });
  }

  deleteTodo(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/${id}`);
  }
}
