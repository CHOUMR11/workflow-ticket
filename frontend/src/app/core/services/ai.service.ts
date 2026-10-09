import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://192.168.100.112:5000/api/ai';

export interface ParsedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
}

export interface AssigneeSuggestion {
  userId: string;
  reason: string;
}

export interface TodoItem {
  title: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  entityType: 'task' | 'ticket' | 'meeting' | null;
  entityId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  // Natural language -> structured task fields, for the quick-add bar
  parseTask(text: string): Observable<ParsedTask> {
    return this.http.post<ParsedTask>(`${API}/parse-task`, { text });
  }

  suggestAssignee(description: string): Observable<AssigneeSuggestion> {
    return this.http.post<AssigneeSuggestion>(`${API}/suggest-assignee`, { description });
  }

  classifyTicket(subject: string, description: string): Observable<{ priority: string }> {
    return this.http.post<{ priority: string }>(`${API}/classify-ticket`, { subject, description });
  }

  summarizeTask(taskId: string, title: string): Observable<{ summary: string }> {
    return this.http.get<{ summary: string }>(`${API}/summarize-task/${taskId}?title=${encodeURIComponent(title)}`);
  }

  summarizeMeeting(meetingId: string): Observable<{ summary: string; actionItems: string[] }> {
    return this.http.post<{ summary: string; actionItems: string[] }>(`${API}/summarize-meeting/${meetingId}`, {});
  }

  // Free-form question answered from real DB data ("Qu'est-ce que je dois faire aujourd'hui ?")
  askAssistant(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${API}/assistant`, { message });
  }

  // Prioritized to-do list built from the user's actual open/overdue tasks, tickets, meetings
  getDailyTodo(): Observable<{ items: TodoItem[] }> {
    return this.http.get<{ items: TodoItem[] }>(`${API}/daily-todo`);
  }
}
