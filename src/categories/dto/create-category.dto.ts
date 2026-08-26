import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Ethnic Wear',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Parent category Mongo ID for nested structures (null for root)',
    example: '60d5ecb8b392d40015f8a001',
    default: null,
  })
  @IsMongoId({ message: 'Parent ID must be a valid Mongo ID' })
  @IsOptional()
  parentId?: string | null = null;

  @ApiPropertyOptional({
    description: 'Detailed description of the category',
    example: 'Traditional wear including sarees, lehengas, and kurtas',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'SEO Optimized page title',
    example: 'Buy Traditional Indian Women Ethnic Wear Online - NiaKylie',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta description tag content',
    example: 'Shop the latest collection of women ethnic wear including sarees, suits and Kurtis.',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta keywords list',
    example: ['ethnic wear', 'sarees', 'kurtas', 'lehengas'],
    type: [String],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seoKeywords?: string[];
}

