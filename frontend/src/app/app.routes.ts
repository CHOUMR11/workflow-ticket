import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { ShellComponent } from './layout/shell.component';
import { KanbanBoardComponent } from './features/kanban/kanban-board.component';
import { TicketListComponent } from './features/tickets/ticket-list.component';
import { MeetingListComponent } from './features/meetings/meeting-list.component';
import { ChatRoomListComponent } from './features/chat/chat-room-list.component';
import { UserManagementComponent } from './features/admin/user-management.component';
import { TeamStatsComponent } from './features/admin/team-stats.component';
import { TaskPrioritiesComponent } from './features/admin/task-priorities.component';
import { AlertCenterComponent } from './features/alerts/alert-center.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'board', pathMatch: 'full' },
      { path: 'board', component: KanbanBoardComponent },
      { path: 'tickets', component: TicketListComponent },
      { path: 'meetings', component: MeetingListComponent },
      { path: 'chat', component: ChatRoomListComponent },
      { path: 'alerts', component: AlertCenterComponent },
      { path: 'admin/users', component: UserManagementComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'admin/stats', component: TeamStatsComponent, canActivate: [roleGuard(['admin'])] },
      { path: 'admin/priorities', component: TaskPrioritiesComponent, canActivate: [roleGuard(['admin'])] }
    ]
  },
  { path: '**', redirectTo: '' }
];
