import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Keyword query (searches title, description, tags, brand, category)', example: 'cotton kurti' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID', example: '60d5ecb8b392d40015f8a001' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID', example: '60d5ecb8b392d40015f8a002' })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Comma-separated colors', example: 'Red,Blue,Pink' })
  @IsString()
  @IsOptional()
  colors?: string;

  @ApiPropertyOptional({ description: 'Comma-separated sizes', example: 'S,M,L,XL' })
  @IsString()
  @IsOptional()
  sizes?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter', example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter', example: 3000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum discount percentage filter (0-100)', example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minDiscount?: number;

  @ApiPropertyOptional({ description: 'Minimum rating filter (1-5)', example: 4.0 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Sort by criteria',
    enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'newest'],
    default: 'relevance',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' = 'relevance';

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page limit', example: 12, default: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Bypass Redis cache', example: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  nocache?: boolean;
}
