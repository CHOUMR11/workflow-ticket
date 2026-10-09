import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { UserService } from '../../core/services/user.service';
import { ChatRoom } from '../../core/models/chat.model';
import { User } from '../../core/models/task.model';
import { ChatRoomComponent } from './chat-room.component';
import { CallModalComponent } from './call-modal.component';

@Component({
  selector: 'app-chat-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatRoomComponent, CallModalComponent],
  templateUrl: './chat-room-list.component.html',
  styleUrls: ['./chat-room-list.component.css']
})
export class ChatRoomListComponent implements OnInit {
  rooms: ChatRoom[] = [];
  users: User[] = [];
  activeRoomId: string | null = null;

  showForm = false;
  draft = { name: '', memberIds: [] as string[] };

  showAddMember = false;
  memberToAdd = '';

  activeCall: 'video' | 'audio' | null = null;

  constructor(private chatService: ChatService, private userService: UserService) {}

  ngOnInit(): void {
    this.load();
    this.userService.getUsers().subscribe((users) => (this.users = users));
  }

  load(): void {
    this.chatService.getRooms().subscribe((rooms) => {
      this.rooms = rooms;
      if (!this.activeRoomId && rooms.length > 0) this.activeRoomId = rooms[0]._id;
    });
  }

  createRoom(): void {
    if (!this.draft.name) return;
    this.chatService.createRoom(this.draft.name, this.draft.memberIds).subscribe((room) => {
      this.draft = { name: '', memberIds: [] };
      this.showForm = false;
      this.rooms.push(room);
      this.activeRoomId = room._id;
    });
  }

  selectRoom(id: string): void {
    this.activeRoomId = id;
    this.showAddMember = false;
  }

  get availableToAdd(): User[] {
    const room = this.rooms.find((r) => r._id === this.activeRoomId);
    if (!room) return [];
    return this.users.filter((u) => !room.members.includes(u._id));
  }

  addMember(): void {
    if (!this.activeRoomId || !this.memberToAdd) return;
    this.chatService.addMember(this.activeRoomId, this.memberToAdd).subscribe((updatedRoom) => {
      const idx = this.rooms.findIndex((r) => r._id === updatedRoom._id);
      if (idx !== -1) this.rooms[idx] = updatedRoom;
      this.memberToAdd = '';
      this.showAddMember = false;
    });
  }

  startCall(mode: 'video' | 'audio'): void {
    this.activeCall = mode;
  }

  endCall(): void {
    this.activeCall = null;
  }
}
