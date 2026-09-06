import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service.js';
import { NotificationEventsService } from './notification-events.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';
import { User } from '../users/schemas/user.schema.js';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly eventsService;
    constructor(notificationsService: NotificationsService, eventsService: NotificationEventsService);
    streamNotifications(user: User): Observable<MessageEvent>;
    sendNotification(dto: SendNotificationDto): Promise<import("./schemas/notification.schema.js").NotificationDocument>;
    broadcastNotification(dto: BroadcastNotificationDto): Promise<{
        sentCount: number;
    }>;
    getMyNotifications(user: User, query: QueryNotificationDto): Promise<{
        data: import("./schemas/notification.schema.js").NotificationDocument[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(user: User): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: string, user: User): Promise<import("./schemas/notification.schema.js").NotificationDocument>;
    markAllAsRead(user: User): Promise<{
        modifiedCount: number;
    }>;
    deleteNotification(id: string, user: User): Promise<{
        message: string;
    }>;
    sendTestPush(user: User): Promise<{
        success: boolean;
        message: string;
        notification: import("./schemas/notification.schema.js").NotificationDocument;
        pushEnabled: boolean;
    }>;
    sendTestEmail(user: User): Promise<{
        success: boolean;
        message: string;
        notification: import("./schemas/notification.schema.js").NotificationDocument;
        emailResult: {
            success: boolean;
            messageId: string;
        };
        emailEnabled: boolean;
    }>;
    sendTestPriceDrop(user: User): Promise<{
        success: boolean;
        message: string;
        notification: import("./schemas/notification.schema.js").NotificationDocument;
    }>;
    sendTestCollectionDrop(user: User): Promise<{
        success: boolean;
        message: string;
        notification: import("./schemas/notification.schema.js").NotificationDocument;
    }>;
    sendTestCoupon(user: User): Promise<{
        success: boolean;
        message: string;
        notification: import("./schemas/notification.schema.js").NotificationDocument;
    }>;
    sendTestAdminEvent(type?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
