import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema.js';
import { QueryNotificationDto } from '../dto/query-notification.dto.js';
export declare class NotificationsRepository {
    private readonly notificationModel;
    constructor(notificationModel: Model<NotificationDocument>);
    create(data: Partial<Notification>): Promise<NotificationDocument>;
    createMany(dataList: Partial<Notification>[]): Promise<NotificationDocument[]>;
    findById(id: string): Promise<NotificationDocument | null>;
    findByUserId(userId: string, query: QueryNotificationDto): Promise<{
        data: NotificationDocument[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    countUnread(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<NotificationDocument | null>;
    markAllAsRead(userId: string): Promise<{
        modifiedCount: number;
    }>;
    softDelete(id: string, userId: string): Promise<NotificationDocument | null>;
}
