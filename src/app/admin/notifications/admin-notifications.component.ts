import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/api.services';
import { NotificationType } from '../../core/models/models';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <h1 style="font-size:1.5rem;font-weight:700;color:#e2e8f0;margin:0 0 8px">🔔 Send Notifications</h1>
  <p style="color:#64748b;margin:0 0 24px">Send custom notifications to users or groups.</p>

  @if (msg()) {
    <div [style.background]="sent()?'#14532d':'#450a0a'" [style.color]="sent()?'#86efac':'#fca5a5'"
      style="padding:12px 16px;border-radius:8px;margin-bottom:16px">{{msg()}}</div>
  }

  <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;max-width:520px">
    <div style="display:flex;flex-direction:column;gap:16px">
      <div>
        <label style="color:#94a3b8;font-size:.8rem;font-weight:500;display:block;margin-bottom:6px">Recipient</label>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <label style="display:flex;align-items:center;gap:6px;color:#e2e8f0;font-size:.875rem;cursor:pointer">
            <input type="radio" [(ngModel)]="mode" value="single"> Single User ID
          </label>
          <label style="display:flex;align-items:center;gap:6px;color:#e2e8f0;font-size:.875rem;cursor:pointer">
            <input type="radio" [(ngModel)]="mode" value="multiple"> Multiple IDs
          </label>
        </div>
        @if (mode === 'single') {
          <input type="number" [(ngModel)]="userId" placeholder="User ID e.g. 2"
            style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem;box-sizing:border-box">
        } @else {
          <input [(ngModel)]="userIdsStr" placeholder="Comma-separated IDs: 2,3,4"
            style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem;box-sizing:border-box">
        }
      </div>

      <div>
        <label style="color:#94a3b8;font-size:.8rem;font-weight:500;display:block;margin-bottom:6px">Title</label>
        <input [(ngModel)]="title" placeholder="Notification title…"
          style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem;box-sizing:border-box">
      </div>

      <div>
        <label style="color:#94a3b8;font-size:.8rem;font-weight:500;display:block;margin-bottom:6px">Message</label>
        <textarea [(ngModel)]="message" rows="3" placeholder="Notification message…"
          style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem;resize:vertical;box-sizing:border-box"></textarea>
      </div>

      <div>
        <label style="color:#94a3b8;font-size:.8rem;font-weight:500;display:block;margin-bottom:6px">Type</label>
        <select [(ngModel)]="type"
          style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem">
          <option [value]="1">✅ Success</option>
          <option [value]="2">ℹ️ Info</option>
          <option [value]="3">⚠️ Warning</option>
          <option [value]="4">❌ Error</option>
        </select>
      </div>

      <button (click)="send()" [disabled]="loading()"
        style="padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer"
        [style.opacity]="loading()?'0.7':'1'">
        {{loading() ? 'Sending…' : '📤 Send Notification'}}
      </button>
    </div>
  </div>
</div>
  `
})
export class AdminNotificationsComponent {
  mode       = 'single';
  userId     = 0;
  userIdsStr = '';
  title      = '';
  message    = '';
  type       = NotificationType.Info;
  loading    = signal(false);
  msg        = signal('');
  sent       = signal(false);

  constructor(private adminSvc: AdminService) {}

  send() {
    if (!this.title || !this.message) { this.msg.set('Title and message are required.'); this.sent.set(false); return; }
    this.loading.set(true);
    const dto: any = { title: this.title, message: this.message, type: Number(this.type) };
    if (this.mode === 'single') dto.userId = this.userId;
    else dto.userIds = this.userIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    this.adminSvc.sendNotification(dto).subscribe({
      next: r => { this.msg.set(r.message); this.sent.set(true); this.loading.set(false); this.title = ''; this.message = ''; },
      error: e => { this.msg.set(e.error?.message || 'Failed'); this.sent.set(false); this.loading.set(false); }
    });
  }
}
