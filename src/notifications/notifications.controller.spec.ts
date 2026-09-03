import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from './schemas/notification.schema.js';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  const mockNotification = {
    _id: '60d5ecb8b392d40015f8a002',
    title: 'Order Update',
    message: 'Your order was shipped',
  };

  beforeEach(async () => {
    const mockService = {
      sendNotification: jest.fn(),
      broadcastNotification: jest.fn(),
      getUserNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should delegate notification sending to service', async () => {
      service.sendNotification.mockResolvedValue(mockNotification as any);
      const dto = { type: NotificationType.ORDER_UPDATE, title: 'Order Update', message: 'Shipped' };

      const result = await controller.sendNotification(dto);
      expect(service.sendNotification).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockNotification);
    });
  });

  describe('broadcastNotification', () => {
    it('should delegate broadcast to service', async () => {
      service.broadcastNotification.mockResolvedValue({ sentCount: 10 });
      const dto = { type: NotificationType.OFFER, title: 'Sale', message: '30% Off' };

      const result = await controller.broadcastNotification(dto);
      expect(service.broadcastNotification).toHaveBeenCalledWith(dto);
      expect(result.sentCount).toBe(10);
    });
  });

  describe('getMyNotifications', () => {
    it('should delegate fetching customer notifications to service', async () => {
      service.getUserNotifications.mockResolvedValue({ data: [mockNotification as any], total: 1, unreadCount: 1, page: 1, limit: 10 });
      const req = { user: { id: 'user123' } } as any;

      const result = await controller.getMyNotifications(req, { page: 1, limit: 10 });
      expect(service.getUserNotifications).toHaveBeenCalledWith('user123', { page: 1, limit: 10 });
      expect(result.total).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should delegate mark as read to service', async () => {
      service.markAsRead.mockResolvedValue({ ...mockNotification, isRead: true } as any);
      const req = { user: { id: 'user123' } } as any;

      const result = await controller.markAsRead('notif123', req);
      expect(service.markAsRead).toHaveBeenCalledWith('notif123', 'user123');
    });
  });
});
