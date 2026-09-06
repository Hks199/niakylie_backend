import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  ArrayMinSize,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnItemDto {
  @ApiProperty({ example: '60d5ecb8b392d40015f8a001', description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d40015f8a002', description: 'Variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ example: 'NK-SAR-001-RED-M', description: 'SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 1, description: 'Quantity to return' })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CodRefundDetailsDto {
  @ApiPropertyOptional({ example: 'ananya@upi', description: 'UPI ID for COD refund' })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({ example: '123456789012', description: 'Bank account number' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234', description: 'Bank IFSC code' })
  @IsOptional()
  @IsString()
  bankIfsc?: string;

  @ApiPropertyOptional({ example: 'Ananya Roy', description: 'Account holder name' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;
}

export class RequestReturnDto {
  @ApiProperty({ example: 'NK-ORD-20260807-1234', description: 'Order number to request return for' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'Product arrived damaged', description: 'Reason for return request' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 'The saree had a torn edge on arrival', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [ReturnItemDto],
    description: 'Item-level return selection (at least one item required)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items!: ReturnItemDto[];

  @ApiPropertyOptional({
    enum: ['UPI', 'BANK'],
    description: 'COD refund preference (required when order was paid via COD)',
  })
  @IsOptional()
  @IsIn(['UPI', 'BANK'])
  refundMethod?: 'UPI' | 'BANK';

  @ApiPropertyOptional({ type: CodRefundDetailsDto, description: 'UPI / bank details for COD refunds' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodRefundDetailsDto)
  refundDetails?: CodRefundDetailsDto;

  @ApiPropertyOptional({ type: [String], description: 'Optional evidence image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
