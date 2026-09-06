import { Observable } from 'rxjs';
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
export declare class NotificationEventsService {
    private readonly notificationSubject;
    emitNotification(event: RealtimeNotificationEvent): void;
    getNotificationStream(userId: string, isAdmin?: boolean): Observable<SseMessageEvent>;
}
