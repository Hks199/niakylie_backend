import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';
import { QueryCouponDto } from './dto/query-coupon.dto.js';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(createDto: CreateCouponDto): Promise<import("./schemas/coupon.schema.js").CouponDocument>;
    findAll(queryDto: QueryCouponDto): Promise<{
        data: import("./schemas/coupon.schema.js").CouponDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findActive(): Promise<import("./schemas/coupon.schema.js").CouponDocument[]>;
    validate(validateDto: ValidateCouponDto): Promise<import("./coupons.service.js").CouponValidationResult>;
    findByCode(code: string): Promise<import("./schemas/coupon.schema.js").CouponDocument>;
    findOne(id: string): Promise<import("./schemas/coupon.schema.js").CouponDocument>;
    update(id: string, updateDto: UpdateCouponDto): Promise<import("./schemas/coupon.schema.js").CouponDocument>;
    toggleStatus(id: string): Promise<import("./schemas/coupon.schema.js").CouponDocument>;
    remove(id: string): Promise<void>;
}
