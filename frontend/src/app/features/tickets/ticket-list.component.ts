import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { PaymentAlert, PaymentAlertSummary, TicketService } from '../../core/services/ticket.service';
import { UserService } from '../../core/services/user.service';
import { Ticket } from '../../core/models/ticket.model';
import { User } from '../../core/models/task.model';
import { TicketDetailModalComponent } from './ticket-detail-modal.component';
import { AuthService } from '../../core/services/auth.service';
import { PartnerService } from '../../core/services/partner.service';
import { Partner } from '../../core/models/partner.model';

type TicketStatus = Ticket['status'];

const STATUS_COLUMNS: { key: TicketStatus; label: string }[] = [
  { key: 'open', label: 'Ouvert' },
  { key: 'pending', label: 'En attente' },
  { key: 'resolved', label: 'Résolu' },
  { key: 'closed', label: 'Fermé' }
];

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente'
};

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TicketDetailModalComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  users: User[] = [];
  partners: Partner[] = [];
  loading = true;
  alertMessage = '';
  payments: PaymentAlertSummary | null = null;
  showPayments = false;
  checkingPayments = false;
  showForm = false;
  selectedTicket: Ticket | null = null;

  view: 'list' | 'kanban' = 'list';
  statusColumns = STATUS_COLUMNS;
  ticketsByStatus: Record<TicketStatus, Ticket[]> = { open: [], pending: [], resolved: [], closed: [] };

  filters = { q: '', status: '', priority: '', assignee: '', partner: '' };

  page = 1;
  pages = 1;
  total = 0;

  // New ticket draft — priority is left blank so the backend AI classifier picks it
  draft = { subject: '', description: '', assignee: '', partner: '' };
  submitting = false;

  constructor(
    private ticketService: TicketService,
    private userService: UserService,
    private partnerService: PartnerService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadPaymentAlerts();
    this.userService.getUsers().subscribe((users) => (this.users = users));
    this.partnerService.getPartners().subscribe((partners) => (this.partners = partners));
  }

  load(): void {
    this.loading = true;
    // The Kanban view needs every matching ticket at once, the table paginates.
    const limit = this.view === 'kanban' ? 200 : 10;
    const page = this.view === 'kanban' ? 1 : this.page;
    this.ticketService
      .getTickets(this.filters.status || undefined, page, limit, {
        q: this.filters.q,
        priority: this.filters.priority,
        assignee: this.filters.assignee,
        partner: this.filters.partner
      })
      .subscribe((res) => {
        this.tickets = res.data;
        this.total = res.total;
        this.pages = res.pages;
        this.groupByStatus();
        this.loading = false;
      });
  }

  private groupByStatus(): void {
    this.ticketsByStatus = { open: [], pending: [], resolved: [], closed: [] };
    this.tickets.forEach((t) => this.ticketsByStatus[t.status].push(t));
  }

  setView(view: 'list' | 'kanban'): void {
    if (this.view === view) return;
    this.view = view;
    this.page = 1;
    this.load();
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  resetFilters(): void {
    this.filters = { q: '', status: '', priority: '', assignee: '', partner: '' };
    this.applyFilters();
  }

  showOnlyMine(): void {
    this.filters.assignee = this.auth.currentUser?._id || '';
    this.applyFilters();
  }

  get hasActiveFilter(): boolean {
    return Object.values(this.filters).some((v) => !!v);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pages) return;
    this.page = page;
    this.load();
  }

  submit(): void {
    if (!this.draft.subject) return;
    this.submitting = true;
    this.ticketService
      .createTicket({
        subject: this.draft.subject,
        description: this.draft.description,
        assignee: (this.draft.assignee || undefined) as unknown as User,
        partner: (this.draft.partner || undefined) as unknown as Partner
      })
      .subscribe(() => {
        this.submitting = false;
        this.showForm = false;
        this.draft = { subject: '', description: '', assignee: '', partner: '' };
        this.page = 1;
        this.load();
      });
  }

  updateStatus(ticket: Ticket, status: TicketStatus): void {
    this.ticketService.updateTicket(ticket._id, { status }).subscribe(() => this.load());
  }

  // Kanban view: dropping a card in another column changes the ticket status
  drop(event: CdkDragDrop<Ticket[]>, status: TicketStatus): void {
    if (event.previousContainer === event.container) return;

    const ticket = event.previousContainer.data[event.previousIndex];
    const previousStatus = ticket.status;
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    ticket.status = status;

    this.ticketService.updateTicket(ticket._id, { status }).subscribe({
      error: () => {
        ticket.status = previousStatus;
        this.load();
      }
    });
  }

  connectedStatusIds(): string[] {
    return this.statusColumns.map((c) => `ticket-${c.key}`);
  }

  canEdit(ticket: Ticket): boolean {
    const me = this.auth.currentUser?._id;
    return this.auth.hasRole('admin') || ticket.assignee?._id === me || ticket.requester?._id === me;
  }

  // Self-assign only — never available for assigning to a colleague
  canClaim(ticket: Ticket): boolean {
    return ticket.assignee?._id !== this.auth.currentUser?._id;
  }

  claim(ticket: Ticket, event?: Event): void {
    event?.stopPropagation();
    this.ticketService.claimTicket(ticket._id).subscribe((updated) => {
      Object.assign(ticket, updated);
      if (this.selectedTicket?._id === ticket._id) this.selectedTicket = updated;
    });
  }

  loadPaymentAlerts(): void {
    this.ticketService.getPaymentAlerts().subscribe({
      next: (res) => (this.payments = res),
      error: () => (this.payments = null)
    });
  }

  runPaymentCheck(): void {
    this.checkingPayments = true;
    this.ticketService.checkPaymentAlerts().subscribe({
      next: (res) => {
        this.checkingPayments = false;
        this.payments = res;
        this.showPayments = true;
        this.alertMessage = res.alertsSent > 0
          ? `${res.alertsSent} notification(s) de paiement envoyée(s).`
          : 'Aucune nouvelle notification : toutes les échéances à risque ont déjà été signalées.';
      },
      error: () => {
        this.checkingPayments = false;
        this.alertMessage = 'Échec de la vérification.';
      }
    });
  }

  togglePayments(): void {
    this.showPayments = !this.showPayments;
    if (this.showPayments) this.loadPaymentAlerts();
  }

  openAlert(alert: PaymentAlert): void {
    const ticket = this.tickets.find((t) => t._id === alert.ticketId);
    if (ticket) {
      this.openTicket(ticket);
      return;
    }
    this.filters = { q: alert.ticketRef, status: '', priority: '', assignee: '', partner: '' };
    this.applyFilters();
  }

  alertLabel(alert: PaymentAlert): string {
    if (alert.severity === 'overdue') return `En retard de ${Math.abs(alert.daysLeft)} j`;
    return alert.daysLeft <= 0 ? "Échéance aujourd'hui" : `Dans ${alert.daysLeft} j`;
  }

  kindLabel(kind: 'sale' | 'purchase'): string {
    return kind === 'sale' ? 'Facture client' : 'Facture fournisseur';
  }

  // Row-level indicator: any unpaid invoice overdue or due within 3 days
  hasPaymentAlert(t: Ticket): boolean {
    const soon = Date.now() + 3 * 24 * 60 * 60 * 1000;
    return [t.saleInvoice, t.purchaseInvoice].some(
      (inv) => inv?.dueDate && inv.status !== 'paid' && new Date(inv.dueDate).getTime() <= soon
    );
  }

  invoiceState(t: Ticket): '' | 'overdue' | 'soon' {
    const invoices = [t.saleInvoice, t.purchaseInvoice].filter(
      (inv) => inv?.dueDate && inv.status !== 'paid'
    );
    if (invoices.some((inv) => new Date(inv!.dueDate!).getTime() < Date.now())) return 'overdue';
    return this.hasPaymentAlert(t) ? 'soon' : '';
  }

  // Total amount at stake on a ticket: sale invoice, else the quote
  ticketAmount(t: Ticket): number | null {
    return t.saleInvoice?.amount ?? t.devis?.amount ?? null;
  }

  openTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  closeTicket(): void {
    this.selectedTicket = null;
  }

  onTicketDeleted(): void {
    this.selectedTicket = null;
    this.load();
  }

  priorityClass(p: string): string {
    return `priority-${p}`;
  }

  priorityLabel(p: string): string {
    return PRIORITY_LABELS[p] || p;
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
