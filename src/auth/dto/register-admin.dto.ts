import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../../shared/index.js';

export class RegisterAdminDto {
  @ApiProperty({
    description: 'Email address of the admin',
    example: 'admin@niakylie.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    description: 'Security password for the admin (min 8 characters)',
    example: 'AdminSecurePass123!',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password cannot be longer than ${PASSWORD_MAX_LENGTH} characters`,
  })
  password!: string;

  @ApiProperty({
    description: 'First name of the admin user',
    example: 'System',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the admin user',
    example: 'Administrator',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Optional admin secret key for registration authorization',
    example: 'NK_ADMIN_SECRET_KEY_2026',
  })
  @IsOptional()
  @IsString()
  adminSecretKey?: string;
}
