import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserType } from '../../../core/models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
<h2 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 24px">Create account</h2>
<form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:14px">
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Full Name</label>
    <input formControlName="fullName" placeholder="Ahmed Hassan" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
  </div>
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Email</label>
    <input formControlName="email" type="email" placeholder="you@example.com" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
  </div>
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Phone</label>
    <input formControlName="phoneNumber" placeholder="+201000000000" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
  </div>
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:6px">Password</label>
    <input formControlName="password" type="password" placeholder="Min 8 characters" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
  </div>

  <!-- Account Type -->
  <div>
    <label style="display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:8px">Account Type</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label [style.border-color]="form.value.userType===1?'#2563eb':'#d1d5db'"
        [style.background]="form.value.userType===1?'#eff6ff':'#fff'"
        style="padding:12px;border:2px solid;border-radius:8px;cursor:pointer;display:block">
        <input type="radio" formControlName="userType" [value]="1" style="display:none">
        <span style="font-size:1.25rem;display:block">👤</span>
        <span style="font-size:.875rem;font-weight:600;color:#1e293b;display:block;margin-top:4px">Personal</span>
        <span style="font-size:.75rem;color:#64748b">B2C — pay as you go</span>
      </label>
      <label [style.border-color]="form.value.userType===2?'#7c3aed':'#d1d5db'"
        [style.background]="form.value.userType===2?'#f5f3ff':'#fff'"
        style="padding:12px;border:2px solid;border-radius:8px;cursor:pointer;display:block">
        <input type="radio" formControlName="userType" [value]="2" style="display:none">
        <span style="font-size:1.25rem;display:block">🏢</span>
        <span style="font-size:.875rem;font-weight:600;color:#1e293b;display:block;margin-top:4px">Agency</span>
        <span style="font-size:.75rem;color:#64748b">B2B — discounts + wallet</span>
      </label>
    </div>
    @if (form.value.userType === 2) {
      <p style="font-size:.78rem;color:#d97706;background:#fffbeb;padding:8px 12px;border-radius:6px;margin-top:8px">
        ⚠️ B2B accounts require admin approval before booking.
      </p>
    }
  </div>

  @if (error) {
    <div style="background:#fee2e2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:.875rem">{{error}}</div>
  }

  <button type="submit" [disabled]="loading"
    style="padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer"
    [style.opacity]="loading?'0.7':'1'">
    {{loading ? 'Creating account…' : 'Create Account'}}
  </button>
</form>
<p style="text-align:center;margin-top:16px;font-size:.875rem;color:#6b7280">
  Have an account? <a routerLink="/auth/login" style="color:#2563eb;font-weight:600">Sign in →</a>
</p>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullName:    ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password:    ['', [Validators.required, Validators.minLength(8)]],
      userType:    [1]
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.register(this.form.value).subscribe({
      next: res => {
        if (res.userType === UserType.B2B && !res.isApproved)
          this.router.navigate(['/b2b/pending-approval']);
        else
          this.router.navigate(['/dashboard']);
      },
      error: err => { this.error = err.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
