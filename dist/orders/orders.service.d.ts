import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { OrderDocument, OrderStatus } from '../checkout/schemas/order.schema.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RequestReturnDto } from './dto/request-return.dto.js';
import { RejectReturnDto } from './dto/reject-return.dto.js';
import { ProcessReturnRefundDto } from './dto/process-return-refund.dto.js';
import { CancelOrderDto } from './dto/cancel-order.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PaymentService } from '../payment/payment.service.js';
export declare class OrdersService {
    private readonly ordersRepository;
    private readonly productsRepository;
    private readonly inventoryRepository;
    private readonly notificationsService;
    private readonly paymentService?;
    constructor(ordersRepository: OrdersRepository, productsRepository: ProductsRepository, inventoryRepository: InventoryRepository, notificationsService: NotificationsService, paymentService?: PaymentService | undefined);
    private resolveOrder;
    private getDeliveryDate;
    private assertWithinReturnWindow;
    private restockItems;
    findAll(query: QueryOrderDto): Promise<{
        data: OrderDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(orderId: string): Promise<OrderDocument>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderDocument>;
    updateTracking(orderId: string, dto: UpdateTrackingDto): Promise<OrderDocument>;
    approveReturn(orderId: string): Promise<OrderDocument>;
    rejectReturn(orderId: string, dto: RejectReturnDto): Promise<OrderDocument>;
    processReturnRefund(orderId: string, dto?: ProcessReturnRefundDto): Promise<OrderDocument>;
    markRefunded(orderId: string, notes?: string): Promise<OrderDocument>;
    getMyOrders(userId?: string, guestId?: string, userEmail?: string, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: OrderDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
}
