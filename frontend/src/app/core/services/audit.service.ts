import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit.model';

const API = 'http://192.168.100.112:5000/api/audit';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  getTrail(entityType: string, entityId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${API}?entityType=${entityType}&entityId=${entityId}`);
  }
}
