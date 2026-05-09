import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HotelService, PaymentService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { UserType, HotelBooking } from '../../../core/models/models';

@Component({
  selector: 'app-hotel-booking',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
<div style="max-width:680px;margin:0 auto">
  <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">Confirm Hotel Booking</h1>

  @if (!hotel) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      No hotel selected. <a href="/hotels" style="color:#7c3aed">Go back to search →</a>
    </div>
  } @else {
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px">
      <h2 style="font-size:1rem;font-weight:600;color:#64748b;margin:0 0 16px;text-transform:uppercase;letter-spacing:.05em">Hotel Details</h2>
      <div style="font-size:1.25rem;font-weight:700;color:#1e293b;margin-bottom:8px">🏨 {{hotelName}}</div>
      <div style="color:#64748b;font-size:.875rem">
        {{searchForm?.city}} · {{searchForm?.checkIn}} → {{searchForm?.checkOut}} · {{searchForm?.guests}} guest(s)
      </div>
      <div style="margin-top:12px">
        @if (hotel?.cug?.discount) {
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="text-decoration:line-through;color:#94a3b8;font-size:1rem">{{hotel.cug.priceWithoutDiscount}}</span>
            <span style="background:#fef08a;color:#854d0e;padding:2px 8px;border-radius:4px;font-size:.8rem;font-weight:700">{{hotel.cug.discount}}</span>
          </div>
        }
        <div style="font-size:1.75rem;font-weight:700;color:#059669">\${{rawPrice | number:'1.2-2'}}</div>
      </div>
    </div>

    @if (booking()) {
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px">
        <h3 style="font-size:.9rem;font-weight:600;color:#166534;margin:0 0 12px">✅ Booking Created</h3>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:.875rem">
          <div style="display:flex;justify-content:space-between"><span>Original</span><span>\${{booking()!.originalPrice | number:'1.2-2'}}</span></div>
          @if (isB2B) {
            <div style="display:flex;justify-content:space-between;color:#059669"><span>B2B Discount</span><span>-\${{booking()!.discount | number:'1.2-2'}}</span></div>
          }
          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #d1fae5;padding-top:6px"><span>Total</span><span style="color:#059669">\${{booking()!.finalPrice | number:'1.2-2'}}</span></div>
        </div>
      </div>
    }

    @if (error()) {
      <div style="background:#fee2e2;color:#dc2626;padding:12px 16px;border-radius:8px;margin-bottom:16px">{{error()}}</div>
    }

    <!-- Step 1: Create Booking -->
    @if (!booking()) {
      <button (click)="createBooking()" [disabled]="loading()"
        style="width:100%;padding:14px;background:#7c3aed;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer"
        [style.opacity]="loading()?'0.7':'1'">
        {{loading() ? 'Creating Booking…' : 'Confirm & Proceed to Payment →'}}
      </button>
    }

    <!-- Step 2: Stripe Card Form -->
    @if (booking() && !paymentDone()) {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
        <h3 style="font-size:1rem;font-weight:600;color:#1e293b;margin:0 0 4px">💳 Complete Payment</h3>
        <p style="color:#64748b;font-size:.8rem;margin:0 0 20px">
          Test card: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:.8rem">4242 4242 4242 4242</code>
          · any future expiry · any CVC
        </p>

        <!-- Stripe card element mounts here -->
        <div id="card-element"
          style="border:1px solid #cbd5e1;border-radius:8px;padding:14px;background:#f8fafc;min-height:44px;margin-bottom:16px">
        </div>

        <div id="card-errors" style="color:#dc2626;font-size:.85rem;margin-bottom:12px;min-height:20px"></div>

        <button (click)="pay()" [disabled]="loading() || !stripeReady"
          style="width:100%;padding:14px;background:#059669;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer"
          [style.opacity]="(loading() || !stripeReady)?'0.7':'1'">
          {{loading() ? 'Processing…' : '💳 Pay $' + (booking()!.finalPrice | number:'1.2-2')}}
        </button>
      </div>
    }

    <!-- Step 3: Success -->
    @if (paymentDone()) {
      <div style="text-align:center;padding:32px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">
        <div style="font-size:3rem;margin-bottom:12px">✅</div>
        <h2 style="font-size:1.25rem;font-weight:700;color:#166534;margin:0 0 8px">Hotel Confirmed!</h2>
        <p style="color:#16a34a;margin:0 0 20px">Your hotel has been booked and payment processed.</p>
        <a href="/bookings" style="padding:10px 24px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View My Bookings →</a>
      </div>
    }
  }
</div>
  `
})
export class HotelBookingComponent implements OnInit {
  hotel: any = null; searchForm: any = null;
  hotelName = ''; rawPrice = 0; isB2B = false;
  booking    = signal<HotelBooking | null>(null);
  loading    = signal(false);
  error      = signal('');
  paymentDone= signal(false);
  stripeReady = false;

  private stripe: any = null;
  private cardElement: any = null;

  constructor(private hotelSvc: HotelService, private paymentSvc: PaymentService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const stored = sessionStorage.getItem('selectedHotel');
    const form   = sessionStorage.getItem('hotelSearchForm');
    if (!stored) { this.router.navigate(['/hotels']); return; }
    this.hotel      = JSON.parse(stored);
    this.searchForm = form ? JSON.parse(form) : {};
    this.hotelName  = this.hotel?.name || this.hotel?.hotel?.name || 'Hotel';
    
    // Parse the string price (e.g., "$76") into a number for the backend
    if (typeof this.hotel?.price === 'string') {
      this.rawPrice = parseFloat(this.hotel.price.replace(/[^0-9.]/g, ''));
    } else {
      this.rawPrice = this.hotel?.price?.lead?.amount || this.hotel?.offers?.[0]?.price?.total || 0;
    }
    
    this.isB2B      = this.auth.currentUser()?.userType === UserType.B2B;

    // Restore pending booking if page was refreshed
    const pending = sessionStorage.getItem('pendingHotelBooking');
    if (pending) {
      this.booking.set(JSON.parse(pending));
      setTimeout(() => this.mountStripeCard(), 100);
    }
  }

  createBooking() {
    this.loading.set(true); this.error.set('');
    const dto = {
      hotelDataJson: JSON.stringify(this.hotel),
      hotelName: this.hotelName, city: this.searchForm.city,
      checkIn: this.searchForm.checkIn, checkOut: this.searchForm.checkOut,
      rooms: this.searchForm.rooms || 1, guests: this.searchForm.guests || 1,
      price: this.rawPrice
    };
    this.hotelSvc.book(dto).subscribe({
      next: b  => { 
        this.booking.set(b); 
        sessionStorage.setItem('pendingHotelBooking', JSON.stringify(b)); // Save so it persists on refresh
        this.loading.set(false);
        // Mount Stripe card element after booking is created
        setTimeout(() => this.mountStripeCard(), 100);
      },
      error: e => { this.error.set(e.error?.message || 'Booking failed'); this.loading.set(false); }
    });
  }

  private async mountStripeCard() {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const publishableKey = 'pk_test_51OnIQZG3C5uEFs6dT5zG1D0P2nDbDIeIhquy3Cn9CX2vt2eZyhtJTQacXqWgKb0ruGImYv44YZuyjvkCKZoG6JUB00sZ2h2QBI';
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) { this.error.set('Stripe failed to load.'); return; }

      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1e293b',
            fontFamily: 'system-ui, sans-serif',
            '::placeholder': { color: '#94a3b8' }
          }
        }
      });

      this.cardElement.mount('#card-element');
      this.cardElement.on('change', (event: any) => {
        const errDiv = document.getElementById('card-errors');
        if (errDiv) errDiv.textContent = event.error ? event.error.message : '';
      });
      this.stripeReady = true;
    } catch (err) {
      this.error.set('Failed to load payment form. Please refresh.');
    }
  }

  async pay() {
    if (!this.stripe || !this.cardElement) {
      this.error.set('Payment form not ready. Please wait.');
      return;
    }

    this.loading.set(true); this.error.set('');
    const b = this.booking()!;

    // Step 1: Create PaymentIntent on backend
    this.paymentSvc.createIntent({ amount: b.finalPrice, currency: 'usd' }).subscribe({
      next: async ({ clientSecret }) => {
        // Step 2: Confirm card payment via Stripe.js (card details sent securely to Stripe)
        const result = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: this.cardElement }
        });

        if (result.error) {
          this.error.set(result.error.message || 'Payment failed');
          this.loading.set(false);
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          // Step 3: Confirm on backend to update booking status
          const piId = result.paymentIntent.id;
          this.paymentSvc.confirm({
            paymentIntentId: piId,
            bookingId: b.id,
            bookingType: 'hotel',
            expectedAmount: b.finalPrice
          }).subscribe({
            next: () => { 
              this.paymentDone.set(true); 
              sessionStorage.removeItem('pendingHotelBooking'); // Cleanup on success
              this.loading.set(false); 
            },
            error: e => { this.error.set(e.error?.message || 'Confirmation failed'); this.loading.set(false); }
          });
        } else {
          this.error.set('Payment was not completed. Please try again.');
          this.loading.set(false);
        }
      },
      error: e => { this.error.set(e.error?.message || 'Payment init failed'); this.loading.set(false); }
    });
  }
}
