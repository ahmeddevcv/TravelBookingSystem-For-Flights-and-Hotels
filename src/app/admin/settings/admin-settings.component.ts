import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/api.services';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <h1 style="font-size:1.5rem;font-weight:700;color:#e2e8f0;margin:0 0 8px">⚙️ System Settings</h1>
  <p style="color:#64748b;margin:0 0 24px">Configure commission rates and cancellation policy.</p>

  @if (msg()) {
    <div [style.background]="msgType()==='ok'?'#14532d':'#450a0a'" [style.color]="msgType()==='ok'?'#86efac':'#fca5a5'"
      style="padding:12px 16px;border-radius:8px;margin-bottom:16px">{{msg()}}</div>
  }

  <div style="display:grid;gap:16px;max-width:480px">
    @for (s of settings; track s.key) {
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px">
        <label style="display:block;font-size:.875rem;font-weight:600;color:#e2e8f0;margin-bottom:4px">{{s.label}}</label>
        <p style="font-size:.8rem;color:#64748b;margin:0 0 12px">{{s.description}}</p>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="number" [(ngModel)]="s.value" [min]="s.min" [max]="s.max" step="0.5"
            style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;color:#e2e8f0;font-size:.875rem">
          <span style="color:#64748b;font-size:.875rem;white-space:nowrap">{{s.unit}}</span>
          <button (click)="save(s.key, s.value)"
            style="padding:10px 18px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap">
            Save
          </button>
        </div>
      </div>
    }
  </div>
</div>
  `
})
export class AdminSettingsComponent {
  msg     = signal('');
  msgOk   = signal(true);
  msgType = signal<'ok'|'err'>('ok');

  settings = [
    { key: 'B2C_Commission',         label: 'B2C Commission %',          description: 'Platform commission charged on B2C bookings.',   value: 5,  min: 0, max: 50, unit: '%' },
    { key: 'B2B_Commission',         label: 'B2B Commission %',          description: 'Platform commission charged on B2B bookings.',   value: 8,  min: 0, max: 50, unit: '%' },
    { key: 'B2B_Discount',           label: 'B2B Discount %',            description: 'Discount given to B2B users on original price.', value: 10, min: 0, max: 50, unit: '%' },
    { key: 'CancellationFeePercent', label: 'Cancellation Fee %',        description: 'Fee charged when cancelling inside the free window.', value: 25, min: 0, max: 100, unit: '%' },
    { key: 'FreeCancelWindowHours',  label: 'Free Cancel Window (Hours)',description: 'Hours before departure/checkin for free cancellation.', value: 48, min: 0, max: 720, unit: 'hrs' },
  ];

  constructor(private adminSvc: AdminService) {}

  save(key: string, value: number) {
    this.adminSvc.updateSetting(key, value).subscribe({
      next: r => { this.msg.set(r.message); this.msgType.set('ok'); setTimeout(() => this.msg.set(''), 3000); },
      error: e => { this.msg.set(e.error?.message || 'Failed'); this.msgType.set('err'); }
    });
  }
}
