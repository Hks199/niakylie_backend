import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID (Mongo ObjectId)', example: '60d5ecb8b392d40015f8a001' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ description: 'SKU code of product variant', example: 'NIA-A1B2C3' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'Variant ID', example: '60d5ecb8b392d40015f8a002' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Size', example: 'M' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ description: 'Color', example: 'Red' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Price', example: 1299 })
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Quantity to add to cart', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;

  @ApiPropertyOptional({ description: 'Guest ID header/identifier (for unauthenticated users)', example: 'guest-uuid-1234' })
  @IsString()
  @IsOptional()
  guestId?: string;
}
