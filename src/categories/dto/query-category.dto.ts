import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCategoryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Limit size of paginated array list (Max: 500)',
    example: 100,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Keyword search (matches regex against name, slug, or description)',
    example: 'Ethnic',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort expression (e.g., "-createdAt" for descending or "name" for ascending)',
    example: '-createdAt',
    default: '-createdAt',
  })
  @IsString()
  @IsOptional()
  sort?: string = '-createdAt';

  @ApiPropertyOptional({
    description: 'Field name to sort results by (optional alternative to sort)',
    example: 'name',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sorting direction (asc or desc) if sortBy is used',
    example: 'asc',
    default: 'asc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filter categories by parent ID. Use "null" to fetch top-level root categories.',
    example: '60d5ecb8b392d40015f8a001',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Filter categories by active status flag',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  status?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? String(value) : value))
  _t?: string;
}

