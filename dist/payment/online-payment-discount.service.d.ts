import { OnlinePaymentDiscountRepository } from './repositories/online-payment-discount.repository.js';
import { UpdateOnlineDiscountDto } from './dto/update-online-discount.dto.js';
export declare class OnlinePaymentDiscountService {
    private readonly repo;
    constructor(repo: OnlinePaymentDiscountRepository);
    getConfig(): Promise<import("./schemas/online-payment-discount.schema.js").OnlinePaymentDiscountDocument>;
    updateConfig(dto: UpdateOnlineDiscountDto): Promise<import("./schemas/online-payment-discount.schema.js").OnlinePaymentDiscountDocument>;
    calculateDiscount(orderSubtotalAfterCoupon: number): Promise<number>;
}
