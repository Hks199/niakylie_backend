import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../schemas/payment-transaction.schema.js';

export class RetryPaymentDto {
  @ApiProperty({ example: 'NK-ORD-20260807-1234', description: 'Order ID or Order Number to retry payment for' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.RAZORPAY, description: 'Selected payment provider' })
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider!: PaymentProvider;
}
