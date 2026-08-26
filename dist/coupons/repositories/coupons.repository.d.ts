import { Model } from 'mongoose';
import { CouponDocument } from '../schemas/coupon.schema.js';
import { CreateCouponDto } from '../dto/create-coupon.dto.js';
import { UpdateCouponDto } from '../dto/update-coupon.dto.js';
import { QueryCouponDto } from '../dto/query-coupon.dto.js';
export declare class CouponsRepository {
    private readonly couponModel;
    constructor(couponModel: Model<CouponDocument>);
    create(createDto: CreateCouponDto): Promise<CouponDocument>;
    findById(id: string): Promise<CouponDocument | null>;
    findByCode(code: string): Promise<CouponDocument | null>;
    findActiveCoupons(): Promise<CouponDocument[]>;
    findAll(queryDto: QueryCouponDto): Promise<{
        data: CouponDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateDto: UpdateCouponDto): Promise<CouponDocument | null>;
    incrementUsedCount(id: string): Promise<CouponDocument | null>;
    softDelete(id: string): Promise<CouponDocument | null>;
}
