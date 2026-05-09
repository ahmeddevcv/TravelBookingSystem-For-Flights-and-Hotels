// ─── Enums (must match backend exactly) ──────────────────────────────────────
export enum UserType { B2C = 1, B2B = 2, Admin = 3 }
export enum BookingStatus { Pending = 1, Confirmed = 2, Cancelled = 3, Completed = 4 }
export enum NotificationType { Success = 1, Info = 2, Warning = 3, Error = 4 }

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  userType: UserType;  // Only B2C (1) or B2B (2) — Admin blocked on public register
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  userType: UserType;
  isApproved: boolean;
  token: string;           // Access token — 15 min lifetime
  refreshToken: string;    // Refresh token — 7 day lifetime
  tokenExpiresAt: string;  // ISO UTC string — schedule refresh before this
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ─── Flights ──────────────────────────────────────────────────────────────────
export interface FlightSearchParams {
  origin: string;       // IATA code e.g. "CAI"
  destination: string;  // IATA code e.g. "LHR"
  departureDate: string;  // yyyy-MM-dd
  returnDate?: string;
  adults: number;
}

export interface FlightBookingDto {
  flightDataJson: string;   // Serialized flight offer from SkyScrapper
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  price: number;
}

export interface FlightBooking {
  id: number;
  userId: number;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  originalPrice: number;
  finalPrice: number;
  commission: number;
  discount: number;
  status: BookingStatus;
  bookingDate: string;
  cancellationReason?: string;
  stripePaymentIntentId?: string;
}

// ─── Hotels ───────────────────────────────────────────────────────────────────
export interface HotelSearchParams {
  city: string;       // City name e.g. "Paris"
  checkIn: string;    // yyyy-MM-dd
  checkOut: string;
  rooms: number;
  guests: number;
}

export interface HotelBookingDto {
  hotelDataJson: string;
  hotelName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  price: number;
}

export interface HotelBooking {
  id: number;
  userId: number;
  hotelName: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: number;
  guests: number;
  originalPrice: number;
  finalPrice: number;
  commission: number;
  discount: number;
  status: BookingStatus;
  bookingDate: string;
  cancellationReason?: string;
  stripePaymentIntentId?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface PaymentIntentDto {
  amount: number;
  currency: string;
}

export interface PaymentConfirmDto {
  paymentIntentId: string;
  bookingId: number;
  bookingType: 'flight' | 'hotel';
  expectedAmount: number;
}

export interface CancellationResult {
  bookingId: number;
  bookingType: string;
  originalAmount: number;
  cancellationFee: number;
  refundAmount: number;
  isFreeCancel: boolean;
  message: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  flightBookingId?: number;   // deep-link → /bookings/flights/:id
  hotelBookingId?: number;    // deep-link → /bookings/hotels/:id
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalB2CUsers: number;
  totalB2BUsers: number;
  pendingB2BApprovals: number;
  totalFlightBookings: number;
  totalHotelBookings: number;
  totalRevenue: number;
  totalCommissions: number;
  // Enhanced
  totalRefunds: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
}

export interface UserManagement {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  userType: UserType;
  isApproved: boolean;
  isActive: boolean;
  walletBalance: number;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId?: number;
  userIds?: number[];
  title: string;
  message: string;
  type: NotificationType;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

// ─── Admin Bookings ───────────────────────────────────────────────────────────
export interface AdminBookingRow {
  id: number;
  type: string;
  userName: string;
  userEmail: string;
  userType: UserType;
  route: string;
  eventDate: string;
  originalPrice: number;
  finalPrice: number;
  commission: number;
  status: BookingStatus;
  bookingDate: string;
}

export interface AdminBookingsPage {
  bookings: AdminBookingRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminBookingDetail {
  id: number;
  type: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userType: UserType;
  route: string;
  eventDate: string;
  returnDate?: string;
  passengersOrGuests: number;
  rooms?: number;
  originalPrice: number;
  finalPrice: number;
  commission: number;
  discount: number;
  status: BookingStatus;
  bookingDate: string;
  cancellationReason?: string;
  stripePaymentIntentId?: string;
}

export interface UpcomingFlight {
  bookingId: number;
  route: string;
  departureDate: string;
  passengers: number;
  userName: string;
  finalPrice: number;
  status: BookingStatus;
}

// ─── Admin Reports ────────────────────────────────────────────────────────────
export interface AdminReports {
  totalRevenue: number;
  totalCommissions: number;
  totalRefunds: number;
  netIncome: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  flightRevenue: number;
  hotelRevenue: number;
  flightCommissions: number;
  hotelCommissions: number;
  cancellationFees: number;
  monthlyTrend: MonthlyRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  commissions: number;
  refunds: number;
}

export interface AdminBookingFilters {
  status?: string;
  type?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
