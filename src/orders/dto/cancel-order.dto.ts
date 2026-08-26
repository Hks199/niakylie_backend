import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ example: 'Changed my mind', description: 'Reason for cancellation' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 'guest123', description: 'Guest ID for unauthenticated cancellations' })
  @IsOptional()
  @IsString()
  guestId?: string;
}
