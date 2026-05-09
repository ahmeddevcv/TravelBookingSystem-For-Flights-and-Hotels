import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<div class="admin-layout" [class.sidebar-open]="sidebarOpen()">
  <!-- Mobile Overlay -->
  @if (sidebarOpen()) {
    <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
  }

  <!-- Sidebar -->
  <aside class="sidebar" [class.open]="sidebarOpen()">
    <div class="sidebar-header">
      <div class="brand">
        <span class="brand-icon">⚙️</span>
        <span class="brand-text">Admin Portal</span>
      </div>
      <button class="close-btn" (click)="sidebarOpen.set(false)">✕</button>
    </div>

    <nav class="sidebar-nav">
      <a routerLink="/admin/dashboard"     routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">📊</span> Dashboard
      </a>
      <a routerLink="/admin/bookings"      routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">📋</span> Bookings
      </a>
      <a routerLink="/admin/reports"       routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">📈</span> Reports
      </a>

      <div class="nav-divider"></div>

      <a routerLink="/admin/users"         routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">👥</span> Users
      </a>
      <a routerLink="/admin/settings"      routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">⚙️</span> Settings
      </a>
      <a routerLink="/admin/notifications" routerLinkActive="nav-active" (click)="closeMobile()" class="nav-link">
        <span class="nav-icon">🔔</span> Notifications
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{auth.currentUser()?.fullName?.charAt(0) || 'A'}}</div>
        <div class="user-details">
          <p class="user-name">{{auth.currentUser()?.fullName}}</p>
          <p class="user-role">Administrator</p>
        </div>
      </div>
      <button (click)="auth.logout()" class="logout-btn">🚪 Logout</button>
    </div>
  </aside>

  <!-- Main -->
  <div class="main-area">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="hamburger" (click)="sidebarOpen.set(true)">
        <span></span><span></span><span></span>
      </button>
      <span class="mobile-brand">⚙️ Admin Portal</span>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>
  </div>
</div>
  `,
  styles: [`
    .admin-layout { min-height:100vh; background:#0f172a; display:flex; position:relative }

    /* ── Sidebar ────────────────────────────────────────────────── */
    .sidebar {
      width:260px; background:#1e293b; display:flex; flex-direction:column;
      flex-shrink:0; border-right:1px solid #334155; position:relative; z-index:100;
      transition:transform .3s ease;
    }
    .sidebar-header {
      padding:24px 20px 16px; display:flex; align-items:center; justify-content:space-between;
    }
    .brand { display:flex; align-items:center; gap:10px }
    .brand-icon { font-size:1.3rem }
    .brand-text { font-size:1.1rem; font-weight:700; color:#fff; letter-spacing:-0.02em }
    .close-btn {
      display:none; background:none; border:none; color:#64748b; font-size:1.2rem;
      cursor:pointer; padding:4px 8px; border-radius:6px;
    }
    .close-btn:hover { color:#e2e8f0; background:#334155 }

    .sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:8px 12px; flex:1 }
    .nav-link {
      padding:11px 14px; border-radius:10px; color:#94a3b8; text-decoration:none;
      font-size:.88rem; font-weight:500; display:flex; align-items:center; gap:10px;
      transition:all .2s;
    }
    .nav-link:hover { background:rgba(99,102,241,.08); color:#e2e8f0 }
    .nav-active { background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1)); color:#a5b4fc !important; font-weight:600 }
    .nav-icon { font-size:1rem; width:22px; text-align:center }
    .nav-divider { height:1px; background:#334155; margin:8px 4px }

    .sidebar-footer {
      border-top:1px solid #334155; padding:16px 16px 20px; display:flex; flex-direction:column; gap:12px;
    }
    .user-info { display:flex; align-items:center; gap:10px }
    .user-avatar {
      width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#8b5cf6);
      display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:.85rem; flex-shrink:0;
    }
    .user-details { overflow:hidden }
    .user-name { font-size:.82rem; color:#e2e8f0; font-weight:600; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .user-role { font-size:.72rem; color:#64748b; margin:1px 0 0 }
    .logout-btn {
      width:100%; padding:9px; background:#7f1d1d; color:#fca5a5; border:none; border-radius:8px;
      font-size:.82rem; font-weight:500; cursor:pointer; text-align:left; padding-left:14px; transition:all .2s;
    }
    .logout-btn:hover { background:#991b1b }

    /* ── Main Area ──────────────────────────────────────────────── */
    .main-area { flex:1; overflow:auto; display:flex; flex-direction:column; min-width:0 }
    .mobile-header {
      display:none; padding:14px 20px; background:#1e293b; border-bottom:1px solid #334155;
      align-items:center; gap:14px;
    }
    .mobile-brand { font-size:1rem; font-weight:700; color:#fff }
    .hamburger {
      width:32px; height:32px; background:none; border:1px solid #334155; border-radius:8px;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
      cursor:pointer; padding:0;
    }
    .hamburger span { width:16px; height:2px; background:#94a3b8; border-radius:2px; transition:all .2s }
    .hamburger:hover span { background:#e2e8f0 }
    .main-content { flex:1; overflow:auto; padding:32px }

    /* ── Overlay ────────────────────────────────────────────────── */
    .sidebar-overlay {
      display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(2px); z-index:90;
    }

    /* ── Responsive ─────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .sidebar {
        position:fixed; left:0; top:0; bottom:0; z-index:100;
        transform:translateX(-100%);
      }
      .sidebar.open { transform:translateX(0) }
      .close-btn { display:block }
      .mobile-header { display:flex }
      .sidebar-overlay { display:block }
      .main-content { padding:20px }
    }
    @media (max-width: 480px) {
      .main-content { padding:14px }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);

  constructor(public auth: AuthService) {}

  closeMobile() {
    if (window.innerWidth <= 900) {
      this.sidebarOpen.set(false);
    }
  }
}
