import { NotificationsService } from './notifications.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';
import { User } from '../users/schemas/user.schema.js';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
}
