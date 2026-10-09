import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, Board, BoardColumn, User } from '../../core/models/task.model';
import { QuickAddTaskComponent } from '../quick-add/quick-add-task.component';
import { DailyTodoComponent } from '../daily-todo/daily-todo.component';
import { MyTodoComponent } from '../my-todo/my-todo.component';
import { TaskDetailModalComponent } from './task-detail-modal.component';

const STATUS_LABELS: Record<Task['status'], string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  blocked: 'Bloqué',
  done: 'Terminé'
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente'
};

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, QuickAddTaskComponent, DailyTodoComponent, MyTodoComponent, TaskDetailModalComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent implements OnInit {
  board?: Board;
  columns: BoardColumn[] = [];
  tasksByColumn: Record<string, Task[]> = {};
  users: User[] = [];
  loading = true;
  selectedTask: Task | null = null;

  filters = { q: '', assignee: '', priority: '' };

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => (this.users = users));
    this.taskService.getBoards().subscribe((boards) => {
      this.board = boards[0];
      this.columns = [...(this.board?.columns ?? [])].sort((a, b) => a.order - b.order);
      this.loadTasks();
    });
  }

  loadTasks(): void {
    if (!this.board) return;
    this.loading = true;
    this.taskService.getTasks(this.board._id, this.filters).subscribe((tasks) => {
      this.tasksByColumn = {};
      this.columns.forEach((col) => (this.tasksByColumn[col.key] = []));
      tasks.forEach((task) => {
        if (!this.tasksByColumn[task.columnKey]) this.tasksByColumn[task.columnKey] = [];
        this.tasksByColumn[task.columnKey].push(task);
      });
      this.loading = false;
    });
  }

  resetFilters(): void {
    this.filters = { q: '', assignee: '', priority: '' };
    this.loadTasks();
  }

  showOnlyMine(): void {
    this.filters.assignee = this.auth.currentUser?._id || '';
    this.loadTasks();
  }

  get hasActiveFilter(): boolean {
    return !!(this.filters.q || this.filters.assignee || this.filters.priority);
  }

  get totalTasks(): number {
    return Object.values(this.tasksByColumn).reduce((sum, tasks) => sum + tasks.length, 0);
  }

  openTask(task: Task): void {
    this.selectedTask = task;
  }

  closeTask(): void {
    this.selectedTask = null;
  }

  onTaskDeleted(): void {
    this.selectedTask = null;
    this.loadTasks();
  }

  connectedColumnIds(): string[] {
    return this.columns.map((c) => c.key);
  }

  drop(event: CdkDragDrop<Task[]>, targetColumnKey: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    // Optimistic move; roll back on failure
    const previousColumn = task.columnKey;
    task.columnKey = targetColumnKey;
    this.taskService.moveTask(task._id, targetColumnKey).subscribe({
      error: () => {
        task.columnKey = previousColumn;
        this.loadTasks();
      }
    });
  }

  priorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  priorityLabel(priority: string): string {
    return PRIORITY_LABELS[priority] || priority;
  }

  statusLabel(status: Task['status']): string {
    return STATUS_LABELS[status] || status;
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

  // 'overdue' past its due date, 'soon' within 3 days — only while unfinished
  dueState(task: Task): '' | 'soon' | 'overdue' {
    if (!task.dueDate || task.status === 'done') return '';
    const due = new Date(task.dueDate).getTime();
    if (due < Date.now()) return 'overdue';
    return due <= Date.now() + 3 * 24 * 60 * 60 * 1000 ? 'soon' : '';
  }

  columnProgress(columnKey: string): number {
    const tasks = this.tasksByColumn[columnKey] || [];
    if (tasks.length === 0) return 0;
    return Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length);
  }
}
