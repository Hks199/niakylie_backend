import { PaymentMethod, ShippingMethod } from '../schemas/order.schema.js';
import { AddressDto } from './address.dto.js';
export declare class CustomerInfoDto {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
}
export declare class PlaceOrderDto {
    addressId?: string;
    shippingAddress?: AddressDto;
    billingAddress?: AddressDto;
    customerInfo?: CustomerInfoDto;
    paymentMethod: PaymentMethod;
    shippingMethod?: ShippingMethod;
    couponCode?: string;
    guestId?: string;
    shippingType?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    stripePaymentIntentId?: string;
    items?: any[];
}
