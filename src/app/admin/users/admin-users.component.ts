import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/api.services';
import { UserManagement, UserType } from '../../core/models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <h1 style="font-size:1.5rem;font-weight:700;color:#e2e8f0;margin:0 0 8px">👥 User Management</h1>
  <p style="color:#64748b;margin:0 0 24px">{{pendingCount()}} B2B account(s) pending approval</p>

  @if (successMsg()) {
    <div style="background:#14532d;color:#86efac;padding:12px 16px;border-radius:8px;margin-bottom:16px">✅ {{successMsg()}}</div>
  }

  <div style="overflow:auto">
    <table style="width:100%;border-collapse:collapse;font-size:.875rem">
      <thead>
        <tr style="border-bottom:1px solid #334155">
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Name</th>
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Email</th>
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Type</th>
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Status</th>
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Wallet</th>
          <th style="text-align:left;padding:12px;color:#94a3b8;font-weight:500">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (u of users(); track u.id) {
          <tr style="border-bottom:1px solid #1e293b">
            <td style="padding:12px;color:#e2e8f0">{{u.fullName}}</td>
            <td style="padding:12px;color:#94a3b8">{{u.email}}</td>
            <td style="padding:12px">
              <span [style.background]="typeBg(u.userType)" [style.color]="typeColor(u.userType)"
                style="padding:2px 8px;border-radius:999px;font-size:.75rem;font-weight:600">
                {{typeLabel(u.userType)}}
              </span>
            </td>
            <td style="padding:12px">
              <span [style.background]="u.isApproved?'#14532d':'#422006'" [style.color]="u.isApproved?'#86efac':'#fbbf24'"
                style="padding:2px 8px;border-radius:999px;font-size:.75rem;font-weight:600">
                {{u.isApproved ? 'Approved' : 'Pending'}}
              </span>
            </td>
            <td style="padding:12px;color:#e2e8f0">\${{u.walletBalance | number:'1.2-2'}}</td>
            <td style="padding:12px">
              @if (u.userType === 2 && !u.isApproved) {
                <button (click)="approve(u.id)" style="padding:6px 14px;background:#4f46e5;color:#fff;border:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer">Approve ✓</button>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>
  `
})
export class AdminUsersComponent implements OnInit {
  users      = signal<UserManagement[]>([]);
  successMsg = signal('');

  constructor(private adminSvc: AdminService) {}

  ngOnInit() { this.adminSvc.getUsers().subscribe(u => this.users.set(u)); }

  pendingCount() { return this.users().filter(u => u.userType === UserType.B2B && !u.isApproved).length; }

  approve(id: number) {
    this.adminSvc.approveB2B(id).subscribe({
      next: () => {
        this.successMsg.set('B2B user approved successfully.');
        this.users.update(us => us.map(u => u.id === id ? { ...u, isApproved: true } : u));
        setTimeout(() => this.successMsg.set(''), 4000);
      }
    });
  }

  typeLabel(t: UserType) { return t===1?'B2C':t===2?'B2B':'Admin'; }
  typeBg(t: UserType)    { return t===1?'#1e3a5f':t===2?'#2e1065':'#1e1b4b'; }
  typeColor(t: UserType) { return t===1?'#93c5fd':t===2?'#c4b5fd':'#a5b4fc'; }
}
