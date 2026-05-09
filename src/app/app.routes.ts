import { Routes } from '@angular/router';
import { authGuard, adminGuard, b2bGuard, approvedGuard } from './core/guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // ── User Auth ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ── User Portal (authenticated) ────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./shared/components/user-layout.component').then(m => m.UserLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',             loadComponent: () => import('./features/flights/search/flight-search.component').then(m => m.FlightSearchComponent) },
      { path: 'flights',               loadComponent: () => import('./features/flights/search/flight-search.component').then(m => m.FlightSearchComponent) },
      { path: 'flights/book',          loadComponent: () => import('./features/flights/booking/flight-booking.component').then(m => m.FlightBookingComponent), canActivate: [approvedGuard] },
      { path: 'hotels',                loadComponent: () => import('./features/hotels/search/hotel-search.component').then(m => m.HotelSearchComponent) },
      { path: 'hotels/book',           loadComponent: () => import('./features/hotels/booking/hotel-booking.component').then(m => m.HotelBookingComponent), canActivate: [approvedGuard] },
      { path: 'bookings',              loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent) },
      { path: 'notifications',         loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'payment',               loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent), canActivate: [approvedGuard] },
      { path: 'profile',               loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'b2b/wallet',            loadComponent: () => import('./features/b2b/wallet/wallet.component').then(m => m.WalletComponent), canActivate: [b2bGuard] },
      { path: 'b2b/reports',           loadComponent: () => import('./features/b2b/reports/reports.component').then(m => m.ReportsComponent), canActivate: [b2bGuard] },
      { path: 'b2b/pending-approval',  loadComponent: () => import('./features/b2b/pending/pending-approval.component').then(m => m.PendingApprovalComponent) },
    ]
  },

  // ── Admin Portal (completely separated) ────────────────────────────────
  { path: 'admin/login', loadComponent: () => import('./admin/auth/admin-login.component').then(m => m.AdminLoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./shared/components/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'bookings',      loadComponent: () => import('./admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent) },
      { path: 'bookings/:type/:id', loadComponent: () => import('./admin/bookings/booking-detail.component').then(m => m.BookingDetailComponent) },
      { path: 'reports',       loadComponent: () => import('./admin/reports/admin-reports.component').then(m => m.AdminReportsComponent) },
      { path: 'users',         loadComponent: () => import('./admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'settings',      loadComponent: () => import('./admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: 'notifications', loadComponent: () => import('./admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent) },
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
