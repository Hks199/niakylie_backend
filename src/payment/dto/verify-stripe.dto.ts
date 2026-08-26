import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyStripeDto {
  @ApiProperty({ example: 'pi_3MtwBwLkdIwHu7ix28a3tLvW', description: 'Stripe PaymentIntent ID' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;
}
