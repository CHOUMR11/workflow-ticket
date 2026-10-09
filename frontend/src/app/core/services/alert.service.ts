import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertCenter } from '../models/alert.model';

const API = 'http://192.168.100.112:5000/api/alerts';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private http: HttpClient) {}

  getAlertCenter(): Observable<AlertCenter> {
    return this.http.get<AlertCenter>(`${API}/center`);
  }
}
