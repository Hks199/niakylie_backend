import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType, BannerPosition } from '../schemas/banner.schema.js';

export class QueryBannerDto {
  @ApiPropertyOptional({ enum: BannerType, example: BannerType.HOMEPAGE, description: 'Filter by banner type' })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiPropertyOptional({ enum: BannerPosition, example: BannerPosition.TOP, description: 'Filter by banner position' })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

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
