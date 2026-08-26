import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({
    description: 'Enable email notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Enable SMS notifications',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @ApiPropertyOptional({
    description: 'Enable push notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  push?: boolean;
}
