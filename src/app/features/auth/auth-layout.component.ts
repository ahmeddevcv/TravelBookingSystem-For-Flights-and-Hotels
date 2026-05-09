import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
<div style="min-height:100vh;background:linear-gradient(135deg,#1e40af,#7c3aed);display:flex;align-items:center;justify-content:center;padding:16px">
  <div style="width:100%;max-width:440px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-size:2rem;font-weight:800;color:#fff;margin:0 0 8px">✈️ TravelBook</h1>
      <p style="color:#bfdbfe;font-size:.95rem;margin:0">Your journey starts here</p>
    </div>
    <div style="background:#fff;border-radius:20px;padding:32px;box-shadow:0 24px 48px rgba(0,0,0,.25)">
      <router-outlet />
    </div>
    <p style="text-align:center;margin-top:16px;color:#bfdbfe;font-size:.875rem">
      Admin? <a routerLink="/admin/login" style="color:#fff;font-weight:600">Go to Admin Portal →</a>
    </p>
  </div>
</div>
  `
})
export class AuthLayoutComponent {}
