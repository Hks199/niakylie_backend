import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Promotional coupon code', example: 'WELCOME10' })
  @IsString()
  @IsNotEmpty()
  couponCode!: string;

  @ApiPropertyOptional({ description: 'Guest ID identifier (for unauthenticated users)', example: 'guest-uuid-1234' })
  @IsString()
  @IsOptional()
  guestId?: string;
}
