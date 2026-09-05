import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface RealtimeNotificationEvent {
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  id?: string;
  _id?: string;
}

export interface SseMessageEvent {
  data: RealtimeNotificationEvent;
  type?: string;
  id?: string;
  retry?: number;
}

@Injectable()
export class NotificationEventsService {
  private readonly notificationSubject = new Subject<RealtimeNotificationEvent>();

  /**
   * Emit a new notification event to all connected subscribers
   */
  emitNotification(event: RealtimeNotificationEvent) {
    this.notificationSubject.next(event);
  }

  /**
   * Get filtered real-time notification stream for a specific user.
   * Admin-only events (e.g. product reviews) are never pushed to customers.
   */
  getNotificationStream(userId: string, isAdmin = false): Observable<SseMessageEvent> {
    return this.notificationSubject.asObservable().pipe(
      filter((event) => {
        const isAdminEvent = Boolean(event.metadata?.isAdminEvent);
        const isReviewEvent =
          event.metadata?.targetTab === 'reviews' ||
          Boolean(event.metadata?.reviewId) ||
          /product review/i.test(event.title || '');

        // Product reviews and other admin events: admins only
        if (isAdminEvent || isReviewEvent) {
          return isAdmin;
        }

        // Customer / targeted events: only the recipient (or global broadcast without userId)
        return !event.userId || event.userId.toString() === userId.toString();
      }),
      map((event) => ({
        data: event,
        type: 'notification',
        id: event._id?.toString() || event.id || String(Date.now()),
      })),
    );
  }
}
