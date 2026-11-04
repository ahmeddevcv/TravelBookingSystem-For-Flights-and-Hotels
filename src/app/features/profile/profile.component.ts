import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.services';
import { UserProfile, UserType, UpdateProfileDto, ChangePasswordDto } from '../../core/models/models';
import { environment } from '../../../environments/environment';

type ProfileTab = 'personal' | 'travel' | 'agency' | 'security';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div style="max-width:880px;margin:0 auto">
  <!-- Page Title -->
  <div style="margin-bottom:24px">
    <h1 style="font-size:1.75rem;font-weight:700;color:#1e293b;margin:0 0 6px">Account & Profile Settings</h1>
    <p style="color:#64748b;font-size:.9rem;margin:0">Manage your personal information, travel documents, and security credentials.</p>
  </div>

  @if (loading) {
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:48px;text-align:center;color:#64748b">
      <div style="font-size:1.5rem;margin-bottom:8px">⏳</div>
      Loading profile details...
    </div>
  } @else {
    <!-- Profile Header Card -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:center;gap:20px">
        <div style="position:relative">
          @if (profile?.profilePictureUrl) {
            <img [src]="getAvatarUrl(profile?.profilePictureUrl)" alt="Avatar"
              style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid #2563eb;box-shadow:0 4px 12px rgba(37,99,235,.2)">
          } @else {
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg, #2563eb, #3b82f6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;box-shadow:0 4px 12px rgba(37,99,235,.2)">
              {{profile?.fullName?.[0]?.toUpperCase() || 'U'}}
            </div>
          }
          <button (click)="fileInput.click()" [disabled]="uploadingAvatar" title="Upload profile picture"
            style="position:absolute;bottom:-4px;right:-4px;background:#2563eb;color:#fff;border:2px solid #fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.8rem;box-shadow:0 2px 6px rgba(0,0,0,.2)">
            {{uploadingAvatar ? '⏳' : '📷'}}
          </button>
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" style="display:none">
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <h2 style="font-size:1.35rem;font-weight:700;color:#1e293b;margin:0">{{profile?.fullName}}</h2>
            <span style="font-size:.75rem;padding:3px 10px;border-radius:999px;font-weight:600"
              [style.background]="isB2B ? '#ede9fe' : '#eff6ff'"
              [style.color]="isB2B ? '#6d28d9' : '#1d4ed8'">
              {{typeLabel(profile?.userType!)}}
            </span>
            <span style="font-size:.75rem;padding:3px 10px;border-radius:999px;font-weight:600"
              [style.background]="profile?.isApproved ? '#ecfdf5' : '#fef3c7'"
              [style.color]="profile?.isApproved ? '#047857' : '#b45309'">
              {{profile?.isApproved ? '✅ Active' : '⏳ Pending Approval'}}
            </span>
          </div>
          <p style="color:#64748b;font-size:.875rem;margin:4px 0 0">{{profile?.email}} • Member since {{formatDate(profile?.createdAt)}}</p>
          <button (click)="fileInput.click()" [disabled]="uploadingAvatar"
            style="margin-top:6px;padding:3px 10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;font-size:.75rem;font-weight:600;color:#334155;cursor:pointer">
            {{uploadingAvatar ? 'Uploading picture...' : '📷 Change Picture'}}
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:10px">
        @if (isB2B) {
          <div style="text-align:right;padding-right:16px;border-right:1px solid #e2e8f0">
            <span style="font-size:.75rem;color:#64748b;display:block">Wallet Balance</span>
            <span style="font-size:1.15rem;font-weight:700;color:#059669">\${{profile?.walletBalance?.toFixed(2)}}</span>
          </div>
        }
        <button (click)="auth.logout()"
          style="padding:8px 16px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px">
          🚪 Logout
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display:flex;gap:8px;border-bottom:1px solid #e2e8f0;margin-bottom:24px;overflow-x:auto">
      <button (click)="activeTab = 'personal'"
        [style.border-bottom]="activeTab === 'personal' ? '2px solid #2563eb' : '2px solid transparent'"
        [style.color]="activeTab === 'personal' ? '#2563eb' : '#64748b'"
        style="padding:10px 18px;background:none;border:none;font-size:.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap">
        👤 Personal Info
      </button>

      <button (click)="activeTab = 'travel'"
        [style.border-bottom]="activeTab === 'travel' ? '2px solid #2563eb' : '2px solid transparent'"
        [style.color]="activeTab === 'travel' ? '#2563eb' : '#64748b'"
        style="padding:10px 18px;background:none;border:none;font-size:.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap">
        ✈️ Travel Documents
      </button>

      @if (isB2B) {
        <button (click)="activeTab = 'agency'"
          [style.border-bottom]="activeTab === 'agency' ? '2px solid #2563eb' : '2px solid transparent'"
          [style.color]="activeTab === 'agency' ? '#2563eb' : '#64748b'"
          style="padding:10px 18px;background:none;border:none;font-size:.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap">
          🏢 Agency Details
        </button>
      }

      <button (click)="activeTab = 'security'"
        [style.border-bottom]="activeTab === 'security' ? '2px solid #2563eb' : '2px solid transparent'"
        [style.color]="activeTab === 'security' ? '#2563eb' : '#64748b'"
        style="padding:10px 18px;background:none;border:none;font-size:.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap">
        🔒 Security
      </button>
    </div>

    <!-- TAB 1: PERSONAL INFORMATION -->
    @if (activeTab === 'personal') {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px">
        <h3 style="font-size:1.15rem;font-weight:700;color:#1e293b;margin:0 0 16px">Personal Details</h3>

        @if (profileSuccess) {
          <div style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px;display:flex;align-items:center;gap:8px">
            ✅ {{profileSuccess}}
          </div>
        }
        @if (profileError) {
          <div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px">
            ❌ {{profileError}}
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" style="display:flex;flex-direction:column;gap:18px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:18px">
            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Full Name *</label>
              <input formControlName="fullName" type="text"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box"
                [style.border-color]="profileForm.get('fullName')?.invalid && profileSubmitted ? '#ef4444' : '#d1d5db'">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Email Address</label>
              <input [value]="profile?.email" disabled type="email"
                style="width:100%;padding:10px 14px;background:#f3f4f6;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.875rem;color:#6b7280;box-sizing:border-box;cursor:not-allowed">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Phone Number</label>
              <input formControlName="phoneNumber" type="tel" placeholder="+1234567890"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Date of Birth</label>
              <input formControlName="dateOfBirth" type="date"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Gender</label>
              <select formControlName="gender"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;background:#fff;box-sizing:border-box">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <hr style="border:none;border-top:1px solid #f1f5f9;margin:8px 0">

          <h4 style="font-size:1rem;font-weight:600;color:#1e293b;margin:0">Home Address</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:18px">
            <div style="grid-column: 1 / -1">
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Street Address</label>
              <input formControlName="address" type="text" placeholder="123 Main Street, Apt 4B"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">City</label>
              <input formControlName="city" type="text" placeholder="Cairo"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Country</label>
              <input formControlName="country" type="text" placeholder="Egypt"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:12px">
            <button type="submit" [disabled]="savingProfile"
              style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer"
              [style.opacity]="savingProfile ? '0.7' : '1'">
              {{savingProfile ? 'Saving Changes...' : 'Save Personal Details'}}
            </button>
          </div>
        </form>
      </div>
    }

    <!-- TAB 2: TRAVEL DOCUMENTS -->
    @if (activeTab === 'travel') {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px">
        <h3 style="font-size:1.15rem;font-weight:700;color:#1e293b;margin:0 0 6px">Passport & Travel Documents</h3>
        <p style="color:#64748b;font-size:.875rem;margin:0 0 20px">
          💡 Storing your passport information speeds up checkout for international flight and hotel bookings.
        </p>

        @if (profileSuccess) {
          <div style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px;display:flex;align-items:center;gap:8px">
            ✅ {{profileSuccess}}
          </div>
        }
        @if (profileError) {
          <div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px">
            ❌ {{profileError}}
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" style="display:flex;flex-direction:column;gap:18px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:18px">
            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Nationality</label>
              <input formControlName="nationality" type="text" placeholder="e.g. Egyptian, American, British"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Passport Number</label>
              <input formControlName="passportNumber" type="text" placeholder="e.g. A12345678"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Passport Expiration Date</label>
              <input formControlName="passportExpiryDate" type="date"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:12px">
            <button type="submit" [disabled]="savingProfile"
              style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer"
              [style.opacity]="savingProfile ? '0.7' : '1'">
              {{savingProfile ? 'Saving...' : 'Save Travel Documents'}}
            </button>
          </div>
        </form>
      </div>
    }

    <!-- TAB 3: B2B AGENCY DETAILS -->
    @if (activeTab === 'agency' && isB2B) {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <h3 style="font-size:1.15rem;font-weight:700;color:#1e293b;margin:0 0 4px">Agency Business Profile</h3>
            <p style="color:#64748b;font-size:.875rem;margin:0">Commercial details used for invoices, booking vouchers, and tax reporting.</p>
          </div>
          <a routerLink="/b2b/wallet" style="padding:8px 14px;background:#ede9fe;color:#7c3aed;text-decoration:none;border-radius:8px;font-size:.85rem;font-weight:600">
            💳 Manage Wallet
          </a>
        </div>

        @if (profileSuccess) {
          <div style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px;display:flex;align-items:center;gap:8px">
            ✅ {{profileSuccess}}
          </div>
        }
        @if (profileError) {
          <div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px">
            ❌ {{profileError}}
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" style="display:flex;flex-direction:column;gap:18px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:18px">
            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Company / Agency Name</label>
              <input formControlName="companyName" type="text" placeholder="Global Travel Co."
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>

            <div>
              <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Tax / Commercial Registration No.</label>
              <input formControlName="taxNumber" type="text" placeholder="TX-987654321"
                style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box">
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:12px">
            <button type="submit" [disabled]="savingProfile"
              style="padding:10px 24px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer"
              [style.opacity]="savingProfile ? '0.7' : '1'">
              {{savingProfile ? 'Saving...' : 'Save Agency Profile'}}
            </button>
          </div>
        </form>
      </div>
    }

    <!-- TAB 4: SECURITY -->
    @if (activeTab === 'security') {
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px;max-width:560px">
        <h3 style="font-size:1.15rem;font-weight:700;color:#1e293b;margin:0 0 6px">Change Password</h3>
        <p style="color:#64748b;font-size:.875rem;margin:0 0 20px">Choose a strong password with at least 6 characters.</p>

        @if (passwordSuccess) {
          <div style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px;display:flex;align-items:center;gap:8px">
            ✅ {{passwordSuccess}}
          </div>
        }
        @if (passwordError) {
          <div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;padding:12px 16px;border-radius:8px;font-size:.875rem;margin-bottom:20px">
            ❌ {{passwordError}}
          </div>
        }

        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" style="display:flex;flex-direction:column;gap:16px">
          <div>
            <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Current Password *</label>
            <input formControlName="currentPassword" type="password" placeholder="••••••••"
              style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box"
              [style.border-color]="passwordForm.get('currentPassword')?.invalid && passwordSubmitted ? '#ef4444' : '#d1d5db'">
          </div>

          <div>
            <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">New Password *</label>
            <input formControlName="newPassword" type="password" placeholder="At least 6 characters"
              style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box"
              [style.border-color]="passwordForm.get('newPassword')?.invalid && passwordSubmitted ? '#ef4444' : '#d1d5db'">
          </div>

          <div>
            <label style="display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px">Confirm New Password *</label>
            <input formControlName="confirmNewPassword" type="password" placeholder="Re-type new password"
              style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:.875rem;box-sizing:border-box"
              [style.border-color]="(passwordForm.get('confirmNewPassword')?.invalid || passwordForm.hasError('mismatch')) && passwordSubmitted ? '#ef4444' : '#d1d5db'">
            @if (passwordForm.hasError('mismatch') && passwordSubmitted) {
              <span style="color:#ef4444;font-size:.75rem;margin-top:4px;display:block">Passwords do not match.</span>
            }
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:8px">
            <button type="submit" [disabled]="savingPassword"
              style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer"
              [style.opacity]="savingPassword ? '0.7' : '1'">
              {{savingPassword ? 'Updating Password...' : 'Update Password'}}
            </button>
          </div>
        </form>
      </div>
    }
  }
</div>
  `
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  activeTab: ProfileTab = 'personal';

  profileForm!: FormGroup;
  profileSubmitted = false;
  savingProfile = false;
  profileSuccess = '';
  profileError = '';
  uploadingAvatar = false;

  passwordForm!: FormGroup;
  passwordSubmitted = false;
  savingPassword = false;
  passwordSuccess = '';
  passwordError = '';

  get isB2B(): boolean {
    return this.profile?.userType === UserType.B2B;
  }

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.loadProfile();
  }

  private initForms() {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [''],
      dateOfBirth: [''],
      gender: [''],
      nationality: [''],
      passportNumber: [''],
      passportExpiryDate: [''],
      address: [''],
      city: [''],
      country: [''],
      companyName: [''],
      taxNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    const pw = g.get('newPassword')?.value;
    const confirm = g.get('confirmNewPassword')?.value;
    return pw && confirm && pw !== confirm ? { mismatch: true } : null;
  }

  loadProfile() {
    this.loading = true;
    this.profileError = '';
    this.userService.getProfile().subscribe({
      next: res => {
        this.profile = res;
        this.loading = false;
        this.populateForm(res);
      },
      error: err => {
        this.loading = false;
        this.profileError = err?.error?.message || 'Failed to load profile details.';
      }
    });
  }

  private populateForm(p: UserProfile) {
    this.profileForm.patchValue({
      fullName: p.fullName || '',
      phoneNumber: p.phoneNumber || '',
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : '',
      gender: p.gender || '',
      nationality: p.nationality || '',
      passportNumber: p.passportNumber || '',
      passportExpiryDate: p.passportExpiryDate ? p.passportExpiryDate.substring(0, 10) : '',
      address: p.address || '',
      city: p.city || '',
      country: p.country || '',
      companyName: p.companyName || '',
      taxNumber: p.taxNumber || ''
    });
  }

  saveProfile() {
    this.profileSubmitted = true;
    this.profileSuccess = '';
    this.profileError = '';

    if (this.profileForm.invalid) return;

    this.savingProfile = true;
    const v = this.profileForm.value;
    const dto: UpdateProfileDto = {
      fullName: v.fullName,
      phoneNumber: v.phoneNumber || null,
      profilePictureUrl: this.profile?.profilePictureUrl || null,
      dateOfBirth: v.dateOfBirth ? new Date(v.dateOfBirth).toISOString() : null,
      gender: v.gender || null,
      nationality: v.nationality || null,
      passportNumber: v.passportNumber || null,
      passportExpiryDate: v.passportExpiryDate ? new Date(v.passportExpiryDate).toISOString() : null,
      address: v.address || null,
      city: v.city || null,
      country: v.country || null,
      companyName: v.companyName || null,
      taxNumber: v.taxNumber || null
    };

    this.userService.updateProfile(dto).subscribe({
      next: updated => {
        this.profile = updated;
        this.savingProfile = false;
        this.profileSuccess = 'Profile details updated successfully!';
        this.populateForm(updated);
        // Sync navbar name and avatar
        this.auth.updateCurrentUserFullName(updated.fullName);
        if (updated.profilePictureUrl) {
          this.auth.updateCurrentUserAvatar(this.getAvatarUrl(updated.profilePictureUrl));
        }
        setTimeout(() => this.profileSuccess = '', 4000);
      },
      error: err => {
        this.savingProfile = false;
        this.profileError = err?.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  changePassword() {
    this.passwordSubmitted = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    if (this.passwordForm.invalid) return;

    this.savingPassword = true;
    const dto: ChangePasswordDto = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmNewPassword: this.passwordForm.value.confirmNewPassword
    };

    this.userService.changePassword(dto).subscribe({
      next: res => {
        this.savingPassword = false;
        this.passwordSuccess = res?.message || 'Password changed successfully!';
        this.passwordForm.reset();
        this.passwordSubmitted = false;
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: err => {
        this.savingPassword = false;
        this.passwordError = err?.error?.message || 'Failed to change password. Please verify current password.';
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.profileError = 'Image file size must be less than 5MB.';
      return;
    }

    this.uploadingAvatar = true;
    this.profileError = '';
    this.profileSuccess = '';

    this.userService.uploadAvatar(file).subscribe({
      next: res => {
        this.uploadingAvatar = false;
        const fullAvatar = this.getAvatarUrl(res.profilePictureUrl);
        if (this.profile) {
          this.profile.profilePictureUrl = fullAvatar;
        }
        this.auth.updateCurrentUserAvatar(fullAvatar);
        this.profileSuccess = 'Profile picture updated successfully!';
        setTimeout(() => this.profileSuccess = '', 4000);
      },
      error: err => {
        this.uploadingAvatar = false;
        this.profileError = err?.error?.message || 'Failed to upload profile picture. Please try another image.';
      }
    });
  }

  getAvatarUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  typeLabel(t: UserType): string {
    return t === 1 ? 'Personal (B2C)' : t === 2 ? 'Travel Agency (B2B)' : 'Administrator';
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  }
}
