import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'About Us', description: 'Page title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'about-us', description: 'Unique page URL slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: '<h1>About NiaKylie</h1><p>Luxury ethnic fashion brand.</p>', description: 'HTML/Markdown content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'About NiaKylie - Luxury Ethnic Wear' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Discover NiaKylie handcrafted ethnic sarees, suits, and luxury dresses.' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: ['fashion', 'ethnic wear', 'sarees'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
