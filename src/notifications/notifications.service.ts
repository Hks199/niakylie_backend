import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationsRepository } from './repositories/notifications.repository.js';
import { EmailProvider } from './providers/email.provider.js';
import { SmsProvider } from './providers/sms.provider.js';
import { UsersRepository } from '../users/repositories/users.repository.js';

import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';

import {
  NotificationDocument,
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} from './schemas/notification.schema.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly usersRepo: UsersRepository,
  ) {}

  async sendNotification(dto: SendNotificationDto): Promise<NotificationDocument> {
    let recipientEmail = dto.recipientEmail;
    let recipientPhone = dto.recipientPhone;

    if (dto.userId) {
      const user = await this.usersRepo.findById(dto.userId);
      if (user) {
        recipientEmail = recipientEmail || user.email;
        recipientPhone = recipientPhone || user.phone;
      }
    }

    const channel = dto.channel || NotificationChannel.IN_APP;

    const notification = await this.notificationsRepo.create({
      userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
      recipientEmail,
      recipientPhone,
      type: dto.type,
      channel,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata,
      status: NotificationDeliveryStatus.SENT,
    });

    // Dispatch Email if Email channel or email provided
    if ((channel === NotificationChannel.EMAIL || recipientEmail) && recipientEmail) {
      try {
        await this.emailProvider.sendEmail({
          to: recipientEmail,
          subject: dto.title,
          title: dto.title,
          bodyHtml: `<p>${dto.message}</p>`,
        });
      } catch (err) {
        // Log & proceed
      }
    }

    // Dispatch SMS if SMS channel or phone provided
    if ((channel === NotificationChannel.SMS || recipientPhone) && recipientPhone) {
      try {
        await this.smsProvider.sendSms({
          to: recipientPhone,
          message: `${dto.title}: ${dto.message}`,
        });
      } catch (err) {
        // Log & proceed
      }
    }

    return notification;
  }

  async sendOrderUpdateNotification(params: {
    userId?: string;
    recipientEmail: string;
    recipientPhone?: string;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    courierPartner?: string;
  }) {
    const title = `Order Update: #${params.orderNumber} is ${params.status}`;
    const message = `Your order #${params.orderNumber} has been updated to ${params.status}.` +
      (params.trackingNumber ? ` Carrier: ${params.courierPartner || 'Logistics'}, Tracking #: ${params.trackingNumber}` : '');

    // In-App Notification
    if (params.userId) {
      await this.notificationsRepo.create({
        userId: new Types.ObjectId(params.userId),
        recipientEmail: params.recipientEmail,
        recipientPhone: params.recipientPhone,
        type: NotificationType.ORDER_UPDATE,
        channel: NotificationChannel.IN_APP,
        title,
        message,
        metadata: { orderNumber: params.orderNumber, status: params.status, trackingNumber: params.trackingNumber },
        status: NotificationDeliveryStatus.SENT,
      });
    }

    // Email Dispatch
    await this.emailProvider.sendOrderUpdateEmail({
      to: params.recipientEmail,
      orderNumber: params.orderNumber,
      status: params.status,
      trackingNumber: params.trackingNumber,
      courierPartner: params.courierPartner,
    });

    // Future SMS Dispatch
    if (params.recipientPhone) {
      await this.smsProvider.sendOrderUpdateSms({
        to: params.recipientPhone,
        orderNumber: params.orderNumber,
        status: params.status,
      });
    }
  }

  async sendOfferNotification(params: {
    userId?: string;
    recipientEmail: string;
    title: string;
    message: string;
    offerUrl?: string;
  }) {
    if (params.userId) {
      await this.notificationsRepo.create({
        userId: new Types.ObjectId(params.userId),
        recipientEmail: params.recipientEmail,
        type: NotificationType.OFFER,
        channel: NotificationChannel.IN_APP,
        title: params.title,
        message: params.message,
        metadata: { offerUrl: params.offerUrl },
        status: NotificationDeliveryStatus.SENT,
      });
    }

    await this.emailProvider.sendOfferEmail({
      to: params.recipientEmail,
      title: params.title,
      message: params.message,
      offerUrl: params.offerUrl,
    });
  }

  async sendCouponNotification(params: {
    userId?: string;
    recipientEmail: string;
    recipientPhone?: string;
    couponCode: string;
    discountText: string;
    validTill?: string;
  }) {
    const title = `Exclusive Coupon Code: ${params.couponCode}`;
    const message = `Use code ${params.couponCode} at checkout for ${params.discountText}.`;

    if (params.userId) {
      await this.notificationsRepo.create({
        userId: new Types.ObjectId(params.userId),
        recipientEmail: params.recipientEmail,
        recipientPhone: params.recipientPhone,
        type: NotificationType.COUPON,
        channel: NotificationChannel.IN_APP,
        title,
        message,
        metadata: { couponCode: params.couponCode, validTill: params.validTill },
        status: NotificationDeliveryStatus.SENT,
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

  async broadcastNotification(dto: BroadcastNotificationDto): Promise<{ sentCount: number }> {
    let userIds: string[] = dto.targetUserIds || [];

    if (!userIds.length) {
      const { data: users } = await this.usersRepo.findAll({ page: 1, limit: 1000 });
      userIds = users.map((u) => u._id.toString());
    }

    const notificationsToCreate = userIds.map((uId) => ({
      userId: new Types.ObjectId(uId),
      type: dto.type,
      channel: dto.channel || NotificationChannel.IN_APP,
      title: dto.title,
      message: dto.message,
      metadata: dto.metadata,
      status: NotificationDeliveryStatus.SENT,
    }));

    if (notificationsToCreate.length) {
      await this.notificationsRepo.createMany(notificationsToCreate);
    }

    return { sentCount: notificationsToCreate.length };
  }

  async getUserNotifications(userId: string, query: QueryNotificationDto) {
    return this.notificationsRepo.findByUserId(userId, query);
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationsRepo.countUnread(userId);
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const updated = await this.notificationsRepo.markAsRead(id, userId);
    if (!updated) {
      throw new NotFoundException(`Notification '${id}' not found`);
    }
    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    return this.notificationsRepo.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string): Promise<{ message: string }> {
    const deleted = await this.notificationsRepo.softDelete(id, userId);
    if (!deleted) {
      throw new NotFoundException(`Notification '${id}' not found`);
    }
    return { message: 'Notification deleted successfully' };
  }
}
