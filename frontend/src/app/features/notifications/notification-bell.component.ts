import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {
  open = false;
  notifications$!: Observable<AppNotification[]>;
  unreadCount$!: Observable<number>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.init();
    this.notificationService.requestBrowserPermission();
    this.notifications$ = this.notificationService.getNotifications();
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  toggle(): void {
    this.open = !this.open;
  }

  markRead(notif: AppNotification): void {
    if (!notif.read) this.notificationService.markRead(notif._id);
  }
}
