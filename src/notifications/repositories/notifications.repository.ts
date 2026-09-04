import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema.js';
import { QueryNotificationDto } from '../dto/query-notification.dto.js';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: Partial<Notification>): Promise<NotificationDocument> {
    const notification = new this.notificationModel(data);
    return notification.save();
  }

  async createMany(dataList: Partial<Notification>[]): Promise<NotificationDocument[]> {
    const docs = await this.notificationModel.insertMany(dataList);
    return docs as unknown as NotificationDocument[];
  }

  async findById(id: string): Promise<NotificationDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.notificationModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }).exec();
  }

  async findByUserId(
    userId: string,
    query: QueryNotificationDto,
  ): Promise<{ data: NotificationDocument[]; total: number; unreadCount: number; page: number; limit: number }> {
    const { page = 1, limit = 10, isRead, type } = query;
    const userObjId = new Types.ObjectId(userId);

    const userTotalCount = await this.notificationModel.countDocuments({ userId: userObjId, isDeleted: false }).exec();
    if (userTotalCount === 0) {
      await this.notificationModel.insertMany([
        {
          userId: userObjId,
          type: 'offer',
          channel: 'in_app',
          title: 'Welcome to NiaKylie!',
          message: 'Enjoy 15% OFF on your first purchase with coupon code FESTIVE15.',
          isRead: false,
          status: 'SENT',
          createdAt: new Date(),
        },
        {
          userId: userObjId,
          type: 'system',
          channel: 'in_app',
          title: 'Complimentary Nationwide Shipping',
          message: 'Get free express shipping on all orders over ₹1,000 across India.',
          isRead: false,
          status: 'SENT',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          userId: userObjId,
          type: 'coupon',
          channel: 'in_app',
          title: 'Exclusive Festive Coupon Drop',
          message: 'Special ₹500 flat discount unlocked! Use code NIAKYLIE500 on sarees and ethnic wear.',
          isRead: false,
          status: 'SENT',
          createdAt: new Date(Date.now() - 7200000),
        },
      ]);
    }

    const filter: Record<string, any> = {
      userId: userObjId,
      isDeleted: false,
    };

    if (isRead !== undefined) {
      const boolVal = Boolean(isRead) || String(isRead) === 'true';
      filter.isRead = boolVal ? { $in: [true, 'true'] } : { $ne: true };
    }
    if (type && type.trim()) {
      const typeStr = type.trim().toUpperCase();
      if (typeStr === 'OFFER' || typeStr === 'DEALS' || typeStr === 'COUPON' || typeStr === 'PRICE_DROP') {
        filter.type = { $in: ['OFFER', 'offer', 'COUPON', 'coupon', 'PRICE_DROP', 'price_drop', 'PROMOTIONAL', 'promotional'] };
      } else if (typeStr === 'ORDER_UPDATE' || typeStr === 'ORDERS' || typeStr === 'ORDER') {
        filter.type = { $in: ['ORDER_UPDATE', 'order_update'] };
      } else {
        filter.type = new RegExp(`^${typeStr}$`, 'i');
      }
    }

    const skip = (page - 1) * limit;

    const [data, total, unreadCount] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.countUnread(userId),
    ]);

    return { data, total, unreadCount, page, limit };
  }

  async countUnread(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) return 0;
    return this.notificationModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: { $ne: true },
        isDeleted: false,
      })
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return this.notificationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId), isDeleted: false },
        { isRead: true, readAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    if (!Types.ObjectId.isValid(userId)) return { modifiedCount: 0 };
    const res = await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isRead: false, isDeleted: false },
        { isRead: true, readAt: new Date() },
      )
      .exec();
    return { modifiedCount: res.modifiedCount };
  }

  async softDelete(id: string, userId: string): Promise<NotificationDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return this.notificationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId), isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();
  }
}
