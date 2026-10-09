import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { SocketService } from './socket.service';

const API = 'http://192.168.100.112:5000/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<AppNotification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private socket: SocketService) {}

  // Call once after login, e.g. in the app shell / dashboard component
  init(): void {
    this.socket.connect();
    this.fetchHistory();

    // Live push: new notification arrives while the tab is open, no reload needed
    this.socket.on<AppNotification>('notification:new', (notif) => {
      const current = this.notifications$.value;
      this.notifications$.next([notif, ...current]);
      this.unreadCount$.next(this.unreadCount$.value + 1);
      this.showBrowserNotification(notif);
    });
  }

  fetchHistory(): void {
    this.http.get<AppNotification[]>(`${API}/notifications`).subscribe((list) => {
      this.notifications$.next(list);
      this.unreadCount$.next(list.filter((n) => !n.read).length);
    });
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  markRead(id: string): void {
    this.http.patch(`${API}/notifications/${id}/read`, {}).subscribe(() => {
      const updated = this.notifications$.value.map((n) => (n._id === id ? { ...n, read: true } : n));
      this.notifications$.next(updated);
      this.unreadCount$.next(updated.filter((n) => !n.read).length);
    });
  }

  // Native browser notification (permission requested once, e.g. on login).
  // Falls back silently if the user hasn't granted permission — the in-app
  // bell/toast list above is the guaranteed delivery path.
  private showBrowserNotification(notif: AppNotification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification('Vibes Workflow', { body: notif.message });
  }

  requestBrowserPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
