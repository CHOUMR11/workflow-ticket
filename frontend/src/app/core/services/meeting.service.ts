import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';

const API = 'http://192.168.100.112:5000/api';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  constructor(private http: HttpClient) {}

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${API}/meetings`);
  }

  createMeeting(payload: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    participantIds: string[];
    videoLink?: string;
  }): Observable<Meeting> {
    return this.http.post<Meeting>(`${API}/meetings`, payload);
  }

  updateMeeting(id: string, payload: Partial<Meeting>): Observable<Meeting> {
    return this.http.patch<Meeting>(`${API}/meetings/${id}`, payload);
  }

  deleteMeeting(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/meetings/${id}`);
  }
}
