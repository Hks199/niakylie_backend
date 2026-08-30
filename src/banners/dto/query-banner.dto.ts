import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType } from '../schemas/banner.schema.js';

export class QueryBannerDto {
  @ApiPropertyOptional({ enum: BannerType, example: BannerType.HOMEPAGE, description: 'Filter by banner type' })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Timestamp cache buster' })
  @IsOptional()
  @IsString()
  _t?: string;
}
