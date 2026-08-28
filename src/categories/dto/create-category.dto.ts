import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
    description: 'Category slug (auto-generated from name if omitted)',
    example: 'ethnic-wear',
  })
  @IsString()
  @IsOptional()
  slug?: string;

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
    description: 'Display order priority number',
    example: 0,
    default: 0,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Active status flag of category',
    example: true,
    default: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

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

