import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CouponsRepository } from './repositories/coupons.repository.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { ValidateCouponDto, CartItemInputDto } from './dto/validate-coupon.dto.js';
import { QueryCouponDto } from './dto/query-coupon.dto.js';
import { CouponDocument, CouponType, CouponApplicability } from './schemas/coupon.schema.js';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type: CouponType;
  discountAmount: number;
  message: string;
  coupon: CouponDocument;
}

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async createCoupon(createDto: CreateCouponDto): Promise<CouponDocument> {
    const existing = await this.couponsRepository.findByCode(createDto.code);
    if (existing) {
      throw new ConflictException(`Coupon code '${createDto.code.toUpperCase()}' already exists`);
    }

    if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.couponsRepository.create(createDto);
  }

  async findAll(queryDto: QueryCouponDto) {
    return this.couponsRepository.findAll(queryDto);
  }

  async findActiveCoupons(): Promise<CouponDocument[]> {
    return this.couponsRepository.findActiveCoupons();
  }

  async findById(id: string): Promise<CouponDocument> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponsRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundException(`Coupon with code '${code}' not found`);
    }
    return coupon;
  }

  calculateDiscount(
    coupon: CouponDocument,
    subtotal: number,
    items?: CartItemInputDto[],
  ): number {
    let eligibleSubtotal = subtotal;

    // Calculate eligible subtotal based on applicability scope
    if (coupon.applicability === CouponApplicability.PRODUCT && items?.length) {
      const productIds = (coupon.applicableProductIds || []).map((id) => id.toString());
      eligibleSubtotal = items
        .filter((item) => productIds.includes(item.productId))
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    } else if (coupon.applicability === CouponApplicability.CATEGORY && items?.length) {
      const categoryIds = (coupon.applicableCategoryIds || []).map((id) => id.toString());
      eligibleSubtotal = items
        .filter((item) => item.categoryId && categoryIds.includes(item.categoryId))
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }

    if (eligibleSubtotal <= 0) {
      return 0;
    }

    let discount = 0;
    if (coupon.type === CouponType.FLAT) {
      discount = Math.min(coupon.value, eligibleSubtotal);
    } else if (coupon.type === CouponType.PERCENTAGE) {
      discount = Math.round(eligibleSubtotal * (coupon.value / 100));
      if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    return Math.min(discount, subtotal);
  }

  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const coupon = await this.couponsRepository.findByCode(dto.code);

    if (!coupon || !coupon.isActive || coupon.isDeleted) {
      throw new NotFoundException(`Coupon code '${dto.code}' is invalid or inactive`);
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException(`Coupon code '${dto.code}' is not active yet`);
    }

    if (now > coupon.endDate) {
      throw new BadRequestException(`Coupon code '${dto.code}' has expired`);
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon code '${dto.code}' usage limit has been reached`);
    }

    if (dto.subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Minimum subtotal requirement of ₹${coupon.minOrderAmount} not met for coupon '${dto.code}'`,
      );
    }

    // Check Customer Scope
    if (coupon.applicability === CouponApplicability.CUSTOMER) {
      const customerIds = (coupon.applicableCustomerIds || []).map((id) => id.toString());
      if (!dto.userId || !customerIds.includes(dto.userId)) {
        throw new BadRequestException(`Coupon code '${dto.code}' is not valid for this customer`);
      }
    }

    // Check Product Scope
    if (coupon.applicability === CouponApplicability.PRODUCT) {
      const productIds = (coupon.applicableProductIds || []).map((id) => id.toString());
      const hasProduct = dto.items?.some((item) => productIds.includes(item.productId));
      if (!hasProduct) {
        throw new BadRequestException(`Coupon '${dto.code}' is not applicable to any items in cart`);
      }
    }

    // Check Category Scope
    if (coupon.applicability === CouponApplicability.CATEGORY) {
      const categoryIds = (coupon.applicableCategoryIds || []).map((id) => id.toString());
      const hasCategory = dto.items?.some(
        (item) => item.categoryId && categoryIds.includes(item.categoryId),
      );
      if (!hasCategory) {
        throw new BadRequestException(`Coupon '${dto.code}' is not applicable to any categories in cart`);
      }
    }

    const discountAmount = this.calculateDiscount(coupon, dto.subtotal, dto.items);

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      message: 'Coupon applied successfully',
      coupon,
    };
  }

  async updateCoupon(id: string, updateDto: UpdateCouponDto): Promise<CouponDocument> {
    const existing = await this.findById(id);

    if (updateDto.code && updateDto.code.toUpperCase() !== existing.code) {
      const duplicate = await this.couponsRepository.findByCode(updateDto.code);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new ConflictException(`Coupon code '${updateDto.code.toUpperCase()}' is already taken`);
      }
    }

    const updated = await this.couponsRepository.update(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return updated;
  }

  async toggleStatus(id: string): Promise<CouponDocument> {
    const coupon = await this.findById(id);
    const updated = await this.couponsRepository.update(id, { isActive: !coupon.isActive });
    if (!updated) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return updated;
  }

  async recordUsage(id: string): Promise<CouponDocument> {
    const updated = await this.couponsRepository.incrementUsedCount(id);
    if (!updated) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return updated;
  }

  async deleteCoupon(id: string): Promise<CouponDocument> {
    const deleted = await this.couponsRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Coupon with ID '${id}' not found`);
    }
    return deleted;
  }
}
