import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attachment } from '../models/attachment.model';

const API = 'http://192.168.100.112:5000/api/attachments';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  constructor(private http: HttpClient) {}

  getAttachments(entityType: string, entityId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${API}?entityType=${entityType}&entityId=${entityId}`);
  }

  upload(entityType: string, entityId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    formData.append('file', file);
    return this.http.post<Attachment>(API, formData);
  }

  deleteAttachment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/${id}`);
  }
}
