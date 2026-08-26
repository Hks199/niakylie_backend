import { IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingMethod } from '../schemas/order.schema.js';
import { AddressDto } from './address.dto.js';

export class CheckoutSummaryDto {
  @ApiPropertyOptional({ description: 'Shipping address details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @ApiPropertyOptional({ enum: ShippingMethod, example: ShippingMethod.STANDARD, description: 'Shipping method' })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional({ example: 'WELCOME10', description: 'Promo coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'guest123', description: 'Guest ID if unauthenticated' })
  @IsOptional()
  @IsString()
  guestId?: string;
}
