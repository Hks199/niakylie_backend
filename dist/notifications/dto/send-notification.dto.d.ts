import { NotificationType, NotificationChannel } from '../schemas/notification.schema.js';
export declare class SendNotificationDto {
    userId?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    type: NotificationType;
    channel?: NotificationChannel;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}
