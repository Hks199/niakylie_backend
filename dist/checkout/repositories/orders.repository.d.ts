import { Model } from 'mongoose';
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
export declare class OrdersRepository {
    private readonly orderModel;
    constructor(orderModel: Model<OrderDocument>);
    create(orderData: Partial<Order>): Promise<OrderDocument>;
    findById(id: string): Promise<OrderDocument | null>;
    findByOrderNumber(orderNumber: string): Promise<OrderDocument | null>;
    findByInvoiceNumber(invoiceNumber: string): Promise<OrderDocument | null>;
    findByUserId(userId: string): Promise<OrderDocument[]>;
    findByUserIdOrGuestId(userId?: string, guestId?: string): Promise<OrderDocument[]>;
    findByGuestId(guestId: string): Promise<OrderDocument[]>;
    findAll(opts: OrderQueryOptions): Promise<{
        data: OrderDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateStatus(id: string, status: OrderStatus, note?: string, extraData?: Partial<Order>): Promise<OrderDocument | null>;
    updateTracking(id: string, tracking: {
        trackingNumber?: string;
        courierPartner?: string;
        estimatedDelivery?: Date;
    }): Promise<OrderDocument | null>;
    softDelete(id: string): Promise<OrderDocument | null>;
}
