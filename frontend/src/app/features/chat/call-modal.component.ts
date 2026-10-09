import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Embeds a Jitsi Meet room scoped to this chat room's id — no signaling
// server or WebRTC code of our own to maintain. Voice-only mode just starts
// the call with the camera off; the user can still turn it on inside Jitsi.
@Component({
  selector: 'app-call-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.css']
})
export class CallModalComponent implements OnDestroy {
  @Input({ required: true }) roomId!: string;
  @Input() mode: 'video' | 'audio' = 'video';
  @Output() closed = new EventEmitter<void>();

  callUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.callUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnChanges(): void {
    this.buildUrl();
  }

  ngOnInit(): void {
    this.buildUrl();
  }

  private buildUrl(): void {
    const jitsiRoom = `vibes-workflow-${this.roomId}`;
    const params = new URLSearchParams({
      'config.startWithVideoMuted': String(this.mode === 'audio'),
      'config.prejoinPageEnabled': 'false'
    });
    const raw = `https://meet.jit.si/${jitsiRoom}#${params.toString()}`;
    this.callUrl = this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  }

  close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {}
}
