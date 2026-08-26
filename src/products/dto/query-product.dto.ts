import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', example: 12, default: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Keyword search (name, description, tags)', example: 'kurti' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug or ID (alias)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Minimum offer price', example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum offer price', example: 3000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by colors (comma-separated)', example: 'Red,Blue' })
  @IsString()
  @IsOptional()
  colors?: string;

  @ApiPropertyOptional({ description: 'Filter by sizes (comma-separated)', example: 'S,M,L' })
  @IsString()
  @IsOptional()
  sizes?: string;

  @ApiPropertyOptional({ description: 'Filter by material', example: 'Cotton' })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiPropertyOptional({ description: 'Filter by pattern', example: 'Floral' })
  @IsString()
  @IsOptional()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Filter by season', example: 'Summer' })
  @IsString()
  @IsOptional()
  season?: string;

  @ApiPropertyOptional({ description: 'Filter by collection', example: 'Festive 2025' })
  @IsString()
  @IsOptional()
  productCollection?: string;

  @ApiPropertyOptional({ description: 'Featured products only', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Trending products only', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isTrending?: boolean;

  @ApiPropertyOptional({ description: 'Best sellers only', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isBestSeller?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    default: 'createdAt',
    enum: ['name', 'price', 'averageRating', 'reviewsCount', 'createdAt'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', example: 'desc', default: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Sort option alias (recommended, price-low, price-high, newest, rating)', example: 'recommended' })
  @IsString()
  @IsOptional()
  sort?: string;
}
