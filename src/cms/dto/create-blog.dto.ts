import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ example: 'Top 5 Festive Silk Sarees for Weddings', description: 'Blog post title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'top-5-festive-silk-sarees-weddings', description: 'Blog post URL slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: '<h1>Silk Sarees Guide</h1><p>Detailed guide content...</p>', description: 'HTML/Markdown content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'A comprehensive styling guide for silk sarees during wedding season.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ example: 'https://cdn.niakylie.com/blogs/silk-saree.jpg' })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'NiaKylie Fashion Editorial' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: 'Styling Guide' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['silk', 'sarees', 'weddings'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Top 5 Silk Sarees - Styling Guide' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Discover the top 5 handcrafted silk sarees for this wedding season.' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
