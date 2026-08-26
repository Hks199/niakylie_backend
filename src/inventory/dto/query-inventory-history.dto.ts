import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { InventoryAdjustmentType } from '../schemas/inventory-history.schema.js';

export class QueryInventoryHistoryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit items per page', example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by SKU', example: 'NIA-A1B2C3' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'Filter by adjustment type', enum: InventoryAdjustmentType })
  @IsEnum(InventoryAdjustmentType)
  @IsOptional()
  adjustmentType?: InventoryAdjustmentType;
}
