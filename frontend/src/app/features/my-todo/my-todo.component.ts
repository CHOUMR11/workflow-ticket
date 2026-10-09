import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../core/services/todo.service';
import { Todo } from '../../core/models/todo.model';

// Personal, manual to-do list — separate from the AI-generated daily
// priorities widget. Plain done/not-done checkboxes, nothing shared.
@Component({
  selector: 'app-my-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-todo.component.html',
  styleUrls: ['./my-todo.component.css']
})
export class MyTodoComponent implements OnInit {
  todos: Todo[] = [];
  loading = true;
  draft = '';
  draftDueDate = '';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
      this.loading = false;
    });
  }

  add(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.todoService.createTodo(text, this.draftDueDate || undefined).subscribe(() => {
      this.draft = '';
      this.draftDueDate = '';
      this.load();
    });
  }

  toggle(todo: Todo): void {
    todo.done = !todo.done; // optimistic
    this.todoService.toggleDone(todo._id, todo.done).subscribe({ error: () => this.load() });
  }

  remove(todo: Todo): void {
    this.todos = this.todos.filter((t) => t._id !== todo._id);
    this.todoService.deleteTodo(todo._id).subscribe({ error: () => this.load() });
  }

  isOverdue(todo: Todo): boolean {
    return !!todo.dueDate && !todo.done && new Date(todo.dueDate) < new Date();
  }
}
