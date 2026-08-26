import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType, BannerPosition } from '../schemas/banner.schema.js';

export class CreateBannerDto {
  @ApiProperty({ example: 'Festive Diwali Sale', description: 'Banner title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Up to 50% off on all ethnic wear' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ enum: BannerType, example: BannerType.FESTIVAL, description: 'Banner type: HOMEPAGE, OFFER, FESTIVAL, POPUP' })
  @IsEnum(BannerType)
  @IsNotEmpty()
  type!: BannerType;

  @ApiPropertyOptional({ enum: BannerPosition, example: BannerPosition.TOP })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({ example: 'https://niakylie.com/sale', description: 'CTA link destination' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 'Shop Now', description: 'CTA button label' })
  @IsOptional()
  @IsString()
  linkLabel?: string;

  @ApiPropertyOptional({ example: 1, description: 'Sorting order for display' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00Z', description: 'Schedule start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-31T23:59:59Z', description: 'Schedule end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: { campaign: 'diwali2026' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
