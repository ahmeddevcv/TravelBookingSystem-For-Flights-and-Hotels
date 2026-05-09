import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  FlightSearchParams, FlightBookingDto, FlightBooking,
  HotelSearchParams, HotelBookingDto, HotelBooking,
  PaymentIntentDto, PaymentConfirmDto, CancellationResult,
  NotificationResponse, CreateNotificationDto,
  DashboardStats, UserManagement, CreateAdminDto,
  AuthResponse, AdminBookingsPage, AdminBookingDetail,
  AdminBookingFilters, UpcomingFlight, AdminReports
} from '../models/models';

// ─── Flight Service ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class FlightService {
  private url = `${environment.apiUrl}/flights`;
  constructor(private http: HttpClient) {}

  search(params: FlightSearchParams) {
    const p = new HttpParams({ fromObject: params as any });
    return this.http.get<any>(`${this.url}/search`, { params: p });
  }

  book(dto: FlightBookingDto) {
    return this.http.post<FlightBooking>(`${this.url}/book`, dto);
  }

  myBookings() {
    return this.http.get<FlightBooking[]>(`${this.url}/my-bookings`);
  }

  cancel(id: number) {
    return this.http.delete<CancellationResult>(`${this.url}/${id}`);
  }
}

// ─── Hotel Service ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class HotelService {
  private url = `${environment.apiUrl}/hotels`;
  constructor(private http: HttpClient) {}

  // Autocomplete: fetch matching city/destination suggestions for the typeahead dropdown
  searchDestinations(query: string) {
    return this.http.get<any>(`${this.url}/destinations`, { params: { query } });
  }

  search(params: HotelSearchParams) {
    const p = new HttpParams({ fromObject: params as any });
    return this.http.get<any>(`${this.url}/search`, { params: p });
  }

  book(dto: HotelBookingDto) {
    return this.http.post<HotelBooking>(`${this.url}/book`, dto);
  }

  myBookings() {
    return this.http.get<HotelBooking[]>(`${this.url}/my-bookings`);
  }

  cancel(id: number) {
    return this.http.delete<CancellationResult>(`${this.url}/${id}`);
  }
}

// ─── Payment Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private url = `${environment.apiUrl}/payment`;
  constructor(private http: HttpClient) {}

  createIntent(dto: PaymentIntentDto) {
    return this.http.post<{ clientSecret: string }>(`${this.url}/create-intent`, dto);
  }

  confirm(dto: PaymentConfirmDto) {
    return this.http.post<{ message: string; bookingId: number; amountCharged: number }>(
      `${this.url}/confirm`, dto
    );
  }
}

// ─── Notification Service ─────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private url = `${environment.apiUrl}/notifications`;
  constructor(private http: HttpClient) {}

  getAll(onlyUnread = false) {
    const p = new HttpParams().set('onlyUnread', onlyUnread.toString());
    return this.http.get<NotificationResponse>(this.url, { params: p });
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.url}/unread-count`);
  }

  markRead(id: number) {
    return this.http.put(`${this.url}/${id}/read`, {});
  }

  markAllRead() {
    return this.http.put(`${this.url}/mark-all-read`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}

// ─── B2B Service ──────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class B2BService {
  private url = `${environment.apiUrl}/b2b`;
  constructor(private http: HttpClient) {}

  getWallet() {
    return this.http.get<{ balance: number }>(`${this.url}/wallet`);
  }

  topup(dto: PaymentIntentDto) {
    return this.http.post<{ clientSecret: string }>(`${this.url}/topup`, dto);
  }

  confirmTopup(dto: any) {
    return this.http.post<{ message: string }>(`${this.url}/confirm-topup`, dto);
  }

  getReports() {
    return this.http.get<any>(`${this.url}/reports`);
  }
}

// ─── Admin Service ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminService {
  private url     = `${environment.apiUrl}/admin`;
  private authUrl = `${environment.apiUrl}/admin-auth`;
  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<DashboardStats>(`${this.url}/dashboard`);
  }

  getUsers() {
    return this.http.get<UserManagement[]>(`${this.url}/users`);
  }

  getPendingB2B() {
    return this.http.get<UserManagement[]>(`${this.url}/pending-b2b`);
  }

  approveB2B(userId: number) {
    return this.http.put<{ message: string }>(`${this.url}/approve-b2b/${userId}`, {});
  }

  updateSetting(key: string, value: number) {
    return this.http.put<{ message: string }>(`${this.url}/settings/${key}`, value);
  }

  sendNotification(dto: CreateNotificationDto) {
    return this.http.post<{ message: string }>(`${this.url}/notifications/send`, dto);
  }

  createAdmin(dto: CreateAdminDto) {
    return this.http.post<AuthResponse>(`${this.authUrl}/create`, dto);
  }

  // ── New: Bookings management ──────────────────────────────────────────

  getAllBookings(filters: AdminBookingFilters) {
    let p = new HttpParams();
    if (filters.status)   p = p.set('status', filters.status);
    if (filters.type)     p = p.set('type', filters.type);
    if (filters.search)   p = p.set('search', filters.search);
    if (filters.from)     p = p.set('from', filters.from);
    if (filters.to)       p = p.set('to', filters.to);
    if (filters.page)     p = p.set('page', filters.page.toString());
    if (filters.pageSize) p = p.set('pageSize', filters.pageSize.toString());
    return this.http.get<AdminBookingsPage>(`${this.url}/bookings`, { params: p });
  }

  getBookingDetail(type: string, id: number) {
    return this.http.get<AdminBookingDetail>(`${this.url}/bookings/${type}/${id}`);
  }

  adminCancelBooking(type: string, id: number, reason?: string) {
    return this.http.put<any>(`${this.url}/bookings/${type}/${id}/cancel`, { reason });
  }

  getUpcomingFlights() {
    return this.http.get<UpcomingFlight[]>(`${this.url}/flights/upcoming`);
  }

  getReports(from?: string, to?: string) {
    let p = new HttpParams();
    if (from) p = p.set('from', from);
    if (to)   p = p.set('to', to);
    return this.http.get<AdminReports>(`${this.url}/reports`, { params: p });
  }
}
