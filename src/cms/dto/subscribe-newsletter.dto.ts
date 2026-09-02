import { IsOptional, IsEmail, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Subscriber email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: '9589928337', description: 'Subscriber mobile number' })
  @IsOptional()
  @IsString({ message: 'Please enter a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'FOOTER', description: 'Subscription origin source' })
  @IsOptional()
  @IsString()
  source?: string;
}
