import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlightService } from '../../../core/services/api.services';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
<div>
  <!-- Hero Search -->
  <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:16px;padding:32px;margin-bottom:24px">
    <h1 style="color:#fff;font-size:1.75rem;font-weight:700;margin:0 0 4px">Find Flights ✈️</h1>
    <p style="color:#bfdbfe;margin:0 0 16px">Search real-time fares powered by Skyscanner</p>
    
    <!-- Info message for users to know they can type IATA codes directly -->
    <div style="background:rgba(255,255,255,0.1);padding:10px 14px;border-radius:8px;margin-bottom:20px;font-size:.85rem;color:#e0e7ff;display:flex;align-items:center;gap:8px">
      <span style="font-size:1.1rem">💡</span> 
      <span><strong>Tip:</strong> Select an airport from the list or manually type any 3-letter IATA code (e.g., <strong>CAI</strong> for Cairo, <strong>LAX</strong> for Los Angeles).</span>
    </div>

    <form [formGroup]="form" (ngSubmit)="search()" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:12px;align-items:end">
      <!-- Added a standard HTML5 datalist for native dropdown autocomplete -->
      <datalist id="airportsList">
        <option value="Cairo (CAI)"></option>
        <option value="London (LHR)"></option>
        <option value="New York (JFK)"></option>
        <option value="Dubai (DXB)"></option>
        <option value="Paris (CDG)"></option>
        <option value="Frankfurt (FRA)"></option>
        <option value="Riyadh (RUH)"></option>
        <option value="Jeddah (JED)"></option>
        <option value="Istanbul (IST)"></option>
        <option value="Amman (AMM)"></option>
      </datalist>

      <div>
        <label style="color:#bfdbfe;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">From</label>
        <input formControlName="origin" list="airportsList" placeholder="e.g. Cairo (CAI)" autocomplete="off"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;font-weight:600;box-sizing:border-box">
      </div>
      <div>
        <label style="color:#bfdbfe;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">To</label>
        <input formControlName="destination" list="airportsList" placeholder="e.g. London (LHR)" autocomplete="off"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;font-weight:600;box-sizing:border-box">
      </div>
      <div>
        <label style="color:#bfdbfe;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">Departure</label>
        <input formControlName="departureDate" type="date"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
      </div>
      <div>
        <label style="color:#bfdbfe;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">Passengers</label>
        <input formControlName="adults" type="number" min="1" max="9"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
      </div>
      <button type="submit" [disabled]="loading()"
        style="padding:10px 24px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:700;cursor:pointer;white-space:nowrap">
        {{loading() ? '⏳' : '🔍 Search'}}
      </button>
    </form>
  </div>

  <!-- Error -->
  @if (error()) {
    <div style="background:#fee2e2;color:#dc2626;padding:14px 18px;border-radius:10px;margin-bottom:16px">⚠️ {{error()}}</div>
  }

  <!-- Results -->
  @if (results().length > 0) {
    <h2 style="font-size:1.1rem;font-weight:600;color:#1e293b;margin:0 0 16px">{{results().length}} flights found</h2>
    <div style="display:flex;flex-direction:column;gap:12px">
      @for (flight of results(); track $index) {
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;gap:24px">
            <div>
              <div style="font-size:1.25rem;font-weight:700;color:#1e293b">{{getOrigin(flight)}} → {{getDest(flight)}}</div>
              <div style="font-size:.8rem;color:#64748b;margin-top:2px">{{getDuration(flight)}} · {{getStops(flight)}}</div>
            </div>
            <div style="font-size:.85rem;color:#475569">
              <div>🛫 {{getDeparture(flight)}}</div>
              <div>🛬 {{getArrival(flight)}}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.5rem;font-weight:700;color:#059669">\${{getPrice(flight)}}</div>
            <div style="font-size:.75rem;color:#94a3b8;margin-bottom:8px">per person</div>
            <button (click)="selectFlight(flight)"
              style="padding:8px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer">
              Book Now →
            </button>
          </div>
        </div>
      }
    </div>
  }

  <!-- Empty state -->
  @if (!loading() && results().length === 0 && searched()) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:3rem;margin-bottom:12px">✈️</div>
      <p>No flights found. Try different dates or airports.</p>
    </div>
  }

  @if (!searched() && !loading()) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:3rem;margin-bottom:12px">🔍</div>
      <p>Enter origin, destination and date to search flights.</p>
      <p style="font-size:.8rem;margin-top:8px">Use IATA codes: CAI (Cairo), LHR (London), JFK (New York), DXB (Dubai)</p>
    </div>
  }
</div>
  `
})
export class FlightSearchComponent {
  form: FormGroup;
  results  = signal<any[]>([]);
  loading  = signal(false);
  error    = signal('');
  searched = signal(false);

  constructor(private fb: FormBuilder, private flightSvc: FlightService, private router: Router) {
    this.form = this.fb.group({
      origin:        ['', [Validators.required]],
      destination:   ['', [Validators.required]],
      departureDate: ['', Validators.required],
      adults:        [1]
    });
  }

  // Extracts IATA code from "City (IATA)" or raw string
  private extractIata(input: string): string {
    if (!input) return '';
    const match = input.match(/\(([A-Z]{3})\)/i);
    return match ? match[1].toUpperCase() : input.trim().toUpperCase().substring(0, 3);
  }

  search() {
    this.error.set(''); this.results.set([]); this.searched.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);

    const searchParams = {
      ...this.form.value,
      origin: this.extractIata(this.form.value.origin),
      destination: this.extractIata(this.form.value.destination)
    };

    this.flightSvc.search(searchParams).subscribe({
      next: (res: any) => {
        const itins = res?.data?.itineraries || res?.itineraries || res?.data || [];
        this.results.set(Array.isArray(itins) ? itins : []);
        this.loading.set(false);
      },
      error: err => { this.error.set(err.error?.message || 'Search failed'); this.loading.set(false); }
    });
  }

  selectFlight(flight: any) {
    // Store selected flight in sessionStorage for the booking page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    sessionStorage.setItem('flightSearchForm', JSON.stringify(this.form.value));
    sessionStorage.removeItem('pendingFlightBooking'); // Clear any previous pending booking
    this.router.navigate(['/flights/book']);
  }

  // SkyScrapper response field helpers
  getPrice(f: any)     { return f?.price?.raw || f?.price?.formatted || '—'; }
  getOrigin(f: any)    { return f?.legs?.[0]?.origin?.displayCode || this.form.value.origin; }
  getDest(f: any)      { return f?.legs?.[0]?.destination?.displayCode || this.form.value.destination; }
  getDuration(f: any)  { const m = f?.legs?.[0]?.durationInMinutes; return m ? `${Math.floor(m/60)}h ${m%60}m` : '—'; }
  getStops(f: any)     { const s = f?.legs?.[0]?.stopCount; return s===0 ? 'Non-stop' : `${s} stop${s>1?'s':''}`; }
  getDeparture(f: any) { const d = f?.legs?.[0]?.departure; return d ? new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'; }
  getArrival(f: any)   { const a = f?.legs?.[0]?.arrival;   return a ? new Date(a).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'; }
}
