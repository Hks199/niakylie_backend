import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'FLAT 50% OFF FESTIVE SALE | Use Code: FESTIVE50' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'Limited Time', default: 'Announcement' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ example: 'Tag', default: 'Tag' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#sale' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
