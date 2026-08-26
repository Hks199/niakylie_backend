import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../../shared/index.js';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'customer@niakylie.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    description: 'Password of the user (min 8 characters)',
    example: 'SecurePass123!',
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
    description: 'First name of the user',
    example: 'Jane',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;
}
