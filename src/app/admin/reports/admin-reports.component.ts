import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/api.services';
import { AdminReports } from '../../core/models/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="reports-page" style="animation:fadeIn .4s ease">
  <div class="page-header">
    <div>
      <h1 class="page-title">📈 Financial Reports</h1>
      <p class="page-sub">Revenue, commissions, and booking analytics</p>
    </div>
  </div>

  <!-- Date Filter Buttons -->
  <div class="date-filters">
    @for (f of dateFilters; track f.label) {
      <button (click)="setDateRange(f.key)" class="date-btn" [class.active]="activeFilter === f.key">
        {{f.label}}
      </button>
    }
  </div>

  @if (report()) {
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card card-revenue">
        <div class="summary-icon">💰</div>
        <div class="summary-info">
          <span class="summary-value">\${{report()!.totalRevenue | number:'1.2-2'}}</span>
          <span class="summary-label">Total Revenue</span>
        </div>
      </div>
      <div class="summary-card card-commission">
        <div class="summary-icon">📊</div>
        <div class="summary-info">
          <span class="summary-value">\${{report()!.totalCommissions | number:'1.2-2'}}</span>
          <span class="summary-label">Total Commissions</span>
        </div>
      </div>
      <div class="summary-card card-refund">
        <div class="summary-icon">💸</div>
        <div class="summary-info">
          <span class="summary-value">\${{report()!.totalRefunds | number:'1.2-2'}}</span>
          <span class="summary-label">Total Refunds</span>
        </div>
      </div>
      <div class="summary-card card-net">
        <div class="summary-icon">✨</div>
        <div class="summary-info">
          <span class="summary-value">\${{report()!.netIncome | number:'1.2-2'}}</span>
          <span class="summary-label">Net Income</span>
        </div>
      </div>
    </div>

    <div class="reports-grid">
      <!-- Revenue Breakdown -->
      <div class="report-card">
        <h3 class="card-title">Revenue Breakdown</h3>
        <div class="breakdown-bars">
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">✈️ Flights</span>
              <span class="bar-value">\${{report()!.flightRevenue | number:'1.2-2'}}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-flight" [style.width]="revPct(report()!.flightRevenue) + '%'"></div>
            </div>
          </div>
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">🏨 Hotels</span>
              <span class="bar-value">\${{report()!.hotelRevenue | number:'1.2-2'}}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-hotel" [style.width]="revPct(report()!.hotelRevenue) + '%'"></div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <h4 class="sub-title">Commission Breakdown</h4>
        <div class="breakdown-bars">
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">✈️ Flight Commissions</span>
              <span class="bar-value">\${{report()!.flightCommissions | number:'1.2-2'}}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-flight-com" [style.width]="comPct(report()!.flightCommissions) + '%'"></div>
            </div>
          </div>
          <div class="bar-item">
            <div class="bar-header">
              <span class="bar-label">🏨 Hotel Commissions</span>
              <span class="bar-value">\${{report()!.hotelCommissions | number:'1.2-2'}}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-hotel-com" [style.width]="comPct(report()!.hotelCommissions) + '%'"></div>
            </div>
          </div>
          @if (report()!.cancellationFees > 0) {
            <div class="bar-item">
              <div class="bar-header">
                <span class="bar-label">❌ Cancellation Fees</span>
                <span class="bar-value">\${{report()!.cancellationFees | number:'1.2-2'}}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-cancel" [style.width]="comPct(report()!.cancellationFees) + '%'"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Booking Stats -->
      <div class="report-card">
        <h3 class="card-title">Booking Statistics</h3>
        <div class="stat-ring-area">
          <div class="ring-center">
            <span class="ring-value">{{report()!.totalBookings}}</span>
            <span class="ring-label">Total</span>
          </div>
        </div>
        <div class="stat-items">
          <div class="stat-item">
            <span class="stat-dot" style="background:#10b981"></span>
            <span class="stat-item-label">Confirmed</span>
            <span class="stat-item-value">{{report()!.confirmedBookings}}</span>
          </div>
          <div class="stat-item">
            <span class="stat-dot" style="background:#f59e0b"></span>
            <span class="stat-item-label">Pending</span>
            <span class="stat-item-value">{{report()!.pendingBookings}}</span>
          </div>
          <div class="stat-item">
            <span class="stat-dot" style="background:#ef4444"></span>
            <span class="stat-item-label">Cancelled</span>
            <span class="stat-item-value">{{report()!.cancelledBookings}}</span>
          </div>
        </div>

        <!-- Status bar -->
        <div class="mini-bar-wrap">
          <div class="mini-bar">
            @if (report()!.confirmedBookings) {
              <div class="mini-seg" style="background:#10b981" [style.width]="bookPct(report()!.confirmedBookings) + '%'"></div>
            }
            @if (report()!.pendingBookings) {
              <div class="mini-seg" style="background:#f59e0b" [style.width]="bookPct(report()!.pendingBookings) + '%'"></div>
            }
            @if (report()!.cancelledBookings) {
              <div class="mini-seg" style="background:#ef4444" [style.width]="bookPct(report()!.cancelledBookings) + '%'"></div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trend Chart -->
    @if (report()!.monthlyTrend.length > 0) {
      <div class="report-card trend-card">
        <h3 class="card-title">Monthly Revenue Trend</h3>
        <div class="chart-area">
          @for (m of report()!.monthlyTrend; track m.month) {
            <div class="chart-col">
              <div class="chart-bars">
                <div class="chart-bar bar-rev" [style.height]="trendHeight(m.revenue) + 'px'" [title]="'Revenue: $' + m.revenue.toFixed(2)"></div>
                <div class="chart-bar bar-ref" [style.height]="trendHeight(m.refunds) + 'px'" [title]="'Refunds: $' + m.refunds.toFixed(2)"></div>
              </div>
              <span class="chart-label">{{m.month.substring(5)}}</span>
            </div>
          }
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#6366f1"></span> Revenue</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ef4444"></span> Refunds</span>
        </div>
      </div>
    }
  } @else {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>
  }
</div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes spin { to { transform:rotate(360deg) } }

    .page-header { margin-bottom:24px }
    .page-title { font-size:1.6rem; font-weight:800; color:#f1f5f9; margin:0; letter-spacing:-0.02em }
    .page-sub { color:#64748b; font-size:.85rem; margin:4px 0 0 }

    .date-filters { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap }
    .date-btn { padding:8px 18px; background:#1e293b; border:1px solid #334155; border-radius:10px; color:#94a3b8; font-size:.82rem; font-weight:500; cursor:pointer; transition:all .2s }
    .date-btn:hover { border-color:#6366f1; color:#a5b4fc }
    .date-btn.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-color:transparent; color:#fff; font-weight:600 }

    .summary-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; margin-bottom:24px }
    .summary-card { border-radius:14px; padding:24px; display:flex; align-items:center; gap:16px; border:1px solid transparent; transition:all .25s }
    .summary-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2) }
    .card-revenue { background:linear-gradient(135deg,#14532d,#166534); border-color:#22c55e30 }
    .card-commission { background:linear-gradient(135deg,#1e1b4b,#312e81); border-color:#6366f130 }
    .card-refund { background:linear-gradient(135deg,#450a0a,#7f1d1d); border-color:#ef444430 }
    .card-net { background:linear-gradient(135deg,#1e293b,#334155); border-color:#94a3b830 }
    .summary-icon { font-size:1.8rem }
    .summary-info { display:flex; flex-direction:column }
    .summary-value { font-size:1.5rem; font-weight:800; color:#fff }
    .summary-label { font-size:.78rem; color:rgba(255,255,255,.7); margin-top:2px }

    .reports-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-bottom:24px }
    .report-card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:24px }
    .card-title { font-size:1.05rem; font-weight:700; color:#e2e8f0; margin:0 0 20px; padding-bottom:12px; border-bottom:1px solid #334155 }
    .sub-title { font-size:.9rem; font-weight:600; color:#94a3b8; margin:16px 0 12px }
    .divider { height:1px; background:#334155; margin:16px 0 }

    .breakdown-bars { display:flex; flex-direction:column; gap:16px }
    .bar-item { display:flex; flex-direction:column; gap:6px }
    .bar-header { display:flex; justify-content:space-between; align-items:center }
    .bar-label { font-size:.82rem; color:#94a3b8 }
    .bar-value { font-size:.85rem; font-weight:600; color:#e2e8f0 }
    .bar-track { height:8px; background:#0f172a; border-radius:4px; overflow:hidden }
    .bar-fill { height:100%; border-radius:4px; transition:width .8s ease; min-width:2px }
    .bar-flight { background:linear-gradient(90deg,#6366f1,#8b5cf6) }
    .bar-hotel { background:linear-gradient(90deg,#f59e0b,#fbbf24) }
    .bar-flight-com { background:linear-gradient(90deg,#818cf8,#a78bfa) }
    .bar-hotel-com { background:linear-gradient(90deg,#fbbf24,#fcd34d) }
    .bar-cancel { background:linear-gradient(90deg,#ef4444,#f87171) }

    .stat-ring-area { display:flex; justify-content:center; margin-bottom:20px }
    .ring-center { width:100px; height:100px; border-radius:50%; background:#0f172a; border:3px solid #334155; display:flex; flex-direction:column; align-items:center; justify-content:center }
    .ring-value { font-size:1.8rem; font-weight:800; color:#f1f5f9 }
    .ring-label { font-size:.72rem; color:#64748b }

    .stat-items { display:flex; flex-direction:column; gap:12px; margin-bottom:16px }
    .stat-item { display:flex; align-items:center; gap:10px }
    .stat-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0 }
    .stat-item-label { font-size:.85rem; color:#94a3b8; flex:1 }
    .stat-item-value { font-size:.9rem; font-weight:700; color:#e2e8f0 }

    .mini-bar-wrap { margin-top:8px }
    .mini-bar { display:flex; height:10px; border-radius:6px; overflow:hidden; background:#0f172a }
    .mini-seg { transition:width .6s ease }

    .trend-card { }
    .chart-area { display:flex; align-items:flex-end; gap:6px; height:160px; padding:8px 0; overflow-x:auto }
    .chart-col { display:flex; flex-direction:column; align-items:center; flex:1; min-width:36px }
    .chart-bars { display:flex; gap:3px; align-items:flex-end; height:140px }
    .chart-bar { width:16px; border-radius:4px 4px 0 0; transition:height .6s ease; min-height:2px }
    .bar-rev { background:linear-gradient(to top,#6366f1,#a78bfa) }
    .bar-ref { background:linear-gradient(to top,#ef4444,#f87171) }
    .chart-label { font-size:.68rem; color:#64748b; margin-top:6px }
    .chart-legend { display:flex; gap:20px; margin-top:16px; justify-content:center }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:.8rem; color:#94a3b8 }
    .legend-dot { width:10px; height:10px; border-radius:50% }

    .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 0; color:#64748b }
    .spinner { width:36px; height:36px; border:3px solid #334155; border-top-color:#6366f1; border-radius:50%; animation:spin .8s linear infinite; margin-bottom:16px }

    @media (max-width: 768px) {
      .reports-grid { grid-template-columns:1fr }
      .summary-grid { grid-template-columns:repeat(2,1fr) }
    }
    @media (max-width: 480px) {
      .summary-grid { grid-template-columns:1fr }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  report = signal<AdminReports | null>(null);
  activeFilter = 'all';

  dateFilters = [
    { key: 'today',     label: 'Today' },
    { key: 'week',      label: 'This Week' },
    { key: 'month',     label: 'This Month' },
    { key: 'year',      label: 'This Year' },
    { key: 'all',       label: 'All Time' },
  ];

  constructor(private adminSvc: AdminService) {}

  ngOnInit() { this.loadReports(); }

  setDateRange(key: string) {
    this.activeFilter = key;
    this.loadReports();
  }

  // Returns the date in YYYY-MM-DD format using the user's local timezone
  private getLocalDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadReports() {
    const now = new Date();
    let from: string | undefined;
    let to: string | undefined;

    switch (this.activeFilter) {
      case 'today':
        from = to = this.getLocalDateString(now);
        break;
      case 'week': {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay());
        from = this.getLocalDateString(d);
        to = this.getLocalDateString(now);
        break;
      }
      case 'month':
        from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        to = this.getLocalDateString(now);
        break;
      case 'year':
        from = `${now.getFullYear()}-01-01`;
        to = this.getLocalDateString(now);
        break;
      case 'all':
      default:
        from = undefined; to = undefined;
    }

    this.adminSvc.getReports(from, to).subscribe(r => this.report.set(r));
  }

  revPct(val: number): number {
    const r = this.report()!;
    const max = Math.max(r.flightRevenue, r.hotelRevenue, 1);
    return (val / max) * 100;
  }

  comPct(val: number): number {
    const r = this.report()!;
    const max = Math.max(r.flightCommissions, r.hotelCommissions, r.cancellationFees, 1);
    return (val / max) * 100;
  }

  bookPct(val: number): number {
    const r = this.report()!;
    const total = r.totalBookings || 1;
    return (val / total) * 100;
  }

  trendHeight(val: number): number {
    const max = Math.max(...this.report()!.monthlyTrend.map(m => Math.max(m.revenue, m.refunds)), 1);
    return Math.max((val / max) * 130, 2);
  }
}
