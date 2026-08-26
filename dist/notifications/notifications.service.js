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
let NotificationsService = class NotificationsService {
    notificationsRepo;
    emailProvider;
    smsProvider;
    usersRepo;
    constructor(notificationsRepo, emailProvider, smsProvider, usersRepo) {
        this.notificationsRepo = notificationsRepo;
        this.emailProvider = emailProvider;
        this.smsProvider = smsProvider;
        this.usersRepo = usersRepo;
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
            await this.notificationsRepo.create({
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
            await this.notificationsRepo.create({
                userId: new mongoose_1.Types.ObjectId(params.userId),
                recipientEmail: params.recipientEmail,
                type: notification_schema_js_1.NotificationType.OFFER,
                channel: notification_schema_js_1.NotificationChannel.IN_APP,
                title: params.title,
                message: params.message,
                metadata: { offerUrl: params.offerUrl },
                status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
            });
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
            await this.notificationsRepo.create({
                userId: new mongoose_1.Types.ObjectId(params.userId),
                recipientEmail: params.recipientEmail,
                recipientPhone: params.recipientPhone,
                type: notification_schema_js_1.NotificationType.COUPON,
                channel: notification_schema_js_1.NotificationChannel.IN_APP,
                title,
                message,
                metadata: { couponCode: params.couponCode, validTill: params.validTill },
                status: notification_schema_js_1.NotificationDeliveryStatus.SENT,
            });
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_js_1.NotificationsRepository,
        email_provider_js_1.EmailProvider,
        sms_provider_js_1.SmsProvider,
        users_repository_js_1.UsersRepository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map