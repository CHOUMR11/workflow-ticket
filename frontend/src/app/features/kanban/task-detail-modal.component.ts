import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { CommentService } from '../../core/services/comment.service';
import { AttachmentService } from '../../core/services/attachment.service';
import { AuditService } from '../../core/services/audit.service';
import { UserService } from '../../core/services/user.service';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, User } from '../../core/models/task.model';
import { Comment } from '../../core/models/comment.model';
import { Attachment } from '../../core/models/attachment.model';
import { AuditLog } from '../../core/models/audit.model';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-modal.component.html',
  styleUrls: ['./task-detail-modal.component.css']
})
export class TaskDetailModalComponent implements OnChanges {
  @Input({ required: true }) task!: Task;
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  users: User[] = [];
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  auditLog: AuditLog[] = [];

  draftComment = '';
  aiSummary = '';
  summarizing = false;
  saving = false;

  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private auditService: AuditService,
    private userService: UserService,
    private ai: AiService,
    public auth: AuthService
  ) {}

  ngOnChanges(): void {
    if (!this.task) return;
    this.userService.getUsers().subscribe((u) => (this.users = u));
    this.loadComments();
    this.loadAttachments();
    this.loadAudit();
    this.aiSummary = '';
  }

  loadComments(): void {
    this.commentService.getComments('task', this.task._id).subscribe((c) => (this.comments = c));
  }

  loadAttachments(): void {
    this.attachmentService.getAttachments('task', this.task._id).subscribe((a) => (this.attachments = a));
  }

  loadAudit(): void {
    this.auditService.getTrail('task', this.task._id).subscribe((a) => (this.auditLog = a));
  }

  save(field: 'title' | 'description' | 'priority' | 'status' | 'dueDate' | 'assignee' | 'progress', value: unknown): void {
    this.saving = true;
    this.taskService.updateTask(this.task._id, { [field]: value } as Partial<Task>).subscribe({
      next: (updated) => {
        this.task = { ...this.task, ...updated };
        this.saving = false;
        this.changed.emit();
      },
      error: () => (this.saving = false)
    });
  }

  addComment(): void {
    const body = this.draftComment.trim();
    if (!body) return;
    this.commentService.addComment('task', this.task._id, body).subscribe(() => {
      this.draftComment = '';
      this.loadComments();
      this.loadAudit();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.attachmentService.upload('task', this.task._id, file).subscribe(() => {
      this.loadAttachments();
      this.loadAudit();
      input.value = '';
    });
  }

  summarize(): void {
    this.summarizing = true;
    this.ai.summarizeTask(this.task._id, this.task.title).subscribe({
      next: (res) => {
        this.aiSummary = res.summary;
        this.summarizing = false;
      },
      error: () => (this.summarizing = false)
    });
  }

  remove(): void {
    if (!confirm('Supprimer définitivement cette tâche ?')) return;
    this.taskService.deleteTask(this.task._id).subscribe(() => this.deleted.emit());
  }

  close(): void {
    this.closed.emit();
  }
}
