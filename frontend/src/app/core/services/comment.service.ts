import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

const API = 'http://192.168.100.112:5000/api/comments';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getComments(entityType: string, entityId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API}?entityType=${entityType}&entityId=${entityId}`);
  }

  addComment(entityType: string, entityId: string, body: string, visibility: 'team' | 'internal' = 'team'): Observable<Comment> {
    return this.http.post<Comment>(API, { entityType, entityId, body, visibility });
  }

  deleteComment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/${id}`);
  }
}
