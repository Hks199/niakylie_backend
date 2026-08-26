import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { InventoryAdjustmentType } from '../schemas/inventory-history.schema.js';

export class AdjustStockDto {
  @ApiProperty({ description: 'SKU code of product variant', example: 'NIA-A1B2C3' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({
    description: 'Stock quantity adjustment delta (positive for add/restock, negative for deduction/damage)',
    example: 50,
  })
  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({
    description: 'Reason / type of adjustment',
    enum: InventoryAdjustmentType,
    example: InventoryAdjustmentType.RESTOCK,
  })
  @IsEnum(InventoryAdjustmentType)
  @IsNotEmpty()
  adjustmentType!: InventoryAdjustmentType;

  @ApiPropertyOptional({ description: 'Optional explanation or reference number', example: 'Shipment batch #2026-08' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Custom low stock threshold for this SKU', example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}
