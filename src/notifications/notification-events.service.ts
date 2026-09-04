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
   * Get filtered real-time notification stream for a specific user ID or broadcast
   */
  getNotificationStream(userId: string): Observable<SseMessageEvent> {
    return this.notificationSubject.asObservable().pipe(
      filter((event) => {
        // Event belongs to target user OR is global broadcast (no userId)
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
