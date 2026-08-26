import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateVariantDto {
  @ApiPropertyOptional({
    description: 'SKU code. Auto-generated (NIA-XXXXXX) if omitted.',
    example: 'NIA-A1B2C3',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'EAN / UPC barcode',
    example: '8901234567890',
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ description: 'Color name', example: 'Midnight Black' })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiPropertyOptional({ description: 'Color hex code', example: '#1a1a1a' })
  @IsString()
  @IsOptional()
  colorHex?: string;

  @ApiProperty({ description: 'Size label', example: 'M' })
  @IsString()
  @IsNotEmpty()
  size!: string;

  @ApiPropertyOptional({ description: 'Current stock quantity', example: 50, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'Maximum Retail Price (₹)', example: 2499 })
  @IsNumber()
  @Min(0)
  mrp!: number;

  @ApiProperty({ description: 'Selling / Offer Price (₹) — must be ≤ MRP', example: 1799 })
  @IsNumber()
  @Min(0)
  offerPrice!: number;

  @ApiPropertyOptional({
    description: 'Whether this variant is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
