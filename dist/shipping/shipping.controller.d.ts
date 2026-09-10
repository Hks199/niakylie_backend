import { UpdateShippingConfigDto } from './dto/update-shipping-config.dto.js';
import { ShippingService } from './shipping.service.js';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    getConfig(): Promise<import("./schemas/shipping-config.schema.js").ShippingConfigDocument>;
    getAdminConfig(): Promise<import("./schemas/shipping-config.schema.js").ShippingConfigDocument>;
    updateConfig(dto: UpdateShippingConfigDto): Promise<import("./schemas/shipping-config.schema.js").ShippingConfigDocument>;
}
