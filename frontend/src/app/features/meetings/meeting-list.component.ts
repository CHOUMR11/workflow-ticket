import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../core/services/meeting.service';
import { UserService } from '../../core/services/user.service';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/services/auth.service';
import { Meeting } from '../../core/models/meeting.model';
import { User } from '../../core/models/task.model';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit {
  meetings: Meeting[] = [];
  users: User[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  summarizingId: string | null = null;

  draft = { title: '', description: '', startTime: '', endTime: '', videoLink: '', participantIds: [] as string[] };

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private ai: AiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.userService.getUsers().subscribe((users) => (this.users = users));
  }

  load(): void {
    this.loading = true;
    this.meetingService.getMeetings().subscribe((meetings) => {
      this.meetings = meetings;
      this.loading = false;
    });
  }

  submit(): void {
    if (!this.draft.title || !this.draft.startTime || !this.draft.endTime) return;
    this.submitting = true;
    this.meetingService.createMeeting(this.draft).subscribe(() => {
      this.submitting = false;
      this.showForm = false;
      this.draft = { title: '', description: '', startTime: '', endTime: '', videoLink: '', participantIds: [] };
      this.load();
    });
  }

  summarize(meeting: Meeting): void {
    this.summarizingId = meeting._id;
    this.ai.summarizeMeeting(meeting._id).subscribe({
      next: (res) => {
        meeting.aiSummary = res.summary;
        meeting.aiActionItems = res.actionItems;
        this.summarizingId = null;
      },
      error: () => (this.summarizingId = null)
    });
  }

  remove(meeting: Meeting): void {
    if (!confirm(`Supprimer définitivement la réunion "${meeting.title}" ?`)) return;
    this.meetingService.deleteMeeting(meeting._id).subscribe(() => this.load());
  }
}
