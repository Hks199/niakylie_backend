import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRazorpayOrderDto {
  @ApiProperty({ example: 1499, description: 'Amount in INR' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'NK-ORD-20260903-1234', description: 'Order ID or Number (optional)' })
  @IsOptional()
  @IsString()
  orderId?: string;
}
