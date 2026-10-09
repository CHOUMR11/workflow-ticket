import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatMessage } from '../../core/models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  @Input({ required: true }) roomId!: string;

  messages: ChatMessage[] = [];
  draft = '';
  private sub?: Subscription;

  constructor(private chatService: ChatService, public auth: AuthService) {}

  ngOnInit(): void {
    this.chatService.enterRoom(this.roomId);
    this.chatService.getHistory(this.roomId).subscribe((history) => (this.messages = history));
    this.sub = this.chatService.onMessage().subscribe((msg) => {
      if (msg.room === this.roomId) this.messages.push(msg);
    });
    this.chatService.onMessageDeleted().subscribe((deletedId) => {
      this.messages = this.messages.filter((m) => m._id !== deletedId);
    });
  }

  ngOnDestroy(): void {
    this.chatService.leaveRoom();
    this.sub?.unsubscribe();
  }

  send(): void {
    const body = this.draft.trim();
    if (!body) return;
    this.chatService.sendMessage(this.roomId, body).subscribe();
    this.draft = '';
  }

  remove(msg: ChatMessage): void {
    this.chatService.deleteMessage(msg._id).subscribe(() => {
      this.messages = this.messages.filter((m) => m._id !== msg._id);
    });
  }

  canDelete(msg: ChatMessage): boolean {
    return this.isMine(msg) || this.auth.hasRole('admin');
  }

  isMine(msg: ChatMessage): boolean {
    return msg.sender._id === this.auth.currentUser?._id;
  }
}
