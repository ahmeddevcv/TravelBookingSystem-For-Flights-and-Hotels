import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserType } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div style="max-width:480px">
  <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">My Profile</h1>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <div style="width:56px;height:56px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#fff;font-weight:700">
        {{auth.currentUser()?.fullName?.[0]?.toUpperCase()}}
      </div>
      <div>
        <h2 style="font-size:1.1rem;font-weight:700;color:#1e293b;margin:0">{{auth.currentUser()?.fullName}}</h2>
        <p style="color:#64748b;font-size:.875rem;margin:2px 0 0">{{auth.currentUser()?.email}}</p>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;font-size:.875rem">
      <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Account Type</span>
        <span style="font-weight:600">{{typeLabel(auth.currentUser()?.userType!)}}</span>
      </div>
      <div style="display:flex;justify-content:space-between"><span style="color:#64748b">Status</span>
        <span [style.color]="auth.currentUser()?.isApproved?'#059669':'#d97706'" style="font-weight:600">
          {{auth.currentUser()?.isApproved ? '✅ Active' : '⏳ Pending Approval'}}
        </span>
      </div>
      <div style="display:flex;justify-content:space-between"><span style="color:#64748b">User ID</span>
        <span style="font-weight:600">#{{auth.currentUser()?.userId}}</span>
      </div>
    </div>
    <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0">
    <button (click)="auth.logout()" style="width:100%;padding:10px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer">
      🚪 Logout
    </button>
  </div>
</div>
  `
})
export class ProfileComponent {
  constructor(public auth: AuthService) {}
  typeLabel(t: UserType) { return t===1?'Personal (B2C)':t===2?'Travel Agency (B2B)':'Administrator'; }
}
