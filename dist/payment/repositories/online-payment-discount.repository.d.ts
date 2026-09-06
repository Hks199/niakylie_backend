import { Model } from 'mongoose';
import { OnlinePaymentDiscountDocument } from '../schemas/online-payment-discount.schema.js';
import { UpdateOnlineDiscountDto } from '../dto/update-online-discount.dto.js';
export declare class OnlinePaymentDiscountRepository {
    private readonly discountModel;
    constructor(discountModel: Model<OnlinePaymentDiscountDocument>);
    getConfig(): Promise<OnlinePaymentDiscountDocument>;
    updateConfig(dto: UpdateOnlineDiscountDto): Promise<OnlinePaymentDiscountDocument>;
}
