import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity (0 removes item from cart)', example: 2 })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity!: number;

  @ApiPropertyOptional({ description: 'Guest ID identifier (for unauthenticated users)', example: 'guest-uuid-1234' })
  @IsString()
  @IsOptional()
  guestId?: string;
}
