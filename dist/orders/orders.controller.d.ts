import { OrdersService } from './orders.service.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RequestReturnDto } from './dto/request-return.dto.js';
import { CancelOrderDto } from './dto/cancel-order.dto.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: QueryOrderDto): Promise<{
        data: import("../checkout/schemas/order.schema.js").OrderDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByIdAdmin(orderId: string): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    updateTracking(orderId: string, dto: UpdateTrackingDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    approveReturn(orderId: string): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    markRefunded(orderId: string, body: {
        notes?: string;
    }): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    getMyOrders(req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument[]>;
    getMyOrder(orderId: string, req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    getOrderTimeline(orderId: string, req: any): Promise<any[]>;
    getOrderTracking(orderId: string, req: any): Promise<{
        orderNumber: string;
        orderStatus: import("../checkout/schemas/order.schema.js").OrderStatus;
        shippingInfo: import("../checkout/schemas/order.schema.js").ShippingInfo;
        timeline: import("../checkout/schemas/order.schema.js").OrderTimeline[];
        estimatedDelivery: Date | undefined;
    }>;
    getInvoice(orderId: string, req: any): Promise<{
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
        orderStatus: import("../checkout/schemas/order.schema.js").OrderStatus;
        htmlTemplate: string;
    }>;
    cancelOrder(orderId: string, dto: CancelOrderDto, req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    requestReturn(dto: RequestReturnDto, req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
}
