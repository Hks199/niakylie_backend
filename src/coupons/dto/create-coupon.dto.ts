import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType, CouponApplicability } from '../schemas/coupon.schema.js';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME10', description: 'Unique uppercase coupon promo code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Welcome 10% Off', description: 'Coupon title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Get 10% discount on your first order', description: 'Coupon description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE, description: 'Discount type (FLAT or PERCENTAGE)' })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty({ example: 10, description: 'Discount value (amount for FLAT, percentage for PERCENTAGE)' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ enum: CouponApplicability, example: CouponApplicability.ALL, description: 'Applicability scope' })
  @IsOptional()
  @IsEnum(CouponApplicability)
  applicability?: CouponApplicability;

  @ApiPropertyOptional({ type: [String], description: 'Applicable product IDs (for PRODUCT scope)' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicableProductIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Applicable category IDs (for CATEGORY scope)' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicableCategoryIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Applicable customer user IDs (for CUSTOMER scope)' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicableCustomerIds?: string[];

  @ApiPropertyOptional({ example: 500, description: 'Minimum order subtotal requirement' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 200, description: 'Maximum discount ceiling (for PERCENTAGE type)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Total max usages across all customers' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Max usages allowed per individual customer' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  userLimit?: number;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z', description: 'Coupon start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Coupon expiration date' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: true, description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
