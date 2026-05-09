import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Notification, NotificationType } from '../models/models';

/**
 * Real-time notification service using SignalR.
 *
 * CONNECT: Call connect(token) after login.
 * DISCONNECT: Call disconnect() on logout.
 *
 * Exposes:
 *   latestNotification signal — new notifications as they arrive
 *   unreadCount signal        — increments on each new notification
 */
@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private hub: signalR.HubConnection | null = null;

  // Reactive signals — components read these directly
  latestNotification = signal<Notification | null>(null);
  unreadCount        = signal<number>(0);
  isConnected        = signal<boolean>(false);

  /**
   * Connects to the SignalR hub using the user's JWT access token.
   * The backend extracts the token from ?access_token= query param
   * (WebSocket connections cannot set Authorization headers).
   *
   * Call this right after a successful login.
   */
  connect(token: string, initialUnreadCount = 0) {
    this.unreadCount.set(initialUnreadCount);

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}?access_token=${token}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])  // retry intervals ms
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for new notifications pushed by backend NotificationService
    this.hub.on('NewNotification', (notification: Notification) => {
      this.latestNotification.set(notification);
      this.unreadCount.update(c => c + 1);

      // Show browser toast/notification (if browser supports it)
      this.showBrowserNotification(notification);
    });

    this.hub.onreconnected(() => this.isConnected.set(true));
    this.hub.onclose(()      => this.isConnected.set(false));

    this.hub.start()
      .then(() => this.isConnected.set(true))
      .catch(err => console.error('SignalR connection failed:', err));
  }

  disconnect() {
    this.hub?.stop();
    this.hub = null;
    this.isConnected.set(false);
    this.unreadCount.set(0);
  }

  decrementUnread() {
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  resetUnread() {
    this.unreadCount.set(0);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private showBrowserNotification(n: Notification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const icon = n.type === NotificationType.Success ? '✅'
               : n.type === NotificationType.Warning  ? '⚠️'
               : n.type === NotificationType.Error    ? '❌'
               : 'ℹ️';

    new Notification(`${icon} ${n.title}`, {
      body: n.message,
      icon: '/assets/logo.png'
    });
  }
}
