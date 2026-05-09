import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserType } from '../../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
<h2 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">Welcome back</h2>
<form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:16px">
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Email</label>
    <input formControlName="email" type="email" placeholder="you@example.com"
      style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box;outline:none"
      [style.border-color]="form.get('email')?.invalid && submitted ? '#ef4444' : '#d1d5db'">
  </div>
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Password</label>
    <input formControlName="password" type="password" placeholder="••••••••"
      style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box;outline:none">
  </div>

  @if (error) {
    <div style="background:#fee2e2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:.875rem">{{error}}</div>
  }

  <button type="submit" [disabled]="loading"
    style="padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer;opacity:1"
    [style.opacity]="loading ? '0.7' : '1'">
    {{loading ? 'Signing in…' : 'Sign In'}}
  </button>
</form>
<p style="text-align:center;margin-top:20px;font-size:.875rem;color:#6b7280">
  No account? <a routerLink="/auth/register" style="color:#2563eb;font-weight:600">Create one →</a>
</p>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.error = err.error?.message || 'Login failed'; this.loading = false; }
    });
  }
}
