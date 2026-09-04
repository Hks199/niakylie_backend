import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OnlinePaymentDiscount,
  OnlinePaymentDiscountDocument,
  DiscountType,
} from '../schemas/online-payment-discount.schema.js';
import { UpdateOnlineDiscountDto } from '../dto/update-online-discount.dto.js';

@Injectable()
export class OnlinePaymentDiscountRepository {
  constructor(
    @InjectModel(OnlinePaymentDiscount.name)
    private readonly discountModel: Model<OnlinePaymentDiscountDocument>,
  ) {}

  async getConfig(): Promise<OnlinePaymentDiscountDocument> {
    let config = await this.discountModel.findOne().exec();
    if (!config) {
      config = await this.discountModel.create({
        isEnabled: true,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
        minOrderAmount: 0,
        maxDiscountCap: 500,
        badgeText: 'EXTRA 5% OFF ON ONLINE PAYMENTS',
        description: 'Pay via UPI or Cards to get extra instant discount',
      });
    }
    return config;
  }

  async updateConfig(dto: UpdateOnlineDiscountDto): Promise<OnlinePaymentDiscountDocument> {
    const updated = await this.discountModel
      .findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true })
      .exec();
    return updated;
  }
}
