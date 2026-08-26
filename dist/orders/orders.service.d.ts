import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { OrderDocument, OrderStatus } from '../checkout/schemas/order.schema.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RequestReturnDto } from './dto/request-return.dto.js';
import { CancelOrderDto } from './dto/cancel-order.dto.js';
export declare class OrdersService {
    private readonly ordersRepository;
    constructor(ordersRepository: OrdersRepository);
    private resolveOrder;
    findAll(query: QueryOrderDto): Promise<{
        data: OrderDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(orderId: string): Promise<OrderDocument>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderDocument>;
    updateTracking(orderId: string, dto: UpdateTrackingDto): Promise<OrderDocument>;
    approveReturn(orderId: string): Promise<OrderDocument>;
    markRefunded(orderId: string, notes?: string): Promise<OrderDocument>;
    getMyOrders(userId: string): Promise<OrderDocument[]>;
    getMyOrder(orderId: string, userId: string): Promise<OrderDocument>;
    getOrderTimeline(orderId: string, userId?: string): Promise<any[]>;
    getOrderTracking(orderId: string, userId?: string): Promise<{
        orderNumber: string;
        orderStatus: OrderStatus;
        shippingInfo: import("../checkout/schemas/order.schema.js").ShippingInfo;
        timeline: import("../checkout/schemas/order.schema.js").OrderTimeline[];
        estimatedDelivery: Date | undefined;
    }>;
    cancelOrder(orderId: string, dto: CancelOrderDto, userId?: string): Promise<OrderDocument>;
    requestReturn(dto: RequestReturnDto, userId?: string): Promise<OrderDocument>;
    getInvoice(orderId: string, userId?: string): Promise<{
        orderNumber: string;
        invoiceNumber: string;
        customerInfo: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
        shippingAddress: import("../checkout/schemas/order.schema.js").OrderAddress;
        billingAddress: import("../checkout/schemas/order.schema.js").OrderAddress;
        items: import("../checkout/schemas/order.schema.js").OrderItem[];
        pricing: import("../checkout/schemas/order.schema.js").OrderPricing;
        paymentInfo: import("../checkout/schemas/order.schema.js").PaymentInfo;
        shippingInfo: import("../checkout/schemas/order.schema.js").ShippingInfo;
        orderStatus: OrderStatus;
        htmlTemplate: string;
    }>;
}
