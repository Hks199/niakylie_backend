import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemInputDto {
  @ApiProperty({ example: '60d5ecb8b392d40015f8a001' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d40015f8a002' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME10', description: 'Coupon promo code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 2000, description: 'Cart subtotal' })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiPropertyOptional({ type: [CartItemInputDto], description: 'Items in cart' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  items?: CartItemInputDto[];

  @ApiPropertyOptional({ example: '60d5ecb8b392d40015f8a004', description: 'User ID applying coupon' })
  @IsOptional()
  @IsString()
  userId?: string;
}
