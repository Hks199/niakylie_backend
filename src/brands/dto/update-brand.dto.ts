import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateBrandDto } from './create-brand.dto.js';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @ApiPropertyOptional({
    description: 'Active status of the brand',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
