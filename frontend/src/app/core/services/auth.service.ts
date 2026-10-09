import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/task.model';

const API = 'http://192.168.100.112:5000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: User | null = null;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('vw_user');
    if (stored) this.currentUser = JSON.parse(stored);
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('vw_token', res.token);
        localStorage.setItem('vw_user', JSON.stringify(res.user));
        this.currentUser = res.user;
      })
    );
  }

  // Admin-only: creating team accounts (no public signup in V1)
  register(payload: { name: string; email: string; password: string; role: string }): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${API}/auth/register`, payload);
  }

  logout(): void {
    localStorage.removeItem('vw_token');
    localStorage.removeItem('vw_user');
    this.currentUser = null;
  }

  getToken(): string | null {
    return localStorage.getItem('vw_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }
}
