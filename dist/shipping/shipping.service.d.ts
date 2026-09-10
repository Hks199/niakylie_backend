import { Model } from 'mongoose';
import { ShippingConfigDocument } from './schemas/shipping-config.schema.js';
import { UpdateShippingConfigDto } from './dto/update-shipping-config.dto.js';
export declare class ShippingService {
    private readonly shippingConfigModel;
    constructor(shippingConfigModel: Model<ShippingConfigDocument>);
    getConfig(): Promise<ShippingConfigDocument>;
    updateConfig(dto: UpdateShippingConfigDto): Promise<ShippingConfigDocument>;
    calculateFee(subtotal: number, isExpress?: boolean): Promise<number>;
}
