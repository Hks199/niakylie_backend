import { CheckoutService } from './checkout.service.js';
import { CheckoutSummaryDto } from './dto/checkout-summary.dto.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
    private extractUserIdAndGuestId;
    getCheckoutSummary(dto: CheckoutSummaryDto, req: any, guestIdHeader?: string): Promise<import("./checkout.service.js").CheckoutSummaryResponse>;
    validateCheckout(dto: PlaceOrderDto, req: any, guestIdHeader?: string): Promise<{
        valid: boolean;
        message: string;
        summary: import("./checkout.service.js").CheckoutSummaryResponse;
    }>;
    placeOrder(dto: PlaceOrderDto, req: any, guestIdHeader?: string): Promise<import("./schemas/order.schema.js").OrderDocument>;
    getOrder(orderId: string, req: any): Promise<import("./schemas/order.schema.js").OrderDocument>;
    getInvoice(orderId: string, req: any): Promise<{
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
