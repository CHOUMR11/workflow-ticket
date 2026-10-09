import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SocketService } from '../core/services/socket.service';
import { NotificationBellComponent } from '../features/notifications/notification-bell.component';
import { AlertService } from '../core/services/alert.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, NotificationBellComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  alertCount = 0;

  constructor(
    public auth: AuthService,
    private socket: SocketService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.alertService.getAlertCenter().subscribe((data) => (this.alertCount = data.total));
  }

  logout(): void {
    this.socket.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
