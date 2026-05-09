import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../../core/services/api.services';

// RxJS operators for the debounced autocomplete pipeline
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-hotel-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
<div>
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px;padding:32px;margin-bottom:24px">
    <h1 style="color:#fff;font-size:1.75rem;font-weight:700;margin:0 0 4px">Find Hotels 🏨</h1>
    <p style="color:#e9d5ff;margin:0 0 24px">Search real-time rates powered by Skyscanner</p>
    <form [formGroup]="form" (ngSubmit)="search()" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:12px;align-items:end">

      <!-- City input with autocomplete dropdown -->
      <div style="position:relative">
        <label style="color:#e9d5ff;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">City</label>
        <input formControlName="city" placeholder="Paris, London, New York…"
          (input)="onCityInput($event)"
          (focus)="onCityFocus()"
          (blur)="onCityBlur()"
          (keydown.escape)="showSuggestions = false"
          (keydown.arrowdown)="onArrowDown($event)"
          (keydown.arrowup)="onArrowUp($event)"
          (keydown.enter)="onEnterKey($event)"
          autocomplete="off"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">

        <!-- Autocomplete suggestion dropdown — shows matching cities from Sky-Scrapper API -->
        @if (showSuggestions && suggestions().length > 0) {
          <div style="position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e2e8f0;
                      border-radius:0 0 10px 10px;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:50;
                      max-height:220px;overflow-y:auto;margin-top:-2px">
            @for (s of suggestions(); track $index) {
              <div (mousedown)="selectCity(s)"
                [style.background]="highlightedIndex === $index ? '#f5f3ff' : '#fff'"
                style="padding:10px 14px;cursor:pointer;font-size:.875rem;border-bottom:1px solid #f1f5f9;
                       transition:background .15s;display:flex;align-items:center;gap:8px"
                (mouseenter)="highlightedIndex = $index">
                <span style="font-size:1rem">📍</span>
                <span>{{ getEntityName(s) }}</span>
              </div>
            }
          </div>
        }

        <!-- Loading indicator while fetching suggestions -->
        @if (suggestionsLoading()) {
          <div style="position:absolute;right:10px;top:50%;transform:translateY(25%);font-size:.75rem;color:#a78bfa">⏳</div>
        }
      </div>

      <div>
        <label style="color:#e9d5ff;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">Check-in</label>
        <input formControlName="checkIn" type="date"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
      </div>
      <div>
        <label style="color:#e9d5ff;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">Check-out</label>
        <input formControlName="checkOut" type="date"
          style="width:100%;padding:10px 14px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
      </div>
      <div>
        <label style="color:#e9d5ff;font-size:.8rem;font-weight:500;display:block;margin-bottom:4px">Guests / Rooms</label>
        <div style="display:flex;gap:4px">
          <input formControlName="guests" type="number" min="1" placeholder="Guests"
            style="width:50%;padding:10px 8px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
          <input formControlName="rooms" type="number" min="1" placeholder="Rooms"
            style="width:50%;padding:10px 8px;border-radius:8px;border:none;font-size:.875rem;box-sizing:border-box">
        </div>
      </div>
      <button type="submit" [disabled]="loading()"
        style="padding:10px 24px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:700;cursor:pointer;white-space:nowrap">
        {{loading() ? '⏳' : '🔍 Search'}}
      </button>
    </form>
  </div>

  @if (error()) {
    <div style="background:#fee2e2;color:#dc2626;padding:14px 18px;border-radius:10px;margin-bottom:16px">⚠️ {{error()}}</div>
  }

  @if (results().length > 0) {
    <h2 style="font-size:1.1rem;font-weight:600;color:#1e293b;margin:0 0 16px">{{results().length}} hotels found</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      @for (hotel of results(); track $index) {
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)">
          <div style="background:linear-gradient(135deg,#e0e7ff,#ddd6fe);height:120px;display:flex;align-items:center;justify-content:center;font-size:3rem">🏨</div>
          <div style="padding:16px">
            <h3 style="font-size:1rem;font-weight:600;color:#1e293b;margin:0 0 4px">{{getName(hotel)}}</h3>
            <p style="font-size:.8rem;color:#64748b;margin:0 0 12px">⭐ {{getRating(hotel)}} · {{getCity(hotel)}}</p>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                @if (hasDiscount(hotel)) {
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                    <span style="text-decoration:line-through;color:#94a3b8;font-size:.85rem">{{getOriginalPrice(hotel)}}</span>
                    <span style="background:#fef08a;color:#854d0e;padding:2px 6px;border-radius:4px;font-size:.7rem;font-weight:700">{{getDiscountLabel(hotel)}}</span>
                  </div>
                }
                <span style="font-size:1.25rem;font-weight:700;color:#059669">{{getPrice(hotel)}}</span>
                <span style="font-size:.75rem;color:#94a3b8"> / night</span>
              </div>
              <button (click)="selectHotel(hotel)"
                style="padding:8px 16px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer">
                Book →
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  }

  @if (!loading() && results().length === 0 && searched()) {
    <div style="text-align:center;padding:48px;color:#94a3b8">
      <div style="font-size:3rem;margin-bottom:12px">🏨</div>
      <p>No hotels found. Try a different city or dates.</p>
    </div>
  }
</div>
  `
})
export class HotelSearchComponent implements OnInit, OnDestroy {
  form: FormGroup;
  results  = signal<any[]>([]);
  loading  = signal(false);
  error    = signal('');
  searched = signal(false);

  // ── Autocomplete state ──────────────────────────────────────────────────
  // Holds the list of destination suggestions returned from the API
  suggestions        = signal<any[]>([]);
  // Controls whether the dropdown is visible
  showSuggestions     = false;
  // Tracks which suggestion is highlighted via arrow keys
  highlightedIndex    = -1;
  // Shows a small loading spinner inside the input while fetching suggestions
  suggestionsLoading = signal(false);

  // RxJS Subject: every keystroke pushes a value here, then debounceTime
  // ensures we only call the API after the user stops typing for 300ms
  private cityInput$ = new Subject<string>();
  private citySub!: Subscription;

  constructor(private fb: FormBuilder, private hotelSvc: HotelService, private router: Router) {
    this.form = this.fb.group({
      city:     ['', Validators.required],
      checkIn:  ['', Validators.required],
      checkOut: ['', Validators.required],
      guests:   [1],
      rooms:    [1]
    });
  }

  ngOnInit() {
    // Set up the debounced autocomplete pipeline:
    // 1. Wait 300ms after user stops typing (debounceTime)
    // 2. Skip if same value as before (distinctUntilChanged)
    // 3. Cancel previous in-flight request and start a new one (switchMap)
    // 4. If API fails, return empty — autocomplete should never block the user
    this.citySub = this.cityInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        // Only call API if user typed at least 2 characters
        if (query.length < 2) {
          this.suggestionsLoading.set(false);
          return of({ data: [] });
        }
        this.suggestionsLoading.set(true);
        return this.hotelSvc.searchDestinations(query).pipe(
          catchError(() => of({ data: [] }))
        );
      })
    ).subscribe((res: any) => {
      const data = res?.data || [];
      this.suggestions.set(data);
      this.showSuggestions = data.length > 0;
      this.highlightedIndex = -1;
      this.suggestionsLoading.set(false);
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to avoid memory leaks
    this.citySub?.unsubscribe();
  }

  // ── Autocomplete event handlers ─────────────────────────────────────────

  // Push the current input value into the Subject to trigger the debounced pipeline
  onCityInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.cityInput$.next(val);
  }

  // Re-show dropdown if there are cached suggestions when the input is focused
  onCityFocus() {
    if (this.suggestions().length > 0) {
      this.showSuggestions = true;
    }
  }

  // Hide dropdown on blur — small delay so mousedown on a suggestion registers first
  onCityBlur() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  // When user clicks a suggestion, fill the city input and close the dropdown
  selectCity(suggestion: any) {
    const name = this.getEntityName(suggestion);
    this.form.patchValue({ city: name });
    this.suggestions.set([]);
    this.showSuggestions = false;
    this.highlightedIndex = -1;
  }

  // Extract the display name from a suggestion object
  // searchAirport returns names in presentation.title or presentation.suggestionTitle
  getEntityName(s: any): string {
    return s?.presentation?.title || s?.presentation?.suggestionTitle || s?.navigation?.localizedName || s?.entityName || s?.name || 'Unknown';
  }

  // Arrow-down: move highlight down in the suggestions list
  onArrowDown(event: Event) {
    event.preventDefault();
    if (this.suggestions().length > 0) {
      this.highlightedIndex = (this.highlightedIndex + 1) % this.suggestions().length;
    }
  }

  // Arrow-up: move highlight up in the suggestions list
  onArrowUp(event: Event) {
    event.preventDefault();
    if (this.suggestions().length > 0) {
      this.highlightedIndex = this.highlightedIndex <= 0
        ? this.suggestions().length - 1
        : this.highlightedIndex - 1;
    }
  }

  // Enter: select the currently highlighted suggestion (if any)
  onEnterKey(event: Event) {
    if (this.highlightedIndex >= 0 && this.highlightedIndex < this.suggestions().length) {
      event.preventDefault();
      this.selectCity(this.suggestions()[this.highlightedIndex]);
    }
  }

  // ── Hotel search (unchanged logic) ──────────────────────────────────────

  search() {
    this.error.set(''); this.results.set([]); this.searched.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.hotelSvc.search(this.form.value).subscribe({
      next: (res: any) => {
        const hotels = res?.data?.hotels || res?.hotels || res?.data || [];
        this.results.set(Array.isArray(hotels) ? hotels : []);
        this.loading.set(false);
      },
      error: e => { 
        if (e.status === 0) {
          this.error.set('Frontend Error: Could not connect to the backend server. Please check your network or if the backend is running.');
        } else {
          this.error.set(e.error?.message || `Backend Error: HTTP ${e.status}`);
        }
        this.loading.set(false); 
      }
    });
  }

  selectHotel(hotel: any) {
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
    sessionStorage.setItem('hotelSearchForm', JSON.stringify(this.form.value));
    sessionStorage.removeItem('pendingHotelBooking'); // Clear any previous pending booking
    this.router.navigate(['/hotels/book']);
  }

  getName(h: any)   { return h?.name || h?.hotel?.name || 'Unknown Hotel'; }
  getCity(h: any)   { return h?.city || this.form.value.city; }
  getRating(h: any) { return h?.reviewScore || h?.stars || h?.rating || '—'; }
  
  getPrice(h: any) { 
    if (typeof h?.price === 'string') return h.price; // Example: "$76"
    return h?.price?.lead?.amount ? `$${h.price.lead.amount}` : (h?.offers?.[0]?.price?.total ? `$${h.offers[0].price.total}` : '—'); 
  }

  hasDiscount(h: any) { return !!h?.cug?.discount; }
  getDiscountLabel(h: any) { return h?.cug?.discount; }
  getOriginalPrice(h: any) { return h?.cug?.priceWithoutDiscount; }
}
