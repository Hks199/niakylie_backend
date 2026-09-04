import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { PaymentTransaction, PaymentTransactionSchema } from './schemas/payment-transaction.schema.js';
import { OnlinePaymentDiscount, OnlinePaymentDiscountSchema } from './schemas/online-payment-discount.schema.js';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository.js';
import { OnlinePaymentDiscountRepository } from './repositories/online-payment-discount.repository.js';
import { RazorpayService } from './providers/razorpay.service.js';
import { StripeService } from './providers/stripe.service.js';
import { PaymentService } from './payment.service.js';
import { OnlinePaymentDiscountService } from './online-payment-discount.service.js';
import { PaymentController } from './payment.controller.js';

import { CheckoutModule } from '../checkout/checkout.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
      { name: OnlinePaymentDiscount.name, schema: OnlinePaymentDiscountSchema },
    ]),
    ConfigModule,
    CheckoutModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentTransactionsRepository,
    OnlinePaymentDiscountService,
    OnlinePaymentDiscountRepository,
    RazorpayService,
    StripeService,
  ],
  exports: [
    PaymentService,
    PaymentTransactionsRepository,
    OnlinePaymentDiscountService,
    OnlinePaymentDiscountRepository,
    RazorpayService,
    StripeService,
  ],
})
export class PaymentModule {}
