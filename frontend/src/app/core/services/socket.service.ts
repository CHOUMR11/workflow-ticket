import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

const SOCKET_URL = 'http://192.168.100.112:5000';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.socket?.connected || !this.auth.currentUser) return;
    this.socket = io(SOCKET_URL);
    this.socket.on('connect', () => {
      // Join this user's personal room so notify() reaches every open tab
      this.socket?.emit('join', this.auth.currentUser!._id);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  on<T>(event: string, handler: (payload: T) => void): void {
    this.socket?.on(event, handler);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  emit(event: string, payload: unknown): void {
    this.socket?.emit(event, payload);
  }
}
