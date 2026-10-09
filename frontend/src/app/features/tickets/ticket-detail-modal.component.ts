import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, SyncReport } from '../../core/services/ticket.service';
import { CommentService } from '../../core/services/comment.service';
import { AttachmentService } from '../../core/services/attachment.service';
import { AuditService } from '../../core/services/audit.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PartnerService } from '../../core/services/partner.service';
import { Partner } from '../../core/models/partner.model';
import { Ticket, InvoiceInfo } from '../../core/models/ticket.model';
import { User } from '../../core/models/task.model';
import { Comment } from '../../core/models/comment.model';
import { Attachment } from '../../core/models/attachment.model';
import { AuditLog } from '../../core/models/audit.model';

// Same shape as the task detail modal: notes (comments), progress, attachments,
// audit history — tickets get the same depth of tracking as tasks now.
@Component({
  selector: 'app-ticket-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail-modal.component.html',
  styleUrls: ['./ticket-detail-modal.component.css']
})
export class TicketDetailModalComponent implements OnChanges {
  @Input({ required: true }) ticket!: Ticket;
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  users: User[] = [];
  partners: Partner[] = [];
  notes: Comment[] = [];
  attachments: Attachment[] = [];
  auditLog: AuditLog[] = [];

  draftNote = '';
  draftVisibility: 'team' | 'internal' = 'team';
  saving = false;
  syncing = false;
  syncMessage = '';

  constructor(
    private ticketService: TicketService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private auditService: AuditService,
    private userService: UserService,
    private partnerService: PartnerService,
    public auth: AuthService
  ) {}

  ngOnChanges(): void {
    if (!this.ticket) return;
    this.userService.getUsers().subscribe((u) => (this.users = u));
    this.partnerService.getPartners().subscribe((p) => (this.partners = p));
    this.loadNotes();
    this.loadAttachments();
    this.loadAudit();
  }

  loadNotes(): void {
    this.commentService.getComments('ticket', this.ticket._id).subscribe((c) => (this.notes = c));
  }

  loadAttachments(): void {
    this.attachmentService.getAttachments('ticket', this.ticket._id).subscribe((a) => (this.attachments = a));
  }

  loadAudit(): void {
    this.auditService.getTrail('ticket', this.ticket._id).subscribe((a) => (this.auditLog = a));
  }

  // The select's other-user options are disabled for non-admins (see
  // template), so the only value a non-admin can actually pick here is
  // themselves — route that through claim() so it hits the endpoint that
  // enforces self-only assignment server-side too. Admins go through the
  // normal field save, which can set any assignee (or clear it).
  onAssigneeChange(value: string): void {
    if (this.auth.hasRole('admin')) {
      this.save('assignee', value);
    } else if (value === this.auth.currentUser?._id) {
      this.claim();
    }
  }

  canClaim(): boolean {
    return this.ticket.assignee?._id !== this.auth.currentUser?._id;
  }

  claim(): void {
    this.ticketService.claimTicket(this.ticket._id).subscribe((updated) => {
      this.ticket = { ...this.ticket, ...updated };
      this.changed.emit();
      this.loadAudit();
    });
  }

  save(field: 'subject' | 'description' | 'priority' | 'status' | 'assignee' | 'progress' | 'partner', value: unknown): void {
    this.saving = true;
    this.ticketService.updateTicket(this.ticket._id, { [field]: value } as Partial<Ticket>).subscribe({
      next: (updated) => {
        this.ticket = { ...this.ticket, ...updated };
        this.saving = false;
        this.changed.emit();
      },
      error: () => (this.saving = false)
    });
  }

  // Nested commercial blocks: send only the changed key, the backend merges it
  // into the existing devis / saleInvoice / purchaseInvoice object.
  saveNested(block: 'devis' | 'saleInvoice' | 'purchaseInvoice', key: string, value: unknown): void {
    const normalized = value === '' ? null : value;
    this.saving = true;
    this.ticketService
      .updateTicket(this.ticket._id, { [block]: { [key]: normalized } } as Partial<Ticket>)
      .subscribe({
        next: (updated) => {
          this.ticket = { ...this.ticket, ...updated };
          this.saving = false;
          this.changed.emit();
          this.loadAudit();
        },
        error: () => (this.saving = false)
      });
  }

  // Visual payment alert: overdue / due within 3 days / fine (unpaid invoices only)
  paymentState(invoice?: InvoiceInfo): 'overdue' | 'soon' | null {
    if (!invoice?.dueDate || invoice.status === 'paid') return null;
    const due = new Date(invoice.dueDate).getTime();
    const now = Date.now();
    if (due < now) return 'overdue';
    if (due - now <= 3 * 24 * 60 * 60 * 1000) return 'soon';
    return null;
  }

  dateValue(iso?: string | null): string {
    return iso ? iso.slice(0, 10) : '';
  }

  savePartnerExternalId(value: string): void {
    const partnerId = this.ticket.partner?._id;
    if (!partnerId) return;
    this.partnerService.updatePartner(partnerId, { externalId: value || null }).subscribe(() => {
      this.partnerService.getPartners().subscribe((p) => (this.partners = p));
      this.ticket = { ...this.ticket, partner: { ...this.ticket.partner!, externalId: value || null } };
    });
  }

  syncNow(): void {
    this.syncing = true;
    this.syncMessage = '';
    this.ticketService.syncTicket(this.ticket._id).subscribe({
      next: ({ ticket, report }) => {
        this.ticket = { ...this.ticket, ...ticket };
        this.syncMessage = this.describeSync(report);
        this.syncing = false;
        this.changed.emit();
        this.loadAudit();
      },
      error: (err) => {
        this.syncMessage = err.error?.message || 'La synchronisation a échoué.';
        this.syncing = false;
      }
    });
  }

  private describeSync(report: SyncReport): string {
    const parts: string[] = [];
    if (report.synced.length) parts.push(`Synchronisé : ${report.synced.join(', ')}`);
    if (report.errors.length) parts.push(`Erreurs : ${report.errors.map((e) => `${e.block} (${e.error})`).join(' ; ')}`);
    if (!report.synced.length && !report.errors.length) parts.push('Aucun identifiant du système de gestion renseigné sur ce ticket.');
    return parts.join(' — ');
  }

  addNote(): void {
    const body = this.draftNote.trim();
    if (!body) return;
    this.commentService.addComment('ticket', this.ticket._id, body, this.draftVisibility).subscribe(() => {
      this.draftNote = '';
      this.loadNotes();
      this.loadAudit();
    });
  }

  deleteNote(noteId: string): void {
    this.commentService.deleteComment(noteId).subscribe(() => this.loadNotes());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.attachmentService.upload('ticket', this.ticket._id, file).subscribe(() => {
      this.loadAttachments();
      input.value = '';
    });
  }

  deleteAttachment(attachmentId: string): void {
    this.attachmentService.deleteAttachment(attachmentId).subscribe(() => this.loadAttachments());
  }

  canDeleteNote(note: Comment): boolean {
    return note.author?._id === this.auth.currentUser?._id || this.auth.hasRole('admin');
  }

  remove(): void {
    if (!confirm('Supprimer définitivement ce ticket ?')) return;
    this.ticketService.deleteTicket(this.ticket._id).subscribe(() => this.deleted.emit());
  }

  close(): void {
    this.closed.emit();
  }
}
