import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserType } from '../models/models';

/** Requires any authenticated user. Redirects to /auth/login if not logged in. */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login']);
  return false;
};

/**
 * Requires Admin role.
 * Redirects to /admin/login if not authenticated,
 * or to /dashboard if authenticated but not admin.
 */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }
  if (!auth.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

/**
 * Requires B2B role AND IsApproved = true.
 * Shows friendly message if pending approval.
 */
export const b2bGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (auth.currentUser()?.userType !== UserType.B2B) {
    router.navigate(['/dashboard']);
    return false;
  }
  if (!auth.isApproved()) {
    // Redirect to a pending-approval info page
    router.navigate(['/b2b/pending-approval']);
    return false;
  }
  return true;
};

/** General authenticated-and-approved guard (blocks unapproved B2B). */
export const approvedGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  // B2B must be approved to access booking features
  if (auth.isB2B() && !auth.isApproved()) {
    router.navigate(['/b2b/pending-approval']);
    return false;
  }
  return true;
};
