import { CouponType, CouponApplicability } from '../schemas/coupon.schema.js';
export declare class CreateCouponDto {
    code: string;
    title?: string;
    description?: string;
    type: CouponType;
    value: number;
    applicability?: CouponApplicability;
    applicableProductIds?: string[];
    applicableCategoryIds?: string[];
    applicableCustomerIds?: string[];
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    userLimit?: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}
