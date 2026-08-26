import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, ShippingMethod } from '../schemas/order.schema.js';
import { AddressDto } from './address.dto.js';

export class CustomerInfoDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class PlaceOrderDto {
  @ApiProperty({ description: 'Shipping address details' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  shippingAddress!: AddressDto;

  @ApiPropertyOptional({ description: 'Billing address details (defaults to shipping address if omitted)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @ApiPropertyOptional({ description: 'Customer details (required for guest checkout)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo?: CustomerInfoDto;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD, description: 'Selected payment method' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ enum: ShippingMethod, example: ShippingMethod.STANDARD, description: 'Selected shipping method' })
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
