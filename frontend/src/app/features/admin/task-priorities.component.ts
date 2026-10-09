import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { Task, User } from '../../core/models/task.model';

// Lets the director/admin pick an employee and drag-reorder their open tasks
// into the sequence they should actually be worked in. Saved as priorityOrder
// on each task, which the employee's own Kanban board then sorts by.
@Component({
  selector: 'app-task-priorities',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './task-priorities.component.html',
  styleUrls: ['./task-priorities.component.css']
})
export class TaskPrioritiesComponent implements OnInit {
  users: User[] = [];
  selectedUserId = '';
  tasks: Task[] = [];
  loading = false;
  saving = false;

  constructor(private taskService: TaskService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users.filter((u) => u.role !== 'admin');
    });
  }

  onUserChange(): void {
    if (!this.selectedUserId) {
      this.tasks = [];
      return;
    }
    this.loading = true;
    this.taskService.getTasksByAssignee(this.selectedUserId).subscribe((tasks) => {
      this.tasks = tasks
        .filter((t) => t.status !== 'done')
        .sort((a, b) => (a.priorityOrder ?? 0) - (b.priorityOrder ?? 0));
      this.loading = false;
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    this.save();
  }

  save(): void {
    this.saving = true;
    const updates = this.tasks.map((t, index) => ({ id: t._id, priorityOrder: index }));
    this.taskService.reorderTasks(updates).subscribe({
      next: () => (this.saving = false),
      error: () => (this.saving = false)
    });
  }

  priorityClass(p: string): string {
    return `priority-${p}`;
  }
}
