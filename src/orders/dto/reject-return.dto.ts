import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectReturnDto {
  @ApiProperty({
    example: 'Item shows signs of use / hygiene product cannot be returned',
    description: 'Reason for rejecting the return request',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
