import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

const API = 'http://192.168.100.112:5000/api';

export interface SyncReport {
  synced: string[];
  skipped: string[];
  errors: { block: string; error: string }[];
}

export interface TicketFilters {
  assignee?: string;
  priority?: string;
  partner?: string;
  q?: string;
}

export interface PaymentAlert {
  ticketId: string;
  ticketRef: string;
  subject: string;
  ticketStatus: string;
  partner: { _id: string; name: string; type: string } | null;
  assignee: { _id: string; name: string } | null;
  alertSentAt: string | null;
  kind: 'sale' | 'purchase';
  reference: string;
  amount: number | null;
  dueDate: string;
  status: 'unpaid' | 'partial' | 'paid';
  severity: 'overdue' | 'soon';
  daysLeft: number;
}

export interface PaymentAlertSummary {
  windowDays: number;
  total: number;
  overdue: number;
  dueSoon: number;
  totalAmount: number;
  alerts: PaymentAlert[];
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private http: HttpClient) {}

  getTickets(status?: string, page = 1, limit = 10, filters: TicketFilters = {}): Observable<PaginatedTickets> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return this.http.get<PaginatedTickets>(`${API}/tickets?${params.toString()}`);
  }

  createTicket(payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(`${API}/tickets`, payload);
  }

  updateTicket(id: string, payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.patch<Ticket>(`${API}/tickets/${id}`, payload);
  }

  // Self-assignment only — can never assign to anyone but the current user
  claimTicket(id: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${API}/tickets/${id}/claim`, {});
  }

  deleteTicket(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/tickets/${id}`);
  }

  // Admin only: pull the latest devis/invoices/partner data from the management system
  syncTicket(id: string): Observable<{ ticket: Ticket; report: SyncReport }> {
    return this.http.post<{ ticket: Ticket; report: SyncReport }>(`${API}/tickets/${id}/sync`, {});
  }

  // Admin-triggered manual check — scans invoices due soon/overdue and notifies admin+accounting
  checkPaymentAlerts(): Observable<PaymentAlertSummary & { checked: number; alertsSent: number }> {
    return this.http.post<PaymentAlertSummary & { checked: number; alertsSent: number }>(
      `${API}/tickets/check-payment-alerts`,
      {}
    );
  }

  // Invoices unpaid and overdue or due within the alert window
  getPaymentAlerts(): Observable<PaymentAlertSummary> {
    return this.http.get<PaymentAlertSummary>(`${API}/tickets/payment-alerts`);
  }

  issueVoucher(id: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${API}/tickets/${id}/voucher/issue`, {});
  }

  extendVoucher(id: string, hours: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${API}/tickets/${id}/voucher/extend`, { hours });
  }
}
