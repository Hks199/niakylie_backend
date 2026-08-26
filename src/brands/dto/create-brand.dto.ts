import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Brand name',
    example: 'Zara',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the brand profile',
    example: 'Global fast-fashion store featuring high-end women clothing collections',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'SEO Optimized page title',
    example: 'Shop Women Zara Clothing Online - NiaKylie',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta description tag content',
    example: 'Buy Zara women clothing at great discounts. Exclusive dresses, outerwear and accessories.',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO Meta keywords list',
    example: ['zara', 'fast-fashion', 'women clothing', 'dresses'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seoKeywords?: string[];
}
