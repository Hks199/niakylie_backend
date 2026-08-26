import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBlogDto {
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

  @ApiPropertyOptional({ example: 'Styling Guide', description: 'Filter blogs by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'silk', description: 'Search query in blog title, content, or tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'sarees', description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;
}
