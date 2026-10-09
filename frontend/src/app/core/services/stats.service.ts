import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminOverview, WorkloadEntry } from '../models/stats.model';

const API = 'http://192.168.100.112:5000/api/admin';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getOverview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>(`${API}/stats`);
  }

  getWorkload(): Observable<WorkloadEntry[]> {
    return this.http.get<WorkloadEntry[]>(`${API}/workload`);
  }
}
