import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/api.services';
import { AdminBookingRow, AdminBookingsPage, BookingStatus } from '../../core/models/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="admin-bookings" style="animation:fadeIn .4s ease">
  <div class="page-header">
    <div>
      <h1 class="page-title">📋 All Bookings</h1>
      <p class="page-sub">Manage and monitor all flight & hotel bookings</p>
    </div>
    <div class="header-stats" *ngIf="data()">
      <span class="header-stat">Total: <strong>{{data()!.totalCount}}</strong></span>
    </div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <div class="filter-group">
      <label class="filter-label">Status</label>
      <select [(ngModel)]="filterStatus" (change)="load()" class="filter-select">
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Type</label>
      <select [(ngModel)]="filterType" (change)="load()" class="filter-select">
        <option value="all">All Types</option>
        <option value="flight">✈️ Flights</option>
        <option value="hotel">🏨 Hotels</option>
      </select>
    </div>
    <div class="filter-group filter-search">
      <label class="filter-label">Search</label>
      <input [(ngModel)]="filterSearch" (keyup.enter)="load()" placeholder="User name, email, route..."
        class="filter-input">
    </div>
    <div class="filter-group">
      <label class="filter-label">From</label>
      <input type="date" [(ngModel)]="filterFrom" (change)="load()" class="filter-input">
    </div>
    <div class="filter-group">
      <label class="filter-label">To</label>
      <input type="date" [(ngModel)]="filterTo" (change)="load()" class="filter-input">
    </div>
    <button (click)="clearFilters()" class="btn-ghost" title="Clear filters">✕ Clear</button>
  </div>

  <!-- Success / Error messages -->
  @if (successMsg()) {
    <div class="toast toast-success">✅ {{successMsg()}}</div>
  }
  @if (errorMsg()) {
    <div class="toast toast-error">❌ {{errorMsg()}}</div>
  }

  <!-- Table -->
  <div class="table-card">
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Route / Name</th>
            <th>User</th>
            <th>Event Date</th>
            <th>Amount</th>
            <th>Commission</th>
            <th>Status</th>
            <th>Booked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (b of bookings(); track b.id + b.type) {
            <tr class="table-row-hover">
              <td class="td-muted">#{{b.id}}</td>
              <td>
                <span class="type-badge" [class]="'type-' + b.type">
                  {{b.type === 'flight' ? '✈️' : '🏨'}} {{b.type | titlecase}}
                </span>
              </td>
              <td class="td-primary">
                <a [routerLink]="['/admin/bookings', b.type, b.id]" class="route-link">{{b.route}}</a>
              </td>
              <td>
                <div class="user-cell">
                  <span class="user-name">{{b.userName}}</span>
                  <span class="user-email">{{b.userEmail}}</span>
                </div>
              </td>
              <td>{{b.eventDate | date:'MMM d, y'}}</td>
              <td class="td-money">\${{b.finalPrice | number:'1.2-2'}}</td>
              <td class="td-commission">\${{b.commission | number:'1.2-2'}}</td>
              <td><span class="badge" [class]="'badge-' + statusClass(b.status)">{{statusLabel(b.status)}}</span></td>
              <td class="td-muted">{{b.bookingDate | date:'MMM d'}}</td>
              <td>
                <div class="action-btns">
                  <a [routerLink]="['/admin/bookings', b.type, b.id]" class="action-btn action-view" title="View details">👁️</a>
                  @if (b.status !== 3) {
                    <button (click)="cancelBooking(b)" class="action-btn action-cancel" title="Cancel booking">✕</button>
                  }
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="10" class="empty-row">No bookings found matching your filters.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    @if (data() && data()!.totalCount > pageSize) {
      <div class="pagination">
        <button (click)="prevPage()" [disabled]="page === 1" class="page-btn">← Prev</button>
        <span class="page-info">Page {{page}} of {{totalPages()}}</span>
        <button (click)="nextPage()" [disabled]="page >= totalPages()" class="page-btn">Next →</button>
      </div>
    }
  </div>

  <!-- Cancel Confirmation Modal -->
  @if (showCancelModal()) {
    <div class="modal-overlay" (click)="showCancelModal.set(false)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3 class="modal-title">Cancel Booking #{{cancelTarget()?.id}}</h3>
        <p class="modal-sub">{{cancelTarget()?.route}} — {{cancelTarget()?.userName}}</p>
        <p class="modal-warn">⚠️ This will issue a full refund if payment was made.</p>
        <div class="modal-field">
          <label class="filter-label">Reason (optional)</label>
          <input [(ngModel)]="cancelReason" placeholder="e.g. Customer requested, flight cancelled..."
            class="filter-input" style="width:100%">
        </div>
        <div class="modal-actions">
          <button (click)="showCancelModal.set(false)" class="btn-ghost">Cancel</button>
          <button (click)="confirmCancel()" class="btn-danger" [disabled]="cancelling()">
            {{cancelling() ? 'Cancelling...' : '✕ Confirm Cancel'}}
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px }
    .page-title { font-size:1.6rem; font-weight:800; color:#f1f5f9; margin:0; letter-spacing:-0.02em }
    .page-sub { color:#64748b; font-size:.85rem; margin:4px 0 0 }
    .header-stats { display:flex; gap:16px }
    .header-stat { color:#94a3b8; font-size:.9rem }
    .header-stat strong { color:#f1f5f9 }

    .filter-bar { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px; padding:20px; background:#1e293b; border:1px solid #334155; border-radius:14px }
    .filter-group { display:flex; flex-direction:column; gap:4px }
    .filter-search { flex:1; min-width:180px }
    .filter-label { font-size:.72rem; color:#64748b; font-weight:500; text-transform:uppercase; letter-spacing:.05em }
    .filter-select, .filter-input { padding:9px 12px; background:#0f172a; border:1px solid #334155; border-radius:8px; font-size:.84rem; color:#e2e8f0; outline:none; transition:border-color .2s }
    .filter-select:focus, .filter-input:focus { border-color:#6366f1 }

    .btn-ghost { padding:9px 16px; background:transparent; color:#94a3b8; border:1px solid #334155; border-radius:8px; font-size:.84rem; cursor:pointer; transition:all .2s; align-self:flex-end }
    .btn-ghost:hover { border-color:#64748b; color:#e2e8f0 }

    .toast { padding:12px 18px; border-radius:10px; margin-bottom:16px; font-size:.85rem; font-weight:500; animation:fadeIn .3s ease }
    .toast-success { background:#14532d; color:#86efac; border:1px solid #166534 }
    .toast-error { background:#450a0a; color:#fca5a5; border:1px solid #7f1d1d }

    .table-card { background:#1e293b; border:1px solid #334155; border-radius:14px; overflow:hidden }
    .table-wrap { overflow-x:auto }
    .data-table { width:100%; border-collapse:collapse; font-size:.84rem }
    .data-table th { text-align:left; padding:14px 14px; color:#64748b; font-weight:500; border-bottom:1px solid #334155; white-space:nowrap; font-size:.78rem; text-transform:uppercase; letter-spacing:.04em }
    .data-table td { padding:12px 14px; color:#cbd5e1; border-bottom:1px solid rgba(51,65,85,.5); white-space:nowrap }
    .table-row-hover:hover { background:rgba(99,102,241,.06); transition:background .15s }
    .td-primary { color:#f1f5f9; font-weight:600 }
    .td-muted { color:#64748b }
    .td-money { color:#10b981; font-weight:600 }
    .td-commission { color:#a78bfa; font-weight:500 }

    .route-link { color:#a5b4fc; text-decoration:none; font-weight:600 }
    .route-link:hover { color:#c7d2fe; text-decoration:underline }

    .type-badge { padding:3px 10px; border-radius:8px; font-size:.75rem; font-weight:600 }
    .type-flight { background:#1e1b4b; color:#a5b4fc }
    .type-hotel { background:#422006; color:#fbbf24 }

    .user-cell { display:flex; flex-direction:column }
    .user-name { color:#e2e8f0; font-weight:500; font-size:.84rem }
    .user-email { color:#64748b; font-size:.75rem }

    .badge { padding:3px 10px; border-radius:999px; font-size:.72rem; font-weight:600 }
    .badge-confirmed { background:#14532d; color:#86efac }
    .badge-pending { background:#422006; color:#fbbf24 }
    .badge-cancelled { background:#450a0a; color:#fca5a5 }
    .badge-completed { background:#1e3a5f; color:#93c5fd }

    .action-btns { display:flex; gap:6px }
    .action-btn { width:30px; height:30px; border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.8rem; transition:all .2s }
    .action-view { background:#1e1b4b; color:#a5b4fc }
    .action-view:hover { background:#312e81 }
    .action-cancel { background:#450a0a; color:#fca5a5 }
    .action-cancel:hover { background:#7f1d1d }

    .empty-row { text-align:center; color:#64748b; padding:40px !important; font-size:.9rem }

    .pagination { display:flex; justify-content:center; align-items:center; gap:16px; padding:16px }
    .page-btn { padding:8px 16px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#94a3b8; font-size:.84rem; cursor:pointer; transition:all .2s }
    .page-btn:hover:not(:disabled) { border-color:#6366f1; color:#a5b4fc }
    .page-btn:disabled { opacity:.4; cursor:not-allowed }
    .page-info { color:#64748b; font-size:.84rem }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeIn .2s ease }
    .modal-content { background:#1e293b; border:1px solid #334155; border-radius:16px; padding:32px; max-width:480px; width:90% }
    .modal-title { font-size:1.2rem; font-weight:700; color:#f1f5f9; margin:0 0 8px }
    .modal-sub { color:#94a3b8; font-size:.9rem; margin:0 0 12px }
    .modal-warn { color:#fbbf24; font-size:.85rem; background:#422006; padding:10px 14px; border-radius:8px; margin:0 0 16px }
    .modal-field { margin-bottom:20px }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px }
    .btn-danger { padding:10px 20px; background:#dc2626; color:#fff; border:none; border-radius:8px; font-size:.85rem; font-weight:600; cursor:pointer; transition:all .2s }
    .btn-danger:hover { background:#b91c1c }
    .btn-danger:disabled { opacity:.6; cursor:not-allowed }

    @media (max-width: 768px) {
      .filter-bar { flex-direction:column }
      .filter-group { width:100% }
      .filter-search { min-width:unset }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  data     = signal<AdminBookingsPage | null>(null);
  bookings = signal<AdminBookingRow[]>([]);

  filterStatus = 'all';
  filterType   = 'all';
  filterSearch = '';
  filterFrom   = '';
  filterTo     = '';
  page         = 1;
  pageSize     = 20;

  successMsg     = signal('');
  errorMsg       = signal('');
  showCancelModal= signal(false);
  cancelTarget   = signal<AdminBookingRow | null>(null);
  cancelReason   = '';
  cancelling     = signal(false);

  constructor(private adminSvc: AdminService) {}

  ngOnInit() { this.load(); }

  load() {
    this.adminSvc.getAllBookings({
      status:   this.filterStatus !== 'all' ? this.filterStatus : undefined,
      type:     this.filterType !== 'all' ? this.filterType : undefined,
      search:   this.filterSearch || undefined,
      from:     this.filterFrom || undefined,
      to:       this.filterTo || undefined,
      page:     this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: d => { this.data.set(d); this.bookings.set(d.bookings); },
      error: () => this.errorMsg.set('Failed to load bookings')
    });
  }

  clearFilters() {
    this.filterStatus = 'all';
    this.filterType = 'all';
    this.filterSearch = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.page = 1;
    this.load();
  }

  totalPages(): number {
    const d = this.data();
    return d ? Math.ceil(d.totalCount / this.pageSize) : 1;
  }
  prevPage() { if (this.page > 1) { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages()) { this.page++; this.load(); } }

  cancelBooking(b: AdminBookingRow) {
    this.cancelTarget.set(b);
    this.cancelReason = '';
    this.showCancelModal.set(true);
  }

  confirmCancel() {
    const t = this.cancelTarget();
    if (!t) return;
    this.cancelling.set(true);
    this.adminSvc.adminCancelBooking(t.type, t.id, this.cancelReason).subscribe({
      next: () => {
        this.showCancelModal.set(false);
        this.cancelling.set(false);
        this.successMsg.set(`Booking #${t.id} cancelled successfully.`);
        setTimeout(() => this.successMsg.set(''), 4000);
        this.load();
      },
      error: err => {
        this.cancelling.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to cancel booking');
        setTimeout(() => this.errorMsg.set(''), 4000);
      }
    });
  }

  statusClass(s: BookingStatus): string {
    switch(s) { case 2: return 'confirmed'; case 1: return 'pending'; case 3: return 'cancelled'; case 4: return 'completed'; default: return 'pending'; }
  }
  statusLabel(s: BookingStatus): string {
    switch(s) { case 1: return 'Pending'; case 2: return 'Confirmed'; case 3: return 'Cancelled'; case 4: return 'Completed'; default: return ''; }
  }
}
