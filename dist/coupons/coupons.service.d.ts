import { CouponsRepository } from './repositories/coupons.repository.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { ValidateCouponDto, CartItemInputDto } from './dto/validate-coupon.dto.js';
import { QueryCouponDto } from './dto/query-coupon.dto.js';
import { CouponDocument, CouponType } from './schemas/coupon.schema.js';
export interface CouponValidationResult {
    valid: boolean;
    code: string;
    type: CouponType;
    discountAmount: number;
    message: string;
    coupon: CouponDocument;
}
export declare class CouponsService {
    private readonly couponsRepository;
    constructor(couponsRepository: CouponsRepository);
    createCoupon(createDto: CreateCouponDto): Promise<CouponDocument>;
    findAll(queryDto: QueryCouponDto): Promise<{
        data: CouponDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findActiveCoupons(): Promise<CouponDocument[]>;
    findById(id: string): Promise<CouponDocument>;
    findByCode(code: string): Promise<CouponDocument>;
    calculateDiscount(coupon: CouponDocument, subtotal: number, items?: CartItemInputDto[]): number;
    validateCoupon(dto: ValidateCouponDto): Promise<CouponValidationResult>;
    updateCoupon(id: string, updateDto: UpdateCouponDto): Promise<CouponDocument>;
    toggleStatus(id: string): Promise<CouponDocument>;
    recordUsage(id: string): Promise<CouponDocument>;
    deleteCoupon(id: string): Promise<CouponDocument>;
}
