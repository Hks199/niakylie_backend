import { IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AggregationPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z', description: 'Start date filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', description: 'End date filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: AggregationPeriod, example: AggregationPeriod.MONTHLY, description: 'Grouping period for revenue chart' })
  @IsOptional()
  @IsEnum(AggregationPeriod)
  period?: AggregationPeriod;

  @ApiPropertyOptional({ example: 10, description: 'Number of top items to return' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
