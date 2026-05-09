import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationApiService } from '../../core/services/api.services';
import { NotificationHubService } from '../../core/services/notification-hub.service';
import { Notification, NotificationType } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 4px">Notifications</h1>
      <p style="color:#64748b;font-size:.875rem;margin:0">{{unreadCount()}} unread</p>
    </div>
    <div style="display:flex;gap:8px">
      <button (click)="toggleFilter()" style="padding:8px 16px;background:#f1f5f9;color:#374151;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer">
        {{onlyUnread() ? 'Show All' : 'Unread Only'}}
      </button>
      <button (click)="markAllRead()" style="padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer">Mark All Read</button>
    </div>
  </div>

  @if (notifications().length === 0) {
    <div style="text-align:center;padding:64px;color:#94a3b8">
      <div style="font-size:3rem;margin-bottom:12px">🔔</div>
      <p style="font-size:1rem;margin:0">{{onlyUnread() ? 'No unread notifications.' : 'No notifications yet.'}}</p>
    </div>
  } @else {
    <div style="display:flex;flex-direction:column;gap:8px">
      @for (n of notifications(); track n.id) {
        <div [style.background]="n.isRead ? '#f8fafc' : '#fff'"
          [style.border]="n.isRead ? '1px solid #f1f5f9' : '1px solid #bfdbfe'"
          style="border-radius:12px;padding:16px;display:flex;gap:14px;align-items:flex-start;cursor:pointer"
          (click)="handleClick(n)">
          <div [style.background]="iconBg(n.type)" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem">
            {{icon(n.type)}}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
              <p [style.font-weight]="n.isRead?'400':'700'" style="font-size:.9rem;color:#1e293b;margin:0">{{n.title}}</p>
              <span style="font-size:.75rem;color:#94a3b8;white-space:nowrap;margin-left:12px">{{n.createdAt | date:'short'}}</span>
            </div>
            <p style="font-size:.8rem;color:#64748b;margin:0">{{n.message}}</p>
            @if (n.flightBookingId || n.hotelBookingId) {
              <span style="font-size:.75rem;color:#2563eb;margin-top:4px;display:inline-block">View booking →</span>
            }
          </div>
          @if (!n.isRead) {
            <div style="width:8px;height:8px;background:#2563eb;border-radius:50%;flex-shrink:0;margin-top:6px"></div>
          }
          <button (click)="$event.stopPropagation(); delete(n.id)" style="background:none;border:none;color:#cbd5e1;cursor:pointer;font-size:1.1rem;padding:0 4px">×</button>
        </div>
      }
    </div>
  }
</div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  unreadCount   = signal(0);
  onlyUnread    = signal(false);

  constructor(
    private notifApi: NotificationApiService,
    private hub: NotificationHubService,
    private router: Router
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.notifApi.getAll(this.onlyUnread()).subscribe(r => {
      this.notifications.set(r.notifications);
      this.unreadCount.set(r.unreadCount);
      this.hub.unreadCount.set(r.unreadCount);
    });
  }

  toggleFilter() { this.onlyUnread.update(v => !v); this.load(); }

  markAllRead() {
    this.notifApi.markAllRead().subscribe(() => {
      this.hub.resetUnread();
      this.notifications.update(ns => ns.map(n => ({ ...n, isRead: true })));
      this.unreadCount.set(0);
    });
  }

  handleClick(n: Notification) {
    if (!n.isRead) {
      this.notifApi.markRead(n.id).subscribe(() => {
        this.notifications.update(ns => ns.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        this.hub.decrementUnread();
        this.unreadCount.update(c => Math.max(0, c - 1));
      });
    }
    // Deep-link to related booking
    if (n.flightBookingId) this.router.navigate(['/bookings'], { fragment: `flight-${n.flightBookingId}` });
    else if (n.hotelBookingId) this.router.navigate(['/bookings'], { fragment: `hotel-${n.hotelBookingId}` });
  }

  delete(id: number) {
    this.notifApi.delete(id).subscribe(() => {
      this.notifications.update(ns => ns.filter(n => n.id !== id));
    });
  }

  icon(type: NotificationType)   { return type===1?'✅':type===3?'⚠️':type===4?'❌':'ℹ️'; }
  iconBg(type: NotificationType) { return type===1?'#d1fae5':type===3?'#fef3c7':type===4?'#fee2e2':'#dbeafe'; }
}
