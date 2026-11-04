import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto, RefreshTokenDto, UserType } from '../models/models';

const TOKEN_KEY         = 'tb_access_token';
const REFRESH_KEY       = 'tb_refresh_token';
const TOKEN_EXPIRES_KEY = 'tb_token_expires';
const USER_KEY          = 'tb_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  // Reactive state using Angular 17 signals
  currentUser = signal<AuthResponse | null>(this.loadUser());
  isLoggedIn  = computed(() => this.currentUser() !== null);
  isAdmin     = computed(() => this.currentUser()?.userType === UserType.Admin);
  isB2B       = computed(() => this.currentUser()?.userType === UserType.B2B);
  isApproved  = computed(() => this.currentUser()?.isApproved ?? false);

  // Timer handle for proactive token refresh
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // On service init, schedule refresh for existing session
    this.scheduleTokenRefresh();
  }

  // ─── User Portal ──────────────────────────────────────────────────────────

  register(dto: RegisterDto) {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, dto)
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, dto)
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  // ─── Admin Portal ─────────────────────────────────────────────────────────

  adminLogin(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${this.api}/admin-auth/login`, dto)
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  // ─── Token Management ─────────────────────────────────────────────────────

  refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    const endpoint = this.isAdmin()
      ? `${this.api}/admin-auth/refresh`
      : `${this.api}/auth/refresh`;

    return this.http.post<AuthResponse>(endpoint, { refreshToken } as RefreshTokenDto)
      .pipe(
        tap(res => this.handleAuthResponse(res)),
        catchError(err => {
          // Refresh failed — session expired, force logout
          this.logout();
          return throwError(() => err);
        })
      );
  }

  logout() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const endpoint = this.isAdmin()
      ? `${this.api}/admin-auth/logout`
      : `${this.api}/auth/logout`;
    const dest = this.isAdmin() ? '/admin/login' : '/auth/login';

    const finalize = () => {
      this.clearSession();
      this.router.navigate([dest]);
    };

    if (refreshToken) {
      this.http.post(endpoint, { refreshToken }).subscribe({
        next: () => finalize(),
        error: () => finalize()
      });
    } else {
      finalize();
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const exp = localStorage.getItem(TOKEN_EXPIRES_KEY);
    if (!exp) return true;
    return new Date(exp) <= new Date();
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  updateCurrentUserFullName(newName: string) {
    const cur = this.currentUser();
    if (cur) {
      const updated = { ...cur, fullName: newName };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      this.currentUser.set(updated);
    }
  }

  updateCurrentUserAvatar(avatarUrl: string) {
    const cur = this.currentUser();
    if (cur) {
      const updated = { ...cur, profilePictureUrl: avatarUrl };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      this.currentUser.set(updated);
    }
  }

  private handleAuthResponse(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY,         res.token);
    localStorage.setItem(REFRESH_KEY,       res.refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_KEY, res.tokenExpiresAt);
    localStorage.setItem(USER_KEY,          JSON.stringify(res));
    this.currentUser.set(res);
    this.scheduleTokenRefresh();
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /** Schedules a proactive token refresh 60 seconds before expiry. */
  private scheduleTokenRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    const exp = localStorage.getItem(TOKEN_EXPIRES_KEY);
    if (!exp) return;

    const msUntilRefresh = new Date(exp).getTime() - Date.now() - 60_000;
    if (msUntilRefresh <= 0) {
      // Already expired or about to — refresh immediately
      this.refreshToken().subscribe({ error: () => {} });
      return;
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshToken().subscribe({ error: () => {} });
    }, msUntilRefresh);
  }
}
