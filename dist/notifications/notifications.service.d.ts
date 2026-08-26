import { NotificationsRepository } from './repositories/notifications.repository.js';
import { EmailProvider } from './providers/email.provider.js';
import { SmsProvider } from './providers/sms.provider.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';
import { NotificationDocument } from './schemas/notification.schema.js';
export declare class NotificationsService {
    private readonly notificationsRepo;
    private readonly emailProvider;
    private readonly smsProvider;
    private readonly usersRepo;
    constructor(notificationsRepo: NotificationsRepository, emailProvider: EmailProvider, smsProvider: SmsProvider, usersRepo: UsersRepository);
    sendNotification(dto: SendNotificationDto): Promise<NotificationDocument>;
    sendOrderUpdateNotification(params: {
        userId?: string;
        recipientEmail: string;
        recipientPhone?: string;
        orderNumber: string;
        status: string;
        trackingNumber?: string;
        courierPartner?: string;
    }): Promise<void>;
    sendOfferNotification(params: {
        userId?: string;
        recipientEmail: string;
        title: string;
        message: string;
        offerUrl?: string;
    }): Promise<void>;
    sendCouponNotification(params: {
        userId?: string;
        recipientEmail: string;
        recipientPhone?: string;
        couponCode: string;
        discountText: string;
        validTill?: string;
    }): Promise<void>;
    broadcastNotification(dto: BroadcastNotificationDto): Promise<{
        sentCount: number;
    }>;
    getUserNotifications(userId: string, query: QueryNotificationDto): Promise<{
        data: NotificationDocument[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: string, userId: string): Promise<NotificationDocument>;
    markAllAsRead(userId: string): Promise<{
        modifiedCount: number;
    }>;
    deleteNotification(id: string, userId: string): Promise<{
        message: string;
    }>;
}
