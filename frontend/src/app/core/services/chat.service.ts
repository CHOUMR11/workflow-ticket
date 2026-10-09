import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ChatRoom, ChatMessage } from '../models/chat.model';
import { SocketService } from './socket.service';

const API = 'http://192.168.100.112:5000/api';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private currentRoomId: string | null = null;
  private incoming$ = new Subject<ChatMessage>();
  private deleted$ = new Subject<string>();

  constructor(private http: HttpClient, private socket: SocketService) {
    this.socket.on<ChatMessage>('chat:message', (msg) => this.incoming$.next(msg));
    this.socket.on<{ messageId: string }>('chat:message-deleted', (payload) => this.deleted$.next(payload.messageId));
  }

  getRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${API}/chat/rooms`);
  }

  createRoom(name: string, memberIds: string[]): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${API}/chat/rooms`, { name, memberIds });
  }

  getHistory(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${API}/chat/rooms/${roomId}/messages`);
  }

  // Leaves any previously joined room's socket channel before joining the new one
  enterRoom(roomId: string): void {
    if (this.currentRoomId) this.socket.emit('chat:leave', this.currentRoomId);
    this.currentRoomId = roomId;
    this.socket.emit('chat:join', roomId);
  }

  leaveRoom(): void {
    if (this.currentRoomId) this.socket.emit('chat:leave', this.currentRoomId);
    this.currentRoomId = null;
  }

  sendMessage(roomId: string, body: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${API}/chat/rooms/${roomId}/messages`, { body });
  }

  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API}/chat/messages/${id}`);
  }

  addMember(roomId: string, userId: string): Observable<ChatRoom> {
    return this.http.patch<ChatRoom>(`${API}/chat/rooms/${roomId}/members`, { userId });
  }

  onMessage(): Observable<ChatMessage> {
    return this.incoming$.asObservable();
  }

  onMessageDeleted(): Observable<string> {
    return this.deleted$.asObservable();
  }
}
