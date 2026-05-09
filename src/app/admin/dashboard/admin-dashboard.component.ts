import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/api.services';
import { DashboardStats, UpcomingFlight, BookingStatus } from '../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="admin-dash">
  <!-- Header -->
  <div class="dash-header">
    <div>
      <h1 class="dash-title">Dashboard</h1>
      <p class="dash-subtitle">Welcome back, Administrator</p>
    </div>
    <div class="dash-actions">
      <a routerLink="/admin/bookings" class="btn-outline">📋 All Bookings</a>
      <a routerLink="/admin/reports" class="btn-primary">📈 Reports</a>
    </div>
  </div>

  @if (stats()) {
    <!-- Stat Cards -->
    <div class="stat-grid">
      @for (card of statCards(); track card.label) {
        <div class="stat-card" [style.borderLeft]="'3px solid ' + card.accent">
          <div class="stat-icon" [style.background]="card.accent + '18'" [style.color]="card.accent">{{card.icon}}</div>
          <div class="stat-info">
            <span class="stat-value">{{card.value}}</span>
            <span class="stat-label">{{card.label}}</span>
          </div>
        </div>
      }
    </div>

    <!-- Booking Status Bar -->
    <div class="status-bar-card">
      <h3 class="section-title">Booking Status Overview</h3>
      <div class="status-bar-container">
        <div class="status-bar">
          @if (stats()!.confirmedBookings > 0) {
            <div class="bar-segment bar-confirmed"
              [style.width]="barPct(stats()!.confirmedBookings) + '%'"
              [title]="'Confirmed: ' + stats()!.confirmedBookings">
            </div>
          }
          @if (stats()!.pendingBookings > 0) {
            <div class="bar-segment bar-pending"
              [style.width]="barPct(stats()!.pendingBookings) + '%'"
              [title]="'Pending: ' + stats()!.pendingBookings">
            </div>
          }
          @if (stats()!.cancelledBookings > 0) {
            <div class="bar-segment bar-cancelled"
              [style.width]="barPct(stats()!.cancelledBookings) + '%'"
              [title]="'Cancelled: ' + stats()!.cancelledBookings">
            </div>
          }
        </div>
        <div class="bar-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span> Confirmed ({{stats()!.confirmedBookings}})</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span> Pending ({{stats()!.pendingBookings}})</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ef4444"></span> Cancelled ({{stats()!.cancelledBookings}})</span>
        </div>
      </div>
    </div>

    <!-- Pending B2B Alert -->
    @if (stats()!.pendingB2BApprovals > 0) {
      <div class="alert-card">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div>
            <p class="alert-title">{{stats()!.pendingB2BApprovals}} B2B account(s) pending approval</p>
            <p class="alert-sub">Review and approve agencies in the Users tab.</p>
          </div>
        </div>
        <a routerLink="/admin/users" class="btn-warning">Review →</a>
      </div>
    }
  }

  <!-- Upcoming Flights -->
  <div class="section-card">
    <div class="section-header">
      <h3 class="section-title">✈️ Upcoming Flights</h3>
      <a routerLink="/admin/bookings" [queryParams]="{type:'flight'}" class="link-muted">View all →</a>
    </div>
    @if (flights().length) {
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Departure</th>
              <th>Passenger</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (f of flights(); track f.bookingId) {
              <tr class="table-row-hover" [routerLink]="['/admin/bookings/flight', f.bookingId]" style="cursor:pointer">
                <td class="td-primary">{{f.route}}</td>
                <td>{{f.departureDate | date:'MMM d, y'}}</td>
                <td>{{f.passengers}}</td>
                <td>{{f.userName}}</td>
                <td class="td-money">\${{f.finalPrice | number:'1.2-2'}}</td>
                <td><span class="badge" [class]="'badge-' + statusClass(f.status)">{{statusLabel(f.status)}}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <p class="empty-msg">No upcoming flights found.</p>
    }
  </div>
</div>
  `,
  styles: [`
    .admin-dash { animation: fadeIn .4s ease; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

    .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:16px }
    .dash-title { font-size:1.75rem; font-weight:800; color:#f1f5f9; margin:0; letter-spacing:-0.02em }
    .dash-subtitle { color:#64748b; font-size:.9rem; margin:4px 0 0 }
    .dash-actions { display:flex; gap:10px; flex-wrap:wrap }

    .btn-primary { padding:10px 20px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:10px; font-size:.85rem; font-weight:600; cursor:pointer; text-decoration:none; transition:all .2s }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(99,102,241,.35) }
    .btn-outline { padding:10px 20px; background:transparent; color:#94a3b8; border:1px solid #334155; border-radius:10px; font-size:.85rem; font-weight:600; cursor:pointer; text-decoration:none; transition:all .2s }
    .btn-outline:hover { border-color:#6366f1; color:#a5b4fc }
    .btn-warning { padding:8px 18px; background:#f59e0b; color:#fff; border-radius:8px; text-decoration:none; font-size:.85rem; font-weight:600; white-space:nowrap; transition:all .2s }
    .btn-warning:hover { background:#d97706 }

    .stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; margin-bottom:24px }
    .stat-card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:20px; display:flex; align-items:center; gap:16px; transition:all .25s }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2) }
    .stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0 }
    .stat-info { display:flex; flex-direction:column }
    .stat-value { font-size:1.4rem; font-weight:700; color:#f1f5f9 }
    .stat-label { font-size:.78rem; color:#64748b; margin-top:2px }

    .status-bar-card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:24px; margin-bottom:24px }
    .status-bar-container { margin-top:16px }
    .status-bar { display:flex; height:12px; border-radius:8px; overflow:hidden; background:#0f172a }
    .bar-segment { transition:width .6s ease }
    .bar-confirmed { background:linear-gradient(90deg,#10b981,#34d399) }
    .bar-pending { background:linear-gradient(90deg,#f59e0b,#fbbf24) }
    .bar-cancelled { background:linear-gradient(90deg,#ef4444,#f87171) }
    .bar-legend { display:flex; gap:20px; margin-top:12px; flex-wrap:wrap }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:.8rem; color:#94a3b8 }
    .legend-dot { width:10px; height:10px; border-radius:50%; display:inline-block }

    .alert-card { background:linear-gradient(135deg,#422006,#451a03); border:1px solid #92400e; border-radius:14px; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap }
    .alert-content { display:flex; align-items:center; gap:12px }
    .alert-icon { font-size:1.5rem }
    .alert-title { color:#fbbf24; font-weight:600; margin:0; font-size:.95rem }
    .alert-sub { color:#d97706; font-size:.8rem; margin:4px 0 0 }

    .section-card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:24px; margin-bottom:24px }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px }
    .section-title { font-size:1.1rem; font-weight:700; color:#e2e8f0; margin:0 }
    .link-muted { color:#6366f1; font-size:.85rem; text-decoration:none; font-weight:500 }
    .link-muted:hover { color:#a5b4fc }

    .table-wrap { overflow-x:auto }
    .data-table { width:100%; border-collapse:collapse; font-size:.85rem }
    .data-table th { text-align:left; padding:12px 14px; color:#64748b; font-weight:500; border-bottom:1px solid #334155; white-space:nowrap }
    .data-table td { padding:12px 14px; color:#cbd5e1; border-bottom:1px solid #1e293b; white-space:nowrap }
    .table-row-hover:hover { background:#334155; transition:background .15s }
    .td-primary { color:#f1f5f9; font-weight:600 }
    .td-money { color:#10b981; font-weight:600 }

    .badge { padding:3px 10px; border-radius:999px; font-size:.72rem; font-weight:600; display:inline-block }
    .badge-confirmed { background:#14532d; color:#86efac }
    .badge-pending { background:#422006; color:#fbbf24 }
    .badge-cancelled { background:#450a0a; color:#fca5a5 }

    .empty-msg { color:#64748b; font-size:.9rem; text-align:center; padding:24px 0 }

    @media (max-width: 768px) {
      .stat-grid { grid-template-columns:repeat(2,1fr) }
      .dash-header { flex-direction:column; align-items:flex-start }
    }
    @media (max-width: 480px) {
      .stat-grid { grid-template-columns:1fr }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats   = signal<DashboardStats | null>(null);
  flights = signal<UpcomingFlight[]>([]);

  constructor(private adminSvc: AdminService) {}

  ngOnInit() {
    this.adminSvc.getDashboard().subscribe(s => this.stats.set(s));
    this.adminSvc.getUpcomingFlights().subscribe(f => this.flights.set(f));
  }

  statCards() {
    const s = this.stats()!;
    return [
      { icon: '💰', label: 'Total Revenue',     value: '$' + (s.totalRevenue || 0).toFixed(2),     accent: '#10b981' },
      { icon: '📈', label: 'Commissions',        value: '$' + (s.totalCommissions || 0).toFixed(2), accent: '#6366f1' },
      { icon: '💸', label: 'Refunds',            value: '$' + (s.totalRefunds || 0).toFixed(2),     accent: '#ef4444' },
      { icon: '👥', label: 'Total Users',        value: s.totalUsers,                               accent: '#3b82f6' },
      { icon: '✈️', label: 'Flight Bookings',    value: s.totalFlightBookings,                      accent: '#8b5cf6' },
      { icon: '🏨', label: 'Hotel Bookings',     value: s.totalHotelBookings,                       accent: '#f59e0b' },
      { icon: '🏢', label: 'B2B Agencies',       value: s.totalB2BUsers,                            accent: '#ec4899' },
      { icon: '⏳', label: 'Pending Approvals',  value: s.pendingB2BApprovals,                      accent: '#f97316' },
    ];
  }

  barPct(count: number): number {
    const s = this.stats()!;
    const total = s.confirmedBookings + s.pendingBookings + s.cancelledBookings;
    return total > 0 ? (count / total) * 100 : 0;
  }

  statusClass(s: BookingStatus): string {
    switch(s) { case 2: return 'confirmed'; case 1: return 'pending'; case 3: return 'cancelled'; default: return 'confirmed'; }
  }
  statusLabel(s: BookingStatus): string {
    switch(s) { case 1: return 'Pending'; case 2: return 'Confirmed'; case 3: return 'Cancelled'; case 4: return 'Completed'; default: return ''; }
  }
}
