import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/task.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  submitting = false;
  error = '';

  draft = { name: '', email: '', password: '', role: 'agent' };

  constructor(private userService: UserService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.userService.getUsers().subscribe((users) => (this.users = users));
  }

  submit(): void {
    if (!this.draft.name || !this.draft.email || !this.draft.password) return;
    this.submitting = true;
    this.error = '';
    this.auth.register(this.draft).subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.draft = { name: '', email: '', password: '', role: 'agent' };
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la création';
      }
    });
  }

  toggleActive(user: User & { isActive?: boolean }): void {
    this.userService.updateUser(user._id, { isActive: !user.isActive }).subscribe(() => this.load());
  }
}
