import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../../shared/index.js';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Security reset token received via forgot password request',
    example: 'abc123xyzresettoken',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token!: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewSecurePass123!',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password cannot be longer than ${PASSWORD_MAX_LENGTH} characters`,
  })
  password!: string;
}
