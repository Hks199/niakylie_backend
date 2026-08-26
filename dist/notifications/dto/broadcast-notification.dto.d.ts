import { NotificationType, NotificationChannel } from '../schemas/notification.schema.js';
export declare class BroadcastNotificationDto {
    type: NotificationType;
    channel?: NotificationChannel;
    title: string;
    message: string;
    targetUserIds?: string[];
    metadata?: Record<string, any>;
}
