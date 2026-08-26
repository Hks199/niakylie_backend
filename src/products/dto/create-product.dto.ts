import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariantDto } from './create-variant.dto.js';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Floral Print Kurti' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Full product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Brief summary for listing cards' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ description: 'Category ID', example: '60d5ecb8b392d40015f8a001' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ description: 'Brand ID', example: '60d5ecb8b392d40015f8a002' })
  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Product variants (color × size combinations)', type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];

  @ApiPropertyOptional({ description: 'Fabric material', example: 'Cotton' })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiPropertyOptional({ description: 'Print pattern', example: 'Floral' })
  @IsString()
  @IsOptional()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Ideal season', example: 'Summer' })
  @IsString()
  @IsOptional()
  season?: string;

  @ApiPropertyOptional({ description: 'Collection name', example: 'Festive 2025' })
  @IsString()
  @IsOptional()
  productCollection?: string;

  @ApiPropertyOptional({ description: 'Searchable tags', example: ['kurti', 'floral', 'cotton'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Tax percentage', example: 5, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Mark as featured product', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Mark as trending product', default: false })
  @IsBoolean()
  @IsOptional()
  isTrending?: boolean;

  @ApiPropertyOptional({ description: 'Mark as best seller', default: false })
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @ApiPropertyOptional({ description: 'SEO page title' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO meta keywords', example: ['kurti', 'women', 'ethnic'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seoKeywords?: string[];
}
