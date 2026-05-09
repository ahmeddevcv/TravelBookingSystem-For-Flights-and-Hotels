import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { B2BService } from '../../../core/services/api.services';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">📊 B2B Reports</h1>
  @if (report()) {
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
        <h2 style="font-size:.875rem;font-weight:600;color:#64748b;margin:0 0 16px;text-transform:uppercase">✈️ Flights</h2>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:.875rem">
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Total Bookings</span><span style="font-weight:600">{{report()!.flightBookings.total}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Confirmed</span><span style="font-weight:600;color:#059669">{{report()!.flightBookings.confirmed}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Cancelled</span><span style="font-weight:600;color:#dc2626">{{report()!.flightBookings.cancelled}}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:8px"><span style="color:#64748b">Total Spent</span><span style="font-weight:700;color:#059669">\${{report()!.flightBookings.totalSpent | number:'1.2-2'}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#7c3aed">Total Saved (Discount)</span><span style="font-weight:600;color:#7c3aed">\${{report()!.flightBookings.totalDiscount | number:'1.2-2'}}</span></div>
        </div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
        <h2 style="font-size:.875rem;font-weight:600;color:#64748b;margin:0 0 16px;text-transform:uppercase">🏨 Hotels</h2>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:.875rem">
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Total Bookings</span><span style="font-weight:600">{{report()!.hotelBookings.total}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Confirmed</span><span style="font-weight:600;color:#059669">{{report()!.hotelBookings.confirmed}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Cancelled</span><span style="font-weight:600;color:#dc2626">{{report()!.hotelBookings.cancelled}}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:8px"><span style="color:#64748b">Total Spent</span><span style="font-weight:700;color:#059669">\${{report()!.hotelBookings.totalSpent | number:'1.2-2'}}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:#7c3aed">Total Saved (Discount)</span><span style="font-weight:600;color:#7c3aed">\${{report()!.hotelBookings.totalDiscount | number:'1.2-2'}}</span></div>
        </div>
      </div>
    </div>
  }
</div>
  `
})
export class ReportsComponent implements OnInit {
  report = signal<any>(null);
  constructor(private b2bSvc: B2BService) {}
  ngOnInit() { this.b2bSvc.getReports().subscribe(r => this.report.set(r)); }
}
