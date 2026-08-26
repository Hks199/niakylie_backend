import { NotificationsService } from './notifications.service.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(dto: SendNotificationDto): Promise<import("./schemas/notification.schema.js").NotificationDocument>;
    broadcastNotification(dto: BroadcastNotificationDto): Promise<{
        sentCount: number;
    }>;
    getMyNotifications(req: any, query: QueryNotificationDto): Promise<{
        data: import("./schemas/notification.schema.js").NotificationDocument[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: string, req: any): Promise<import("./schemas/notification.schema.js").NotificationDocument>;
    markAllAsRead(req: any): Promise<{
        modifiedCount: number;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        message: string;
    }>;
}
