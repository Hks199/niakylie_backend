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

    const filter: Record<string, any> = {
      userId: userObjId,
      isDeleted: false,
    };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }
    if (type) {
      filter.type = type;
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
        isRead: false,
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
