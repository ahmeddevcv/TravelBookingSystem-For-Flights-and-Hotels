import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [RouterLink],
  template: `
<div style="max-width:560px;margin:80px auto;text-align:center">
  <div style="font-size:4rem;margin-bottom:16px">⏳</div>
  <h1 style="font-size:1.75rem;font-weight:700;color:#1e293b;margin:0 0 12px">Account Pending Approval</h1>
  <p style="color:#64748b;font-size:1rem;line-height:1.6;margin:0 0 24px">
    Your B2B travel agency account is under review by our admin team.
    You will receive a notification as soon as it is approved.
    This usually takes up to 24 hours.
  </p>
  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px;margin-bottom:24px;text-align:left">
    <p style="font-weight:600;color:#92400e;margin:0 0 4px">What happens next?</p>
    <ul style="color:#78350f;font-size:.875rem;margin:0;padding-left:20px">
      <li>Admin reviews your agency details</li>
      <li>You get notified via email and in-app notification</li>
      <li>Once approved, you get B2B pricing with 10% discount + wallet access</li>
    </ul>
  </div>
  <a routerLink="/notifications" style="padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
    🔔 Check Notifications
  </a>
</div>
  `
})
export class PendingApprovalComponent {}
