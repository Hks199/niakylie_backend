import { DiscountType } from '../schemas/online-payment-discount.schema.js';
export declare class UpdateOnlineDiscountDto {
    isEnabled?: boolean;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountCap?: number;
    badgeText?: string;
    description?: string;
}
