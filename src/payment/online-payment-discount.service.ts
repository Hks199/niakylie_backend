import { Injectable } from '@nestjs/common';
import { OnlinePaymentDiscountRepository } from './repositories/online-payment-discount.repository.js';
import { UpdateOnlineDiscountDto } from './dto/update-online-discount.dto.js';
import { DiscountType } from './schemas/online-payment-discount.schema.js';

@Injectable()
export class OnlinePaymentDiscountService {
  constructor(private readonly repo: OnlinePaymentDiscountRepository) {}

  async getConfig() {
    return this.repo.getConfig();
  }

  async updateConfig(dto: UpdateOnlineDiscountDto) {
    return this.repo.updateConfig(dto);
  }

  async calculateDiscount(orderSubtotalAfterCoupon: number): Promise<number> {
    const config = await this.getConfig();

    const isEnabled = config && (config.isEnabled === true || (config.isEnabled as any) === 'true');
    if (!isEnabled) {
      return 0;
    }

    if (config.minOrderAmount && orderSubtotalAfterCoupon < config.minOrderAmount) {
      return 0;
    }

    let discount = 0;
    if (config.discountType === DiscountType.PERCENTAGE) {
      discount = Math.round((orderSubtotalAfterCoupon * config.discountValue) / 100);
      if (config.maxDiscountCap && config.maxDiscountCap > 0) {
        discount = Math.min(discount, config.maxDiscountCap);
      }
    } else {
      discount = Math.round(config.discountValue);
    }

    return Math.max(0, Math.min(discount, orderSubtotalAfterCoupon));
  }
}
