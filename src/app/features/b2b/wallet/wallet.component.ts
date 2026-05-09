import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { B2BService } from '../../../core/services/api.services';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:480px">
  <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">💳 B2B Wallet</h1>
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px;padding:28px;margin-bottom:24px;color:#fff">
    <p style="margin:0 0 4px;opacity:.8;font-size:.875rem">Current Balance</p>
    <div style="font-size:2.5rem;font-weight:800">\${{balance() | number:'1.2-2'}}</div>
  </div>

  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
    <h2 style="font-size:1rem;font-weight:600;color:#1e293b;margin:0 0 16px">Top Up Wallet</h2>
    @if (msg()) {
      <div [style.background]="ok()?'#f0fdf4':'#fee2e2'" [style.color]="ok()?'#166534':'#dc2626'"
        style="padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:.875rem">{{msg()}}</div>
    }

    @if (!topupStarted) {
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        @for (preset of [100,250,500,1000]; track preset) {
          <button (click)="amount=preset"
            [style.background]="amount===preset?'#7c3aed':'#f1f5f9'"
            [style.color]="amount===preset?'#fff':'#374151'"
            style="padding:8px 16px;border:none;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer">
            \${{preset}}
          </button>
        }
      </div>
      <input type="number" [(ngModel)]="amount" min="10" placeholder="Or enter custom amount"
        style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box;margin-bottom:12px">
      <button (click)="startTopup()" [disabled]="loading() || amount < 10"
        style="width:100%;padding:12px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer"
        [style.opacity]="loading()?'0.7':'1'">
        {{loading() ? 'Processing…' : 'Proceed to Payment →'}}
      </button>
    } @else {
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px">
        <h3 style="font-size:.95rem;font-weight:600;margin:0 0 4px">Payment for $\{{amount}}</h3>
        <p style="font-size:.8rem;color:#64748b;margin:0 0 16px">Enter your card details to complete the top-up.</p>
        
        <div id="wallet-card-element" style="background:#fff;border:1px solid #cbd5e1;padding:12px;border-radius:6px;min-height:42px;margin-bottom:8px"></div>
        <div id="card-errors" style="color:#dc2626;font-size:.8rem;min-height:20px;margin-bottom:16px"></div>
        
        <div style="display:flex;gap:12px">
            <button (click)="cancelTopup()" [disabled]="loading()"
                style="flex:1;padding:12px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer">
                Cancel
            </button>
            <button (click)="confirmPayment()" [disabled]="loading() || !stripeReady"
                style="flex:2;padding:12px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer"
                [style.opacity]="(loading() || !stripeReady)?'0.7':'1'">
                {{loading() ? 'Processing…' : 'Pay $\\{{amount}}'}}
            </button>
        </div>
      </div>
    }
  </div>
</div>
  `
})
export class WalletComponent implements OnInit {
  balance = signal(0);
  amount  = 250;
  loading = signal(false);
  msg     = signal('');
  ok      = signal(true);

  stripe: any;
  cardElement: any;
  stripeReady = false;
  topupStarted = false;
  clientSecret = '';

  constructor(private b2bSvc: B2BService) {}

  ngOnInit() { this.b2bSvc.getWallet().subscribe(r => this.balance.set(r.balance)); }

  startTopup() {
    this.loading.set(true); this.msg.set('');
    this.b2bSvc.topup({ amount: this.amount, currency: 'usd' }).subscribe({
      next: (res) => {
        this.clientSecret = res.clientSecret;
        this.topupStarted = true;
        this.loading.set(false);
        setTimeout(() => this.mountStripeCard(), 100);
      },
      error: e => { this.msg.set(e.error?.message || 'Top-up init failed'); this.ok.set(false); this.loading.set(false); }
    });
  }

  private async mountStripeCard() {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const publishableKey = 'pk_test_51OnIQZG3C5uEFs6dT5zG1D0P2nDbDIeIhquy3Cn9CX2vt2eZyhtJTQacXqWgKb0ruGImYv44YZuyjvkCKZoG6JUB00sZ2h2QBI';
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) { this.msg.set('Stripe failed to load.'); this.ok.set(false); return; }

      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: { fontSize: '16px', color: '#1e293b', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#94a3b8' } }
        }
      });

      this.cardElement.mount('#wallet-card-element');
      this.cardElement.on('change', (event: any) => {
        const errDiv = document.getElementById('card-errors');
        if (errDiv) errDiv.textContent = event.error ? event.error.message : '';
      });
      this.stripeReady = true;
    } catch (err) {
      this.msg.set('Failed to load payment form.');
      this.ok.set(false);
    }
  }

  async confirmPayment() {
    if (!this.stripeReady || !this.stripe || !this.cardElement) return;
    this.loading.set(true); this.msg.set('');

    const result = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: { card: this.cardElement }
    });

    if (result.error) {
      this.msg.set(result.error.message || 'Payment failed');
      this.ok.set(false);
      this.loading.set(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      this.b2bSvc.confirmTopup({
        paymentIntentId: result.paymentIntent.id,
        expectedAmount: this.amount
      }).subscribe({
        next: () => {
          this.balance.update(b => b + this.amount);
          this.msg.set(`Successfully added $${this.amount} to your wallet!`);
          this.ok.set(true);
          this.loading.set(false);
          this.topupStarted = false;
        },
        error: e => { this.msg.set(e.error?.message || 'Confirmation failed'); this.ok.set(false); this.loading.set(false); }
      });
    } else {
      this.msg.set('Payment was not completed. Please try again.');
      this.ok.set(false);
      this.loading.set(false);
    }
  }

  cancelTopup() {
      this.topupStarted = false;
      this.clientSecret = '';
      this.msg.set('');
  }
}
