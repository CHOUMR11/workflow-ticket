import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { TicketService } from '../../core/services/ticket.service';
import { AlertCenter } from '../../core/models/alert.model';

// One page for everything that needs attention: payments due/overdue,
// vouchers/billets issued 48h+ ago with no follow-up, and overdue tasks/todos.
// Scope (own vs. org-wide) is decided server-side based on role.
@Component({
  selector: 'app-alert-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-center.component.html',
  styleUrls: ['./alert-center.component.css']
})
export class AlertCenterComponent implements OnInit {
  data?: AlertCenter;
  loading = true;
  extendingId: string | null = null;

  constructor(private alertService: AlertService, private ticketService: TicketService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.alertService.getAlertCenter().subscribe((data) => {
      this.data = data;
      this.loading = false;
    });
  }

  openTicket(ticketId: string): void {
    this.router.navigate(['/tickets'], { queryParams: { open: ticketId } });
  }

  extendVoucher(ticketId: string, hours: number): void {
    this.extendingId = ticketId;
    this.ticketService.extendVoucher(ticketId, hours).subscribe({
      next: () => {
        this.extendingId = null;
        this.load();
      },
      error: () => (this.extendingId = null)
    });
  }
}
