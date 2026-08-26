import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentType } from '../schemas/payment-transaction.schema.js';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: '60d5ecb8b392d40015f8a020', description: 'Order Mongo ID or Order Number' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.RAZORPAY, description: 'Selected payment provider' })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider!: PaymentProvider;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.FULL, description: 'Payment type (FULL or PARTIAL)' })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({ example: 500, description: 'Partial payment amount if paymentType is PARTIAL' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  partialAmount?: number;

  @ApiPropertyOptional({ example: 'guest123', description: 'Guest ID if unauthenticated' })
  @IsOptional()
  @IsString()
  guestId?: string;
}
