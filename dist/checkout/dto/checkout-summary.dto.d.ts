import { ShippingMethod } from '../schemas/order.schema.js';
import { AddressDto } from './address.dto.js';
export declare class CheckoutSummaryDto {
    shippingAddress?: AddressDto;
    shippingMethod?: ShippingMethod;
    couponCode?: string;
    guestId?: string;
}
