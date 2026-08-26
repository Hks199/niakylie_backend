import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { PaymentTransaction, PaymentTransactionSchema } from './schemas/payment-transaction.schema.js';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository.js';
import { RazorpayService } from './providers/razorpay.service.js';
import { StripeService } from './providers/stripe.service.js';
import { PaymentService } from './payment.service.js';
import { PaymentController } from './payment.controller.js';

import { CheckoutModule } from '../checkout/checkout.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    ]),
    ConfigModule,
    CheckoutModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentTransactionsRepository,
    RazorpayService,
    StripeService,
  ],
  exports: [PaymentService, PaymentTransactionsRepository, RazorpayService, StripeService],
})
export class PaymentModule {}
