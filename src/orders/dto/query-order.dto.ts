import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../checkout/schemas/order.schema.js';

export class QueryOrderDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.SHIPPED })
  @IsOptional()
  orderStatus?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.SHIPPED })
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'NK-ORD-20260807', description: 'Search by order number, invoice, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'Filter from date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31', description: 'Filter to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
