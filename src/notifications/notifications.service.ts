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
import { Role } from '../shared/index.js';

import { SendNotificationDto } from './dto/send-notification.dto.js';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto.js';
import { QueryNotificationDto } from './dto/query-notification.dto.js';

import {
  NotificationDocument,
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} from './schemas/notification.schema.js';

import { NotificationEventsService } from './notification-events.service.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly usersRepo: UsersRepository,
    private readonly eventsService: NotificationEventsService,
  ) {}

  private emitRealtime(notif: any) {
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

    this.emitRealtime(notification);

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
      const createdNotif = await this.notificationsRepo.create({
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
      this.emitRealtime(createdNotif);
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
      const user = await this.usersRepo.findById(params.userId);
      const isPushEnabled = user?.notificationPreferences?.push ?? true;

      const createdNotif = await this.notificationsRepo.create({
        userId: new Types.ObjectId(params.userId),
        recipientEmail: params.recipientEmail,
        type: NotificationType.OFFER,
        channel: isPushEnabled ? NotificationChannel.PUSH : NotificationChannel.IN_APP,
        title: params.title,
        message: params.message,
        metadata: { offerUrl: params.offerUrl },
        status: NotificationDeliveryStatus.SENT,
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
      const user = await this.usersRepo.findById(params.userId);
      const isPushEnabled = user?.notificationPreferences?.push ?? true;

      const createdNotif = await this.notificationsRepo.create({
        userId: new Types.ObjectId(params.userId),
        recipientEmail: params.recipientEmail,
        recipientPhone: params.recipientPhone,
        type: NotificationType.COUPON,
        channel: isPushEnabled ? NotificationChannel.PUSH : NotificationChannel.IN_APP,
        title,
        message,
        metadata: { couponCode: params.couponCode, validTill: params.validTill },
        status: NotificationDeliveryStatus.SENT,
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
      notificationsToCreate.forEach((n) => this.emitRealtime(n));
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

  async sendTestPushNotification(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const title = '🔔 Push Notification Test';
    const message = `Hello ${user.firstName || 'User'}! This is a live browser push notification test from NIAKYLIE. Push notifications are functioning properly.`;

    const notification = await this.notificationsRepo.create({
      userId: new Types.ObjectId(userId),
      recipientEmail: user.email,
      recipientPhone: user.phone,
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.PUSH,
      title,
      message,
      metadata: { isTestPush: true, sentAt: new Date().toISOString() },
      status: NotificationDeliveryStatus.SENT,
    });
    this.emitRealtime(notification);

    return {
      success: true,
      message: 'Test push notification generated successfully',
      notification,
      pushEnabled: user.notificationPreferences?.push ?? true,
    };
  }

  async sendTestEmailNotification(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const title = '✉️ Email Notification Test';
    const message = `Hello ${user.firstName || 'Valued Customer'}! This is a test email notification from NIAKYLIE. Your email notifications are configured and functioning properly.`;

    // 1. Create in-app system record
    const notification = await this.notificationsRepo.create({
      userId: new Types.ObjectId(userId),
      recipientEmail: user.email,
      recipientPhone: user.phone,
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.EMAIL,
      title,
      message,
      metadata: { isTestEmail: true, sentAt: new Date().toISOString() },
      status: NotificationDeliveryStatus.SENT,
    });
    this.emitRealtime(notification);

    // 2. Dispatch email via EmailProvider
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

  async sendPriceDropTestNotification(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const title = '🔥 Price Drop Alert!';
    const message = 'Great news! An item in your wishlist or cart just dropped in price by 25%. Grab it now before stock sells out!';

    const notification = await this.notificationsRepo.create({
      userId: new Types.ObjectId(userId),
      recipientEmail: user.email,
      type: NotificationType.OFFER,
      channel: NotificationChannel.PUSH,
      title,
      message,
      metadata: { eventType: 'price_drop', discountPercentage: 25, itemUrl: '/products' },
      status: NotificationDeliveryStatus.SENT,
    });
    this.emitRealtime(notification);

    return { success: true, message: 'Price Drop push notification dispatched', notification };
  }

  async sendNewCollectionTestNotification(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const title = '✨ New Collection Drop: Autumn Couture';
    const message = 'Discover our latest luxury women collection drop! Fresh designs and premium fabrics are now live on NIAKYLIE.';

    const notification = await this.notificationsRepo.create({
      userId: new Types.ObjectId(userId),
      recipientEmail: user.email,
      type: NotificationType.OFFER,
      channel: NotificationChannel.PUSH,
      title,
      message,
      metadata: { eventType: 'new_collection', collectionName: 'Autumn Couture' },
      status: NotificationDeliveryStatus.SENT,
    });
    this.emitRealtime(notification);

    return { success: true, message: 'New Collection Drop push notification dispatched', notification };
  }

  async sendCouponTestNotification(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const title = '🎁 Exclusive Discount Coupon: LUXE20';
    const message = 'You unlocked an exclusive 20% OFF coupon! Apply code LUXE20 at checkout for instant savings.';

    const notification = await this.notificationsRepo.create({
      userId: new Types.ObjectId(userId),
      recipientEmail: user.email,
      recipientPhone: user.phone,
      type: NotificationType.COUPON,
      channel: NotificationChannel.PUSH,
      title,
      message,
      metadata: { eventType: 'coupon', couponCode: 'LUXE20', discount: '20% OFF' },
      status: NotificationDeliveryStatus.SENT,
    });
    this.emitRealtime(notification);

    return { success: true, message: 'Exclusive Coupon push notification dispatched', notification };
  }

  async sendAdminEventNotification(params: {
    title: string;
    message: string;
    type: NotificationType;
    metadata?: Record<string, any>;
  }) {
    try {
      const { data: users } = await this.usersRepo.findAll({ page: 1, limit: 100 });
      const adminUsers = users.filter(
        (u) =>
          u.roles?.includes(Role.ADMIN as any) ||
          (u.roles as any)?.includes('ADMIN') ||
          (u.roles as any)?.includes('admin'),
      );

      if (adminUsers.length > 0) {
        for (const admin of adminUsers) {
          const notif = await this.notificationsRepo.create({
            userId: admin._id,
            recipientEmail: admin.email,
            type: params.type,
            channel: NotificationChannel.IN_APP,
            title: params.title,
            message: params.message,
            metadata: { ...params.metadata, isAdminEvent: true },
            status: NotificationDeliveryStatus.SENT,
          });
          this.emitRealtime(notif);
        }
      } else {
        this.emitRealtime({
          title: params.title,
          message: params.message,
          type: params.type,
          channel: NotificationChannel.IN_APP,
          metadata: { ...params.metadata, isAdminEvent: true },
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Fallback realtime dispatch
      this.emitRealtime({
        title: params.title,
        message: params.message,
        type: params.type,
        channel: NotificationChannel.IN_APP,
        metadata: { ...params.metadata, isAdminEvent: true },
        createdAt: new Date().toISOString(),
      });
    }
  }

  async sendTestAdminEvent(eventType?: string) {
    let title = '🛍️ Realtime Order: New Order Received!';
    let message = `Customer order #NK-ORD-${Date.now().toString().slice(-4)} for ₹3,499 was received from user.`;
    let type = NotificationType.ORDER_UPDATE;

    if (eventType === 'review') {
      title = '⭐ Realtime Review: New Product Review Received';
      message = 'Customer Priya S. provided a 5-star review on Handloom Banarasi Saree: "Exquisite quality and fast delivery!"';
      type = NotificationType.SYSTEM;
    } else if (eventType === 'stock' || eventType === 'inventory') {
      title = '🚨 Realtime Stock Alert: Out of Stock!';
      message = 'Product SKU NK-SAR-880 (Kanjivaram Silk Saree) reached 0 available stock level!';
      type = NotificationType.SYSTEM;
    } else if (eventType === 'cancel' || eventType === 'cancelled') {
      title = '🚫 Order Cancelled: #NK-ORD-20260904-7953';
      message = 'Order #NK-ORD-20260904-7953 was cancelled by Customer Ananya R. Reason: "Size mismatch / Ordered duplicate item"';
      type = NotificationType.ORDER_UPDATE;
    }

    await this.sendAdminEventNotification({
      title,
      message,
      type,
      metadata: { isTestEvent: true, sentAt: new Date().toISOString() },
    });

    return { success: true, message: 'Test admin realtime event dispatched successfully.' };
  }
}
