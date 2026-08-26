import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({ description: 'Guest ID of cart created before user login', example: 'guest-uuid-1234' })
  @IsString()
  @IsNotEmpty()
  guestId!: string;
}
