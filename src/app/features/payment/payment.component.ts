import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink],
  template: `
<div style="text-align:center;padding:64px">
  <div style="font-size:3rem;margin-bottom:16px">💳</div>
  <h1 style="font-size:1.25rem;font-weight:700;color:#1e293b;margin:0 0 8px">Payment</h1>
  <p style="color:#64748b">Payment is handled during the booking flow.<br>
  <a routerLink="/flights" style="color:#2563eb">Search Flights →</a> or <a routerLink="/hotels" style="color:#7c3aed">Search Hotels →</a></p>
</div>
  `
})
export class PaymentComponent {}
