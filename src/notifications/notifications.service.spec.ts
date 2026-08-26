import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { NotificationsService } from './notifications.service.js';
import { NotificationsRepository } from './repositories/notifications.repository.js';
import { EmailProvider } from './providers/email.provider.js';
import { SmsProvider } from './providers/sms.provider.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import {
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} from './schemas/notification.schema.js';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<NotificationsRepository>;
  let emailProvider: jest.Mocked<EmailProvider>;
  let smsProvider: jest.Mocked<SmsProvider>;
  let usersRepo: jest.Mocked<UsersRepository>;

  const userId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const notificationId = new Types.ObjectId('60d5ecb8b392d40015f8a002');

  const mockUser = {
    _id: userId,
    email: 'user@test.com',
    phone: '+919876543210',
    firstName: 'Jane',
  };

  const mockNotification = {
    _id: notificationId,
    userId,
    recipientEmail: 'user@test.com',
    recipientPhone: '+919876543210',
    type: NotificationType.ORDER_UPDATE,
    channel: NotificationChannel.IN_APP,
    title: 'Order Shipped',
    message: 'Your order has been shipped',
    isRead: false,
    status: NotificationDeliveryStatus.SENT,
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countUnread: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockEmailProvider = {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email123' }),
      sendOrderUpdateEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email123' }),
      sendOfferEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email123' }),
      sendCouponEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email123' }),
    };

    const mockSmsProvider = {
      sendSms: jest.fn().mockResolvedValue({ success: true, messageId: 'sms123' }),
      sendOrderUpdateSms: jest.fn().mockResolvedValue({ success: true, messageId: 'sms123' }),
      sendCouponSms: jest.fn().mockResolvedValue({ success: true, messageId: 'sms123' }),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: mockRepo },
        { provide: EmailProvider, useValue: mockEmailProvider },
        { provide: SmsProvider, useValue: mockSmsProvider },
        { provide: UsersRepository, useValue: mockUsersRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(NotificationsRepository);
    emailProvider = module.get(EmailProvider);
    smsProvider = module.get(SmsProvider);
    usersRepo = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should create notification record and dispatch email/SMS if provided', async () => {
      usersRepo.findById.mockResolvedValue(mockUser as any);
      repo.create.mockResolvedValue(mockNotification as any);

      const result = await service.sendNotification({
        userId: userId.toString(),
        type: NotificationType.ORDER_UPDATE,
        title: 'Order Shipped',
        message: 'Your order has been shipped',
      });

      expect(repo.create).toHaveBeenCalled();
      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'user@test.com', subject: 'Order Shipped' }),
      );
      expect(result).toBe(mockNotification);
    });
  });

  describe('sendOrderUpdateNotification', () => {
    it('should create in-app notification and dispatch Email and SMS', async () => {
      repo.create.mockResolvedValue(mockNotification as any);

      await service.sendOrderUpdateNotification({
        userId: userId.toString(),
        recipientEmail: 'user@test.com',
        recipientPhone: '+919876543210',
        orderNumber: 'NK-ORD-123',
        status: 'SHIPPED',
        trackingNumber: 'BL123',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: NotificationType.ORDER_UPDATE }),
      );
      expect(emailProvider.sendOrderUpdateEmail).toHaveBeenCalledWith(
        expect.objectContaining({ orderNumber: 'NK-ORD-123', status: 'SHIPPED' }),
      );
      expect(smsProvider.sendOrderUpdateSms).toHaveBeenCalledWith(
        expect.objectContaining({ orderNumber: 'NK-ORD-123' }),
      );
    });
  });

  describe('sendCouponNotification', () => {
    it('should create coupon notification and dispatch email and SMS', async () => {
      repo.create.mockResolvedValue(mockNotification as any);

      await service.sendCouponNotification({
        userId: userId.toString(),
        recipientEmail: 'user@test.com',
        recipientPhone: '+919876543210',
        couponCode: 'SAVE20',
        discountText: 'Flat 20% Off',
      });

      expect(emailProvider.sendCouponEmail).toHaveBeenCalledWith(
        expect.objectContaining({ couponCode: 'SAVE20' }),
      );
      expect(smsProvider.sendCouponSms).toHaveBeenCalledWith(
        expect.objectContaining({ couponCode: 'SAVE20' }),
      );
    });
  });

  describe('broadcastNotification', () => {
    it('should broadcast notification to all users when targetUserIds is empty', async () => {
      usersRepo.findAll.mockResolvedValue({ data: [mockUser as any], total: 1 } as any);
      repo.createMany.mockResolvedValue([mockNotification as any]);

      const result = await service.broadcastNotification({
        type: NotificationType.OFFER,
        title: 'Festive Offer',
        message: 'Big savings today!',
      });

      expect(repo.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ title: 'Festive Offer' })]),
      );
      expect(result.sentCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      repo.markAsRead.mockResolvedValue({ ...mockNotification, isRead: true } as any);

      const result = await service.markAsRead(notificationId.toString(), userId.toString());
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification is not found', async () => {
      repo.markAsRead.mockResolvedValue(null);

      await expect(
        service.markAsRead(notificationId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread counter', async () => {
      repo.countUnread.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId.toString());
      expect(result.unreadCount).toBe(5);
    });
  });
});
