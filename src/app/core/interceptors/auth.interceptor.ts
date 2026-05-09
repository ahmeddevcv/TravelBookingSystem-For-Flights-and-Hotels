import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * JWT Interceptor — functional style (Angular 17+).
 * 1. Attaches Authorization: Bearer <token> to every outgoing request.
 * 2. On 401: attempts one token refresh, retries the request with new token.
 * 3. If refresh also fails: clears session and redirects to login.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Skip auth header for auth endpoints (login, register, refresh), but NOT for logout
  const isAuthEndpoint = (req.url.includes('/auth/') || req.url.includes('/admin-auth/')) && !req.url.includes('/logout');
  const token          = authService.getAccessToken();

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint) {
        // Access token expired — try refreshing once
        return authService.refreshToken().pipe(
          switchMap(newAuth => {
            // Retry original request with new token
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAuth.token}` }
            });
            return next(retried);
          }),
          catchError(refreshErr => {
            // Refresh also failed — session is over
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
