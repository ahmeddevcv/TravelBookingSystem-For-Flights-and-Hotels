import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/api.services';
import { AdminBookingDetail, BookingStatus, UserType } from '../../core/models/models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="booking-detail" style="animation:fadeIn .4s ease">
  <a routerLink="/admin/bookings" class="back-link">← Back to All Bookings</a>

  @if (booking()) {
    <!-- Header -->
    <div class="detail-header">
      <div class="header-left">
        <div class="header-icon" [class]="'icon-' + booking()!.type">
          {{booking()!.type === 'flight' ? '✈️' : '🏨'}}
        </div>
        <div>
          <h1 class="detail-title">{{booking()!.route}}</h1>
          <p class="detail-sub">{{booking()!.type | titlecase}} Booking #{{booking()!.id}}</p>
        </div>
      </div>
      <div class="header-right">
        <span class="badge-lg" [class]="'badge-lg-' + statusClass(booking()!.status)">
          {{statusLabel(booking()!.status)}}
        </span>
      </div>
    </div>

    <!-- Success / Error -->
    @if (successMsg()) {
      <div class="toast toast-success">✅ {{successMsg()}}</div>
    }
    @if (errorMsg()) {
      <div class="toast toast-error">❌ {{errorMsg()}}</div>
    }

    <div class="detail-grid">
      <!-- User Info Card -->
      <div class="info-card">
        <h3 class="card-title">👤 Customer Information</h3>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">{{booking()!.userName}}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value info-email">{{booking()!.userEmail}}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">{{booking()!.userPhone}}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Account Type</span>
            <span class="type-tag" [class]="'tag-' + userTypeClass(booking()!.userType)">
              {{userTypeLabel(booking()!.userType)}}
            </span>
          </div>
        </div>
      </div>

      <!-- Booking Info Card -->
      <div class="info-card">
        <h3 class="card-title">📋 Booking Details</h3>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">{{booking()!.type === 'flight' ? 'Route' : 'Hotel'}}</span>
            <span class="info-value info-highlight">{{booking()!.route}}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{booking()!.type === 'flight' ? 'Departure' : 'Check-in'}}</span>
            <span class="info-value">{{booking()!.eventDate | date:'EEEE, MMM d, y'}}</span>
          </div>
          @if (booking()!.returnDate) {
            <div class="info-row">
              <span class="info-label">{{booking()!.type === 'flight' ? 'Return' : 'Check-out'}}</span>
              <span class="info-value">{{booking()!.returnDate | date:'EEEE, MMM d, y'}}</span>
            </div>
          }
          <div class="info-row">
            <span class="info-label">{{booking()!.type === 'flight' ? 'Passengers' : 'Guests'}}</span>
            <span class="info-value">{{booking()!.passengersOrGuests}}</span>
          </div>
          @if (booking()!.rooms) {
            <div class="info-row">
              <span class="info-label">Rooms</span>
              <span class="info-value">{{booking()!.rooms}}</span>
            </div>
          }
          <div class="info-row">
            <span class="info-label">Booked On</span>
            <span class="info-value">{{booking()!.bookingDate | date:'MMM d, y, h:mm a'}}</span>
          </div>
        </div>
      </div>

      <!-- Pricing Card -->
      <div class="info-card price-card">
        <h3 class="card-title">💰 Price Breakdown</h3>
        <div class="price-rows">
          <div class="price-row">
            <span>Original Price</span>
            <span class="price-val">\${{booking()!.originalPrice | number:'1.2-2'}}</span>
          </div>
          @if (booking()!.discount > 0) {
            <div class="price-row discount-row">
              <span>B2B Discount</span>
              <span class="price-val price-discount">-\${{booking()!.discount | number:'1.2-2'}}</span>
            </div>
          }
          <div class="price-row final-row">
            <span>Final Price</span>
            <span class="price-val price-final">\${{booking()!.finalPrice | number:'1.2-2'}}</span>
          </div>
          <div class="price-divider"></div>
          <div class="price-row">
            <span>Platform Commission</span>
            <span class="price-val price-commission">\${{booking()!.commission | number:'1.2-2'}}</span>
          </div>
        </div>
      </div>

      <!-- Payment & Status Card -->
      <div class="info-card">
        <h3 class="card-title">🔗 Payment & Status</h3>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="badge" [class]="'badge-' + statusClass(booking()!.status)">{{statusLabel(booking()!.status)}}</span>
          </div>
          @if (booking()!.stripePaymentIntentId) {
            <div class="info-row">
              <span class="info-label">Stripe Payment ID</span>
              <span class="info-value info-mono">{{booking()!.stripePaymentIntentId}}</span>
            </div>
          }
          @if (booking()!.cancellationReason) {
            <div class="info-row">
              <span class="info-label">Cancellation Reason</span>
              <span class="info-value info-warn">{{booking()!.cancellationReason}}</span>
            </div>
          }
        </div>

        <!-- Cancel Action -->
        @if (booking()!.status !== 3) {
          <div class="cancel-section">
            <div class="cancel-divider"></div>
            @if (!showCancelForm()) {
              <button (click)="showCancelForm.set(true)" class="btn-danger-outline">✕ Cancel This Booking</button>
            } @else {
              <div class="cancel-form">
                <label class="filter-label">Cancellation Reason (optional)</label>
                <input [(ngModel)]="cancelReason" placeholder="Reason for cancellation..."
                  class="cancel-input">
                <div class="cancel-actions">
                  <button (click)="showCancelForm.set(false)" class="btn-ghost-sm">Nevermind</button>
                  <button (click)="confirmCancel()" class="btn-danger" [disabled]="cancelling()">
                    {{cancelling() ? 'Cancelling...' : 'Confirm Cancel'}}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  } @else if (loading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading booking details...</p>
    </div>
  }
</div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes spin { to { transform:rotate(360deg) } }

    .back-link { color:#6366f1; text-decoration:none; font-size:.85rem; font-weight:500; display:inline-block; margin-bottom:20px; transition:color .2s }
    .back-link:hover { color:#a5b4fc }

    .detail-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:16px }
    .header-left { display:flex; align-items:center; gap:16px }
    .header-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem }
    .icon-flight { background:linear-gradient(135deg,#1e1b4b,#312e81) }
    .icon-hotel { background:linear-gradient(135deg,#422006,#78350f) }
    .detail-title { font-size:1.5rem; font-weight:800; color:#f1f5f9; margin:0; letter-spacing:-0.02em }
    .detail-sub { color:#64748b; font-size:.85rem; margin:4px 0 0 }

    .badge-lg { padding:6px 16px; border-radius:10px; font-size:.85rem; font-weight:700 }
    .badge-lg-confirmed { background:#14532d; color:#86efac }
    .badge-lg-pending { background:#422006; color:#fbbf24 }
    .badge-lg-cancelled { background:#450a0a; color:#fca5a5 }
    .badge-lg-completed { background:#1e3a5f; color:#93c5fd }

    .toast { padding:12px 18px; border-radius:10px; margin-bottom:16px; font-size:.85rem; font-weight:500; animation:fadeIn .3s ease }
    .toast-success { background:#14532d; color:#86efac; border:1px solid #166534 }
    .toast-error { background:#450a0a; color:#fca5a5; border:1px solid #7f1d1d }

    .detail-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px }

    .info-card { background:#1e293b; border:1px solid #334155; border-radius:14px; padding:24px }
    .card-title { font-size:1rem; font-weight:700; color:#e2e8f0; margin:0 0 18px; padding-bottom:12px; border-bottom:1px solid #334155 }
    .info-rows { display:flex; flex-direction:column; gap:14px }
    .info-row { display:flex; justify-content:space-between; align-items:center }
    .info-label { font-size:.82rem; color:#64748b; font-weight:500 }
    .info-value { font-size:.88rem; color:#e2e8f0; font-weight:500; text-align:right }
    .info-highlight { color:#a5b4fc; font-weight:700 }
    .info-email { color:#6366f1 }
    .info-mono { font-family:monospace; font-size:.78rem; color:#94a3b8; word-break:break-all }
    .info-warn { color:#fbbf24; font-style:italic }

    .type-tag { padding:3px 10px; border-radius:8px; font-size:.75rem; font-weight:600 }
    .tag-b2c { background:#1e3a5f; color:#93c5fd }
    .tag-b2b { background:#2e1065; color:#c4b5fd }
    .tag-admin { background:#1e1b4b; color:#a5b4fc }

    .badge { padding:4px 12px; border-radius:999px; font-size:.75rem; font-weight:600 }
    .badge-confirmed { background:#14532d; color:#86efac }
    .badge-pending { background:#422006; color:#fbbf24 }
    .badge-cancelled { background:#450a0a; color:#fca5a5 }
    .badge-completed { background:#1e3a5f; color:#93c5fd }

    .price-card { background:linear-gradient(135deg,#1e293b,#0f172a) }
    .price-rows { display:flex; flex-direction:column; gap:14px }
    .price-row { display:flex; justify-content:space-between; align-items:center; font-size:.88rem; color:#94a3b8 }
    .price-val { font-weight:600; color:#e2e8f0 }
    .price-discount { color:#10b981 }
    .final-row { font-size:1rem }
    .price-final { font-size:1.15rem; color:#f1f5f9; font-weight:800 }
    .price-divider { height:1px; background:#334155; margin:4px 0 }
    .price-commission { color:#a78bfa }
    .discount-row { color:#10b981 }

    .cancel-section { margin-top:20px }
    .cancel-divider { height:1px; background:#334155; margin-bottom:16px }
    .btn-danger-outline { padding:10px 20px; background:transparent; color:#fca5a5; border:1px solid #7f1d1d; border-radius:8px; font-size:.85rem; font-weight:600; cursor:pointer; width:100%; transition:all .2s }
    .btn-danger-outline:hover { background:#450a0a; border-color:#ef4444 }

    .cancel-form { display:flex; flex-direction:column; gap:12px }
    .filter-label { font-size:.75rem; color:#64748b; font-weight:500; text-transform:uppercase; letter-spacing:.04em }
    .cancel-input { padding:10px 14px; background:#0f172a; border:1px solid #334155; border-radius:8px; font-size:.85rem; color:#e2e8f0; outline:none }
    .cancel-input:focus { border-color:#ef4444 }
    .cancel-actions { display:flex; justify-content:flex-end; gap:10px }
    .btn-ghost-sm { padding:8px 16px; background:transparent; color:#94a3b8; border:1px solid #334155; border-radius:8px; font-size:.82rem; cursor:pointer }
    .btn-danger { padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:8px; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .2s }
    .btn-danger:hover { background:#b91c1c }
    .btn-danger:disabled { opacity:.6; cursor:not-allowed }

    .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 0; color:#64748b }
    .spinner { width:36px; height:36px; border:3px solid #334155; border-top-color:#6366f1; border-radius:50%; animation:spin .8s linear infinite; margin-bottom:16px }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns:1fr }
      .detail-header { flex-direction:column; align-items:flex-start }
      .info-row { flex-direction:column; align-items:flex-start; gap:4px }
      .info-value { text-align:left }
    }
  `]
})
export class BookingDetailComponent implements OnInit {
  booking        = signal<AdminBookingDetail | null>(null);
  loading        = signal(true);
  showCancelForm = signal(false);
  cancelling     = signal(false);
  cancelReason   = '';
  successMsg     = signal('');
  errorMsg       = signal('');

  private type = '';
  private id   = 0;

  constructor(private route: ActivatedRoute, private adminSvc: AdminService) {}

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type') || '';
    this.id   = +(this.route.snapshot.paramMap.get('id') || 0);
    this.loadDetail();
  }

  loadDetail() {
    this.loading.set(true);
    this.adminSvc.getBookingDetail(this.type, this.id).subscribe({
      next: b => { this.booking.set(b); this.loading.set(false); },
      error: () => { this.errorMsg.set('Failed to load booking details'); this.loading.set(false); }
    });
  }

  confirmCancel() {
    this.cancelling.set(true);
    this.adminSvc.adminCancelBooking(this.type, this.id, this.cancelReason).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.showCancelForm.set(false);
        this.successMsg.set('Booking cancelled successfully. Full refund issued.');
        setTimeout(() => this.successMsg.set(''), 5000);
        this.loadDetail();
      },
      error: err => {
        this.cancelling.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to cancel booking');
        setTimeout(() => this.errorMsg.set(''), 5000);
      }
    });
  }

  statusClass(s: BookingStatus): string {
    switch(s) { case 2: return 'confirmed'; case 1: return 'pending'; case 3: return 'cancelled'; case 4: return 'completed'; default: return 'pending'; }
  }
  statusLabel(s: BookingStatus): string {
    switch(s) { case 1: return 'Pending'; case 2: return 'Confirmed'; case 3: return 'Cancelled'; case 4: return 'Completed'; default: return ''; }
  }
  userTypeLabel(t: UserType): string {
    switch(t) { case 1: return 'B2C'; case 2: return 'B2B'; case 3: return 'Admin'; default: return ''; }
  }
  userTypeClass(t: UserType): string {
    switch(t) { case 1: return 'b2c'; case 2: return 'b2b'; case 3: return 'admin'; default: return 'b2c'; }
  }
}
