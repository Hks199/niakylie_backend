import { NotificationType } from '../schemas/notification.schema.js';
export declare class QueryNotificationDto {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: NotificationType;
}
