import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationHubService } from '../../core/services/notification-hub.service';
import { NotificationApiService } from '../../core/services/api.services';
import { UserType } from '../../core/models/models';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column">
  <nav style="background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <a routerLink="/dashboard" style="font-size:1.25rem;font-weight:700;color:#2563eb;text-decoration:none">✈️ TravelBook</a>
    <div style="display:flex;gap:4px">
      <a routerLink="/flights"  routerLinkActive="nav-active" style="padding:8px 14px;border-radius:8px;font-size:.875rem;font-weight:500;color:#475569;text-decoration:none">Flights</a>
      <a routerLink="/hotels"   routerLinkActive="nav-active" style="padding:8px 14px;border-radius:8px;font-size:.875rem;font-weight:500;color:#475569;text-decoration:none">Hotels</a>
      <a routerLink="/bookings" routerLinkActive="nav-active" style="padding:8px 14px;border-radius:8px;font-size:.875rem;font-weight:500;color:#475569;text-decoration:none">My Bookings</a>
      @if (isB2B && isApproved) {
        <a routerLink="/b2b/wallet"  style="padding:8px 14px;border-radius:8px;font-size:.875rem;font-weight:500;color:#7c3aed;text-decoration:none">💳 Wallet</a>
        <a routerLink="/b2b/reports" style="padding:8px 14px;border-radius:8px;font-size:.875rem;font-weight:500;color:#7c3aed;text-decoration:none">📊 Reports</a>
      }
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <a routerLink="/notifications" style="position:relative;padding:8px;border-radius:8px;text-decoration:none;font-size:1.25rem">
        🔔
        @if (hub.unreadCount() > 0) {
          <span style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:.6rem;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-weight:700">
            {{hub.unreadCount() > 9 ? '9+' : hub.unreadCount()}}
          </span>
        }
      </a>
      <span style="font-size:.875rem;font-weight:500;color:#374151">{{auth.currentUser()?.fullName}}</span>
      @if (isB2B) { <span style="font-size:.7rem;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:999px;font-weight:600">B2B</span> }
      <button (click)="logout()" style="padding:8px 16px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer">Logout</button>
    </div>
  </nav>

  @if (hub.latestNotification()) {
    <div style="position:fixed;top:76px;right:16px;z-index:100;max-width:340px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:16px;display:flex;gap:12px;animation:slideIn .3s ease">
      <span style="font-size:1.5rem">{{getIcon(hub.latestNotification()!.type)}}</span>
      <div style="flex:1">
        <p style="font-weight:600;font-size:.875rem;color:#1e293b;margin:0 0 4px">{{hub.latestNotification()!.title}}</p>
        <p style="font-size:.8rem;color:#64748b;margin:0">{{hub.latestNotification()!.message}}</p>
      </div>
      <button (click)="hub.latestNotification.set(null)" style="background:none;border:none;font-size:1.2rem;color:#94a3b8;cursor:pointer;line-height:1">×</button>
    </div>
  }

  <main style="flex:1;max-width:1200px;margin:0 auto;width:100%;padding:24px 16px">
    <router-outlet />
  </main>
</div>
  `
})
export class UserLayoutComponent implements OnInit {
  isB2B     = false;
  isApproved= false;

  constructor(
    public auth: AuthService,
    public hub: NotificationHubService,
    private notifApi: NotificationApiService
  ) {
    effect(() => {
      if (this.hub.latestNotification())
        setTimeout(() => this.hub.latestNotification.set(null), 5000);
    });
  }

  ngOnInit() {
    const user    = this.auth.currentUser();
    this.isB2B    = user?.userType === UserType.B2B;
    this.isApproved = user?.isApproved ?? false;
    if (user?.token) {
      this.notifApi.getUnreadCount().subscribe(r => this.hub.connect(user.token, r.count));
    }
  }

  logout() { this.hub.disconnect(); this.auth.logout(); }
  getIcon(type: number) { return type===1?'✅':type===3?'⚠️':type===4?'❌':'ℹ️'; }
}
