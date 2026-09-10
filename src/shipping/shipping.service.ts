import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingConfig, ShippingConfigDocument } from './schemas/shipping-config.schema.js';
import { UpdateShippingConfigDto } from './dto/update-shipping-config.dto.js';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingConfig.name)
    private readonly shippingConfigModel: Model<ShippingConfigDocument>,
  ) {}

  async getConfig(): Promise<ShippingConfigDocument> {
    let config = await this.shippingConfigModel.findOne().exec();
    if (!config) {
      config = await this.shippingConfigModel.create({
        standardDeliveryFee: 99,
        expressDeliveryFee: 149,
        freeShippingThreshold: 1000,
      });
    }
    return config;
  }

  async updateConfig(dto: UpdateShippingConfigDto): Promise<ShippingConfigDocument> {
    return this.shippingConfigModel.findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true }).exec();
  }

  async calculateFee(subtotal: number, isExpress = false): Promise<number> {
    if (subtotal <= 0) return 0;
    const config = await this.getConfig();
    if (isExpress) return config.expressDeliveryFee;
    return subtotal >= config.freeShippingThreshold ? 0 : config.standardDeliveryFee;
  }
}
