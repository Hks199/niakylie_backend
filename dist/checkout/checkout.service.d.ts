import { OrdersRepository } from './repositories/orders.repository.js';
import { CartRepository } from '../cart/repositories/cart.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CheckoutSummaryDto } from './dto/checkout-summary.dto.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
import { OrderDocument, PaymentMethod, ShippingMethod } from './schemas/order.schema.js';
export interface CheckoutSummaryResponse {
    items: Array<{
        productId: string;
        variantId: string;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: number;
        unitMrp: number;
        color?: string;
        size?: string;
        image?: string;
        itemTotal: number;
        availableStock: number;
        isStockAvailable: boolean;
    }>;
    shippingAddress?: any;
    shippingInfo: {
        method: ShippingMethod;
        fee: number;
        estimatedDeliveryDays: string;
    };
    couponInfo?: {
        code: string;
        discountAmount: number;
    };
    pricing: {
        subtotal: number;
        totalMrp: number;
        totalDiscount: number;
        couponDiscount: number;
        tax: number;
        shippingFee: number;
        grandTotal: number;
    };
    availablePaymentMethods: PaymentMethod[];
    isCheckoutReady: boolean;
}
export declare class CheckoutService {
    private readonly ordersRepository;
    private readonly cartRepository;
    private readonly inventoryRepository;
    private readonly productsRepository;
    private readonly usersRepository;
    private readonly couponsService;
    private readonly notificationsService;
    constructor(ordersRepository: OrdersRepository, cartRepository: CartRepository, inventoryRepository: InventoryRepository, productsRepository: ProductsRepository, usersRepository: UsersRepository, couponsService: CouponsService, notificationsService: NotificationsService);
    private generateOrderNumber;
    private generateInvoiceNumber;
    getCheckoutSummary(userId?: string, dto?: CheckoutSummaryDto): Promise<CheckoutSummaryResponse>;
    validateCheckout(userId?: string, dto?: PlaceOrderDto): Promise<{
        valid: boolean;
        message: string;
        summary: CheckoutSummaryResponse;
    }>;
    placeOrder(userId?: string, dto?: PlaceOrderDto): Promise<OrderDocument>;
    getOrderById(orderIdOrNumber: string, userId?: string): Promise<OrderDocument>;
    getInvoice(orderIdOrNumber: string, userId?: string): Promise<{
        orderNumber: string;
        invoiceNumber: string;
        customerInfo: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
        shippingAddress: import("./schemas/order.schema.js").OrderAddress;
        items: import("./schemas/order.schema.js").OrderItem[];
        pricing: import("./schemas/order.schema.js").OrderPricing;
        paymentInfo: import("./schemas/order.schema.js").PaymentInfo;
        shippingInfo: import("./schemas/order.schema.js").ShippingInfo;
        htmlTemplate: string;
    }>;
}
