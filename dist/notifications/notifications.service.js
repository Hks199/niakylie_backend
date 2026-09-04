"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const notifications_repository_js_1 = require("./repositories/notifications.repository.js");
const email_provider_js_1 = require("./providers/email.provider.js");
const sms_provider_js_1 = require("./providers/sms.provider.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const notification_schema_js_1 = require("./schemas/notification.schema.js");
const notification_events_service_js_1 = require("./notification-events.service.js");
let NotificationsService = class NotificationsService {
    notificationsRepo;
    emailProvider;
    smsProvider;
    usersRepo;
    eventsService;
    constructor(notificationsRepo, emailProvider, smsProvider, usersRepo, eventsService) {
        this.notificationsRepo = notificationsRepo;
        this.emailProvider = emailProvider;
        this.smsProvider = smsProvider;
        this.usersRepo = usersRepo;
        this.eventsService = eventsService;
    }
    emitRealtime(notif) {
        if (this.eventsService && notif) {
            this.eventsService.emitNotification({
                _id: notif._id?.toString(),
                id: notif._id?.toString(),
                userId: notif.userId?.toString(),
                recipientEmail: notif.recipientEmail,
                recipientPhone: notif.recipientPhone,
                type: notif.type,
                channel: notif.channel,
                title: notif.title,
                message: notif.message,
                metadata: notif.metadata,
                createdAt: notif.createdAt || new Date().toISOString(),
            });
        }
    }
    async sendNotification(dto) {
        let recipientEmail = dto.recipientEmail;
        let recipientPhone = dto.recipientPhone;
        if (dto.userId) {
            const user = await this.usersRepo.findById(dto.userId);
            if (user) {
                recipientEmail = recipientEmail || user.email;
                recipientPhone = recipientPhone || user.phone;
            }
        }
        const channel = dto.channel || notification_schema_js_1.NotificationChannel.IN_APP;
        const notification = await this.notificationsRepo.create({
            userId: dto.userId ? new mongoose_1.Types.ObjectId(dto.userId) : undefined,
            recipientEmail,
            recipientPhone,
            type: dto.type,
            channel,
            title: dto.title,
            message: dto.message,
            metadata: dto.metadata,
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        if ((channel === notification_schema_js_1.NotificationChannel.EMAIL || recipientEmail) && recipientEmail) {
            try {
                await this.emailProvider.sendEmail({
                    to: recipientEmail,
                    subject: dto.title,
                    title: dto.title,
                    bodyHtml: `<p>${dto.message}</p>`,
                });
            }
            catch (err) {
            }
        }
        if ((channel === notification_schema_js_1.NotificationChannel.SMS || recipientPhone) && recipientPhone) {
            try {
                await this.smsProvider.sendSms({
                    to: recipientPhone,
                    message: `${dto.title}: ${dto.message}`,
                });
            }
            catch (err) {
            }
        }
        return notification;
    }
    async sendOrderUpdateNotification(params) {
        const title = `Order Update: #${params.orderNumber} is ${params.status}`;
        const message = `Your order #${params.orderNumber} has been updated to ${params.status}.` +
            (params.trackingNumber ? ` Carrier: ${params.courierPartner || 'Logistics'}, Tracking #: ${params.trackingNumber}` : '');
        if (params.userId) {
            const createdNotif = await this.notificationsRepo.create({
                userId: new mongoose_1.Types.ObjectId(params.userId),
                recipientEmail: params.recipientEmail,
                recipientPhone: params.recipientPhone,
                type: notification_schema_js_1.NotificationType.ORDER_UPDATE,
                channel: notification_schema_js_1.NotificationChannel.IN_APP,
                title,
                message,
                metadata: { orderNumber: params.orderNumber, status: params.status, trackingNumber: params.trackingNumber },
                status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
            });
            this.emitRealtime(createdNotif);
        }
        await this.emailProvider.sendOrderUpdateEmail({
            to: params.recipientEmail,
            orderNumber: params.orderNumber,
            status: params.status,
            trackingNumber: params.trackingNumber,
            courierPartner: params.courierPartner,
        });
        if (params.recipientPhone) {
            await this.smsProvider.sendOrderUpdateSms({
                to: params.recipientPhone,
                orderNumber: params.orderNumber,
                status: params.status,
            });
        }
    }
    async sendOfferNotification(params) {
        if (params.userId) {
            const user = await this.usersRepo.findById(params.userId);
            const isPushEnabled = user?.notificationPreferences?.push ?? true;
            const createdNotif = await this.notificationsRepo.create({
                userId: new mongoose_1.Types.ObjectId(params.userId),
                recipientEmail: params.recipientEmail,
                type: notification_schema_js_1.NotificationType.OFFER,
                channel: isPushEnabled ? notification_schema_js_1.NotificationChannel.PUSH : notification_schema_js_1.NotificationChannel.IN_APP,
                title: params.title,
                message: params.message,
                metadata: { offerUrl: params.offerUrl },
                status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
            });
            this.emitRealtime(createdNotif);
        }
        await this.emailProvider.sendOfferEmail({
            to: params.recipientEmail,
            title: params.title,
            message: params.message,
            offerUrl: params.offerUrl,
        });
    }
    async sendCouponNotification(params) {
        const title = `Exclusive Coupon Code: ${params.couponCode}`;
        const message = `Use code ${params.couponCode} at checkout for ${params.discountText}.`;
        if (params.userId) {
            const user = await this.usersRepo.findById(params.userId);
            const isPushEnabled = user?.notificationPreferences?.push ?? true;
            const createdNotif = await this.notificationsRepo.create({
                userId: new mongoose_1.Types.ObjectId(params.userId),
                recipientEmail: params.recipientEmail,
                recipientPhone: params.recipientPhone,
                type: notification_schema_js_1.NotificationType.COUPON,
                channel: isPushEnabled ? notification_schema_js_1.NotificationChannel.PUSH : notification_schema_js_1.NotificationChannel.IN_APP,
                title,
                message,
                metadata: { couponCode: params.couponCode, validTill: params.validTill },
                status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
            });
            this.emitRealtime(createdNotif);
        }
        await this.emailProvider.sendCouponEmail({
            to: params.recipientEmail,
            couponCode: params.couponCode,
            discountDetails: params.discountText,
            validTill: params.validTill,
        });
        if (params.recipientPhone) {
            await this.smsProvider.sendCouponSms({
                to: params.recipientPhone,
                couponCode: params.couponCode,
                discountText: params.discountText,
            });
        }
    }
    async broadcastNotification(dto) {
        let userIds = dto.targetUserIds || [];
        if (!userIds.length) {
            const { data: users } = await this.usersRepo.findAll({ page: 1, limit: 1000 });
            userIds = users.map((u) => u._id.toString());
        }
        const notificationsToCreate = userIds.map((uId) => ({
            userId: new mongoose_1.Types.ObjectId(uId),
            type: dto.type,
            channel: dto.channel || notification_schema_js_1.NotificationChannel.IN_APP,
            title: dto.title,
            message: dto.message,
            metadata: dto.metadata,
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        }));
        if (notificationsToCreate.length) {
            await this.notificationsRepo.createMany(notificationsToCreate);
            notificationsToCreate.forEach((n) => this.emitRealtime(n));
        }
        return { sentCount: notificationsToCreate.length };
    }
    async getUserNotifications(userId, query) {
        return this.notificationsRepo.findByUserId(userId, query);
    }
    async getUnreadCount(userId) {
        const unreadCount = await this.notificationsRepo.countUnread(userId);
        return { unreadCount };
    }
    async markAsRead(id, userId) {
        const updated = await this.notificationsRepo.markAsRead(id, userId);
        if (!updated) {
            throw new common_1.NotFoundException(`Notification '${id}' not found`);
        }
        return updated;
    }
    async markAllAsRead(userId) {
        return this.notificationsRepo.markAllAsRead(userId);
    }
    async deleteNotification(id, userId) {
        const deleted = await this.notificationsRepo.softDelete(id, userId);
        if (!deleted) {
            throw new common_1.NotFoundException(`Notification '${id}' not found`);
        }
        return { message: 'Notification deleted successfully' };
    }
    async sendTestPushNotification(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const title = '🔔 Push Notification Test';
        const message = `Hello ${user.firstName || 'User'}! This is a live browser push notification test from NIAKYLIE. Push notifications are functioning properly.`;
        const notification = await this.notificationsRepo.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            recipientEmail: user.email,
            recipientPhone: user.phone,
            type: notification_schema_js_1.NotificationType.SYSTEM,
            channel: notification_schema_js_1.NotificationChannel.PUSH,
            title,
            message,
            metadata: { isTestPush: true, sentAt: new Date().toISOString() },
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        return {
            success: true,
            message: 'Test push notification generated successfully',
            notification,
            pushEnabled: user.notificationPreferences?.push ?? true,
        };
    }
    async sendTestEmailNotification(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const title = '✉️ Email Notification Test';
        const message = `Hello ${user.firstName || 'Valued Customer'}! This is a test email notification from NIAKYLIE. Your email notifications are configured and functioning properly.`;
        const notification = await this.notificationsRepo.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            recipientEmail: user.email,
            recipientPhone: user.phone,
            type: notification_schema_js_1.NotificationType.SYSTEM,
            channel: notification_schema_js_1.NotificationChannel.EMAIL,
            title,
            message,
            metadata: { isTestEmail: true, sentAt: new Date().toISOString() },
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        const emailResult = await this.emailProvider.sendEmail({
            to: user.email,
            subject: 'NIAKYLIE — Email Notification Test',
            title: 'Email Notifications Status: Active',
            bodyHtml: `<p>Hello <strong>${user.firstName || 'Customer'}</strong>,</p>
                 <p>This email confirms that your NIAKYLIE email notification preferences are active.</p>
                 <p>You will receive order invoices, shipping updates, and exclusive alerts directly at <strong>${user.email}</strong>.</p>`,
            buttonText: 'View My Notifications',
            buttonUrl: 'http://localhost:5173/account/notifications',
        });
        return {
            success: true,
            message: `Test email dispatched to ${user.email}`,
            notification,
            emailResult,
            emailEnabled: user.notificationPreferences?.email ?? true,
        };
    }
    async sendPriceDropTestNotification(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const title = '🔥 Price Drop Alert!';
        const message = 'Great news! An item in your wishlist or cart just dropped in price by 25%. Grab it now before stock sells out!';
        const notification = await this.notificationsRepo.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            recipientEmail: user.email,
            type: notification_schema_js_1.NotificationType.OFFER,
            channel: notification_schema_js_1.NotificationChannel.PUSH,
            title,
            message,
            metadata: { eventType: 'price_drop', discountPercentage: 25, itemUrl: '/products' },
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        return { success: true, message: 'Price Drop push notification dispatched', notification };
    }
    async sendNewCollectionTestNotification(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const title = '✨ New Collection Drop: Autumn Couture';
        const message = 'Discover our latest luxury women collection drop! Fresh designs and premium fabrics are now live on NIAKYLIE.';
        const notification = await this.notificationsRepo.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            recipientEmail: user.email,
            type: notification_schema_js_1.NotificationType.OFFER,
            channel: notification_schema_js_1.NotificationChannel.PUSH,
            title,
            message,
            metadata: { eventType: 'new_collection', collectionName: 'Autumn Couture' },
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        return { success: true, message: 'New Collection Drop push notification dispatched', notification };
    }
    async sendCouponTestNotification(userId) {
        const user = await this.usersRepo.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const title = '🎁 Exclusive Discount Coupon: LUXE20';
        const message = 'You unlocked an exclusive 20% OFF coupon! Apply code LUXE20 at checkout for instant savings.';
        const notification = await this.notificationsRepo.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            recipientEmail: user.email,
            recipientPhone: user.phone,
            type: notification_schema_js_1.NotificationType.COUPON,
            channel: notification_schema_js_1.NotificationChannel.PUSH,
            title,
            message,
            metadata: { eventType: 'coupon', couponCode: 'LUXE20', discount: '20% OFF' },
            status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
        });
        this.emitRealtime(notification);
        return { success: true, message: 'Exclusive Coupon push notification dispatched', notification };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_js_1.NotificationsRepository,
        email_provider_js_1.EmailProvider,
        sms_provider_js_1.SmsProvider,
        users_repository_js_1.UsersRepository,
        notification_events_service_js_1.NotificationEventsService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map