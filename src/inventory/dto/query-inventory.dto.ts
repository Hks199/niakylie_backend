import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockStatus } from '../schemas/inventory.schema.js';

export class QueryInventoryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit items per page', example: 10, default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Keyword search (SKU)', example: 'NIA-A1B2C3' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Stock status filter', enum: StockStatus })
  @IsEnum(StockStatus)
  @IsOptional()
  status?: StockStatus;

  @ApiPropertyOptional({ description: 'Filter low-stock items only (LOW_STOCK or OUT_OF_STOCK)', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  lowStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'availableStock', default: 'updatedAt' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'updatedAt';

  @ApiPropertyOptional({ description: 'Sort direction', example: 'asc', default: 'asc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
