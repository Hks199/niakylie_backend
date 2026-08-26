import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema.js';

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  userId?: string;
  orderStatus?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: Partial<Order>): Promise<OrderDocument> {
    const order = new this.orderModel(orderData);
    return order.save();
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ orderNumber, isDeleted: false }).exec();
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<OrderDocument | null> {
    return this.orderModel.findOne({ invoiceNumber, isDeleted: false }).exec();
  }

  async findByUserId(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).exec();
  }

  async findByGuestId(guestId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ guestId, isDeleted: false }).sort({ createdAt: -1 }).exec();
  }

  async findAll(opts: OrderQueryOptions): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, userId, orderStatus, search, startDate, endDate } = opts;
    const filter: Record<string, any> = { isDeleted: false };

    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    extraData?: Partial<Order>,
  ): Promise<OrderDocument | null> {
    const statusLabels: Record<string, string> = {
      [OrderStatus.PENDING]: 'Order is Pending',
      [OrderStatus.CONFIRMED]: 'Order Confirmed',
      [OrderStatus.PACKED]: 'Order Packed',
      [OrderStatus.SHIPPED]: 'Order Shipped',
      [OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
      [OrderStatus.DELIVERED]: 'Order Delivered',
      [OrderStatus.CANCELLED]: 'Order Cancelled',
      [OrderStatus.RETURNED]: 'Return Requested',
      [OrderStatus.REFUNDED]: 'Order Refunded',
    };

    const timelineEntry = {
      status,
      title: statusLabels[status] || `Status: ${status}`,
      timestamp: new Date(),
      notes: note,
    };

    return this.orderModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          orderStatus: status,
          $push: { timeline: timelineEntry },
          ...(extraData || {}),
        },
        { new: true },
      )
      .exec();
  }

  async updateTracking(
    id: string,
    tracking: { trackingNumber?: string; courierPartner?: string; estimatedDelivery?: Date },
  ): Promise<OrderDocument | null> {
    const update: Record<string, any> = {};
    if (tracking.trackingNumber) update['shippingInfo.trackingNumber'] = tracking.trackingNumber;
    if (tracking.courierPartner) update['shippingInfo.courierPartner'] = tracking.courierPartner;
    if (tracking.estimatedDelivery) update['shippingInfo.estimatedDelivery'] = tracking.estimatedDelivery;

    return this.orderModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: update }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<OrderDocument | null> {
    return this.orderModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
      .exec();
  }
}
