import { OrdersService } from './orders.service.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RejectReturnDto } from './dto/reject-return.dto.js';
import { ProcessReturnRefundDto } from './dto/process-return-refund.dto.js';
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
        totalPages: number;
    }>;
    findByIdAdmin(orderId: string): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    updateTracking(orderId: string, dto: UpdateTrackingDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    approveReturn(orderId: string): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    rejectReturn(orderId: string, dto: RejectReturnDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    markRefunded(orderId: string, body: ProcessReturnRefundDto): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    getMyOrders(req: any, query: QueryOrderDto, guestIdHeader?: string): Promise<{
        data: import("../checkout/schemas/order.schema.js").OrderDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getOrders(req: any, query: QueryOrderDto, guestIdHeader?: string): Promise<{
        data: import("../checkout/schemas/order.schema.js").OrderDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
        returnInfo: {
            reason?: string;
            notes?: string;
            requestedAt?: Date;
            approvedAt?: Date;
            rejectedAt?: Date;
            rejectionReason?: string;
            status?: "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
            items?: Array<{
                productId?: string;
                variantId?: string;
                sku?: string;
                name?: string;
                quantity: number;
                unitPrice: number;
                refundAmount: number;
            }>;
            refundAmount?: number;
            refundMethod?: "RAZORPAY" | "UPI" | "BANK";
            refundDetails?: {
                upiId?: string;
                bankAccountNumber?: string;
                bankIfsc?: string;
                bankAccountName?: string;
                razorpayRefundId?: string;
                processedAt?: Date;
                notes?: string;
            };
            images?: string[];
        } | undefined;
        htmlTemplate: string;
    }>;
    cancelOrder(orderId: string, dto: CancelOrderDto, req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
    requestReturn(dto: RequestReturnDto, req: any): Promise<import("../checkout/schemas/order.schema.js").OrderDocument>;
}
