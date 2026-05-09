import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService, HotelService } from '../../core/services/api.services';
import { FlightBooking, HotelBooking, BookingStatus, CancellationResult } from '../../core/models/models';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">My Bookings</h1>

  <!-- Tabs -->
  <div style="display:flex;gap:8px;margin-bottom:24px;border-bottom:2px solid #e2e8f0;padding-bottom:-1px">
    <button (click)="tab='flights'" [style.border-bottom]="tab==='flights'?'2px solid #2563eb':'2px solid transparent'"
      [style.color]="tab==='flights'?'#2563eb':'#64748b'"
      style="padding:8px 16px;background:none;border:none;border-bottom:2px solid;font-size:.95rem;font-weight:600;cursor:pointer;margin-bottom:-2px">
      ✈️ Flights ({{flights().length}})
    </button>
    <button (click)="tab='hotels'" [style.border-bottom]="tab==='hotels'?'2px solid #7c3aed':'2px solid transparent'"
      [style.color]="tab==='hotels'?'#7c3aed':'#64748b'"
      style="padding:8px 16px;background:none;border:none;border-bottom:2px solid;font-size:.95rem;font-weight:600;cursor:pointer;margin-bottom:-2px">
      🏨 Hotels ({{hotels().length}})
    </button>
  </div>

  @if (cancelResult()) {
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px">
      <p style="color:#166534;font-weight:600;margin:0 0 4px">Booking Cancelled</p>
      <p style="color:#16a34a;font-size:.875rem;margin:0">{{cancelResult()!.message}}</p>
      @if (!cancelResult()!.isFreeCancel) {
        <p style="color:#d97706;font-size:.8rem;margin:4px 0 0">Fee: \${{cancelResult()!.cancellationFee | number:'1.2-2'}} · Refund: \${{cancelResult()!.refundAmount | number:'1.2-2'}}</p>
      }
    </div>
  }

  @if (error()) {
    <div style="background:#fee2e2;color:#dc2626;padding:12px 16px;border-radius:8px;margin-bottom:16px">{{error()}}</div>
  }

  <!-- Flights Tab -->
  @if (tab === 'flights') {
    @if (flights().length === 0) {
      <div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:3rem;margin-bottom:12px">✈️</div><p>No flight bookings yet.</p><a href="/flights" style="color:#2563eb">Search Flights →</a></div>
    } @else {
      <div style="display:flex;flex-direction:column;gap:12px">
        @for (b of flights(); track b.id) {
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:1.1rem;font-weight:700;color:#1e293b">{{b.origin}} → {{b.destination}}</div>
              <div style="font-size:.8rem;color:#64748b;margin-top:4px">{{b.departureDate | date:'mediumDate'}} · {{b.passengers}} passenger(s)</div>
              <div style="margin-top:8px"><span [style.background]="statusColor(b.status)" [style.color]="statusTextColor(b.status)" style="padding:2px 10px;border-radius:999px;font-size:.75rem;font-weight:600">{{statusLabel(b.status)}}</span></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:1.25rem;font-weight:700;color:#059669">\${{b.finalPrice | number:'1.2-2'}}</div>
              @if (b.discount > 0) { <div style="font-size:.75rem;color:#7c3aed">Saved \${{b.discount | number:'1.2-2'}}</div> }
              @if (b.status === 1) {
                <button (click)="payFlight(b)" style="margin-top:8px;margin-right:8px;padding:6px 14px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Pay Now</button>
              }
              @if (b.status === 1 || b.status === 2) {
                <button (click)="cancelFlight(b.id)" style="margin-top:8px;padding:6px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Cancel</button>
              }
            </div>
          </div>
        }
      </div>
    }
  }

  <!-- Hotels Tab -->
  @if (tab === 'hotels') {
    @if (hotels().length === 0) {
      <div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:3rem;margin-bottom:12px">🏨</div><p>No hotel bookings yet.</p><a href="/hotels" style="color:#7c3aed">Search Hotels →</a></div>
    } @else {
      <div style="display:flex;flex-direction:column;gap:12px">
        @for (b of hotels(); track b.id) {
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:1.1rem;font-weight:700;color:#1e293b">🏨 {{b.hotelName}}</div>
              <div style="font-size:.8rem;color:#64748b;margin-top:4px">{{b.city}} · {{b.checkInDate | date:'mediumDate'}} → {{b.checkOutDate | date:'mediumDate'}}</div>
              <div style="font-size:.8rem;color:#64748b">{{b.rooms}} room(s) · {{b.guests}} guest(s)</div>
              <div style="margin-top:8px"><span [style.background]="statusColor(b.status)" [style.color]="statusTextColor(b.status)" style="padding:2px 10px;border-radius:999px;font-size:.75rem;font-weight:600">{{statusLabel(b.status)}}</span></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:1.25rem;font-weight:700;color:#059669">\${{b.finalPrice | number:'1.2-2'}}</div>
              @if (b.discount > 0) { <div style="font-size:.75rem;color:#7c3aed">Saved \${{b.discount | number:'1.2-2'}}</div> }
              @if (b.status === 1) {
                <button (click)="payHotel(b)" style="margin-top:8px;margin-right:8px;padding:6px 14px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Pay Now</button>
              }
              @if (b.status === 1 || b.status === 2) {
                <button (click)="cancelHotel(b.id)" style="margin-top:8px;padding:6px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Cancel</button>
              }
            </div>
          </div>
        }
      </div>
    }
  }
</div>
  `
})
export class BookingsComponent implements OnInit {
  tab: 'flights' | 'hotels' = 'flights';
  flights      = signal<FlightBooking[]>([]);
  hotels       = signal<HotelBooking[]>([]);
  cancelResult = signal<CancellationResult | null>(null);
  error        = signal('');

  constructor(private flightSvc: FlightService, private hotelSvc: HotelService, private router: Router) {}

  ngOnInit() {
    this.flightSvc.myBookings().subscribe(b => this.flights.set(b));
    this.hotelSvc.myBookings().subscribe(b => this.hotels.set(b));
  }

  payFlight(b: any) {
    sessionStorage.setItem('pendingFlightBooking', JSON.stringify(b));
    sessionStorage.setItem('selectedFlight', b.flightDataJson || '{}');
    sessionStorage.setItem('flightSearchForm', JSON.stringify({
      origin: b.origin,
      destination: b.destination,
      departureDate: b.departureDate,
      adults: b.passengers
    }));
    this.router.navigate(['/flights/book']);
  }

  payHotel(b: any) {
    sessionStorage.setItem('pendingHotelBooking', JSON.stringify(b));
    sessionStorage.setItem('selectedHotel', b.hotelDataJson || '{}');
    sessionStorage.setItem('hotelSearchForm', JSON.stringify({
      city: b.city,
      checkIn: b.checkInDate,
      checkOut: b.checkOutDate,
      guests: b.guests,
      rooms: b.rooms
    }));
    this.router.navigate(['/hotels/book']);
  }

  cancelFlight(id: number) {
    if (!confirm('Cancel this booking? Cancellation fees may apply.')) return;
    this.flightSvc.cancel(id).subscribe({
      next: r => { this.cancelResult.set(r); this.flightSvc.myBookings().subscribe(b => this.flights.set(b)); },
      error: e => this.error.set(e.error?.message || 'Cancel failed')
    });
  }

  cancelHotel(id: number) {
    if (!confirm('Cancel this booking? Cancellation fees may apply.')) return;
    this.hotelSvc.cancel(id).subscribe({
      next: r => { this.cancelResult.set(r); this.hotelSvc.myBookings().subscribe(b => this.hotels.set(b)); },
      error: e => this.error.set(e.error?.message || 'Cancel failed')
    });
  }

  statusLabel(s: BookingStatus) { return s===1?'Pending':s===2?'Confirmed':s===3?'Cancelled':'Completed'; }
  statusColor(s: BookingStatus) { return s===1?'#fef3c7':s===2?'#d1fae5':s===3?'#fee2e2':'#e0e7ff'; }
  statusTextColor(s: BookingStatus) { return s===1?'#92400e':s===2?'#065f46':s===3?'#991b1b':'#3730a3'; }
}
