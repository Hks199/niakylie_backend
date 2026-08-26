import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token received via verification process',
    example: 'abc123xyzverificationtoken',
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token!: string;
}
