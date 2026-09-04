import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../schemas/online-payment-discount.schema.js';

export class UpdateOnlineDiscountDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountCap?: number;

  @ApiPropertyOptional({ example: 'EXTRA 5% OFF ON ONLINE PAYMENTS' })
  @IsOptional()
  @IsString()
  badgeText?: string;

  @ApiPropertyOptional({ example: 'Pay via UPI or Cards to get extra instant discount' })
  @IsOptional()
  @IsString()
  description?: string;
}
