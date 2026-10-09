import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/task.model';

const API = 'http://192.168.100.112:5000/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  updateUser(id: string, payload: Partial<User> & { isActive?: boolean }): Observable<User> {
    return this.http.patch<User>(`${API}/users/${id}`, payload);
  }
}
