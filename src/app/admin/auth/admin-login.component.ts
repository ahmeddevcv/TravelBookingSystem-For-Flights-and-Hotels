import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
<div style="min-height:100vh;background:#0f172a;display:flex;align-items:center;justify-content:center;padding:16px">
  <div style="width:100%;max-width:400px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:3rem;margin-bottom:8px">⚙️</div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#fff;margin:0 0 4px">Admin Portal</h1>
      <p style="color:#64748b;font-size:.875rem;margin:0">Restricted access — administrators only</p>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155">
      <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;font-size:.875rem;font-weight:500;color:#94a3b8;margin-bottom:6px">Admin Email</label>
          <input formControlName="email" type="email" placeholder="admin@travelbooking.com"
            style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;font-size:.875rem;color:#e2e8f0;box-sizing:border-box">
        </div>
        <div>
          <label style="display:block;font-size:.875rem;font-weight:500;color:#94a3b8;margin-bottom:6px">Password</label>
          <input formControlName="password" type="password" placeholder="••••••••"
            style="width:100%;padding:10px 14px;background:#0f172a;border:1.5px solid #334155;border-radius:8px;font-size:.875rem;color:#e2e8f0;box-sizing:border-box">
        </div>

        @if (error) {
          <div style="background:#450a0a;color:#fca5a5;padding:10px 14px;border-radius:8px;font-size:.875rem">{{error}}</div>
        }

        <button type="submit" [disabled]="loading"
          style="padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer"
          [style.opacity]="loading?'0.7':'1'">
          {{loading ? 'Signing in…' : '🔐 Admin Sign In'}}
        </button>
      </form>
    </div>
    <p style="text-align:center;margin-top:16px">
      <a href="/auth/login" style="color:#64748b;font-size:.875rem;text-decoration:none">← Back to User Portal</a>
    </p>
  </div>
</div>
  `
})
export class AdminLoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.adminLogin(this.form.value).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => { this.error = err.error?.message || 'Admin login failed'; this.loading = false; }
    });
  }
}
