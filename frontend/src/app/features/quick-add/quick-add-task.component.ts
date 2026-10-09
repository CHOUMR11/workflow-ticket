import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, ParsedTask } from '../../core/services/ai.service';
import { TaskService } from '../../core/services/task.service';

// One text field: the user types the request as they'd say it out loud
// ("renouveler passeport client Ben Ali, urgent, pour vendredi"), Claude
// turns it into title/description/priority/dueDate, and the task is created
// directly on the given board/column — no form to fill in for the common case.
@Component({
  selector: 'app-quick-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-add-task.component.html',
  styleUrls: ['./quick-add-task.component.css']
})
export class QuickAddTaskComponent {
  @Input({ required: true }) boardId!: string;
  @Input() defaultColumnKey = 'todo';
  @Output() created = new EventEmitter<void>();

  text = '';
  loading = false;
  error = '';

  constructor(private ai: AiService, private taskService: TaskService) {}

  submit(): void {
    const input = this.text.trim();
    if (!input) return;
    this.loading = true;
    this.error = '';

    this.ai.parseTask(input).subscribe({
      next: (parsed: ParsedTask) => {
        this.taskService
          .createTask({
            title: parsed.title,
            description: parsed.description,
            board: this.boardId,
            columnKey: this.defaultColumnKey,
            priority: parsed.priority,
            dueDate: parsed.dueDate
          })
          .subscribe({
            next: () => {
              this.text = '';
              this.loading = false;
              this.created.emit();
            },
            error: () => {
              this.loading = false;
              this.error = "La tâche n'a pas pu être créée.";
            }
          });
      },
      error: () => {
        this.loading = false;
        this.error = "L'IA n'a pas pu comprendre la demande, réessayez ou créez la tâche manuellement.";
      }
    });
  }
}
