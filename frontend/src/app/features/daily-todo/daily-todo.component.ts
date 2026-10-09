import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, TodoItem } from '../../core/services/ai.service';

// Two things in one widget: an auto-generated prioritized to-do list built
// from the user's real tasks/tickets/meetings, and a free-text box to ask
// the assistant anything else ("j'ai combien de tickets ouverts ?").
@Component({
  selector: 'app-daily-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-todo.component.html',
  styleUrls: ['./daily-todo.component.css']
})
export class DailyTodoComponent implements OnInit {
  items: TodoItem[] = [];
  loading = true;

  question = '';
  askingAssistant = false;
  assistantReply = '';

  constructor(private ai: AiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.ai.getDailyTodo().subscribe({
      next: (res) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  ask(): void {
    const q = this.question.trim();
    if (!q) return;
    this.askingAssistant = true;
    this.assistantReply = '';
    this.ai.askAssistant(q).subscribe({
      next: (res) => {
        this.assistantReply = res.reply;
        this.askingAssistant = false;
      },
      error: () => {
        this.assistantReply = "L'assistant n'a pas pu répondre, réessayez.";
        this.askingAssistant = false;
      }
    });
  }

  priorityClass(priority: string): string {
    return `priority-${priority}`;
  }
}
