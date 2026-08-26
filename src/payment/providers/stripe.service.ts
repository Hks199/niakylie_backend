import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mockstripekey123';
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_mocksecret123';
  }

  async createPaymentIntent(params: { amount: number; currency?: string; metadata?: Record<string, any> }): Promise<{
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  }> {
    const amountInCents = Math.round(params.amount * 100);
    const mockIntentId = `pi_str_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      id: mockIntentId,
      client_secret: `${mockIntentId}_secret_${Math.random().toString(36).substring(7)}`,
      amount: amountInCents,
      currency: params.currency || 'inr',
      status: 'requires_payment_method',
    };
  }

  async verifyPaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    amount: number;
    status: string;
  }> {
    return {
      id: paymentIntentId,
      amount: 1000,
      status: 'succeeded',
    };
  }

  async processRefund(params: { paymentIntentId: string; amount?: number }): Promise<{
    id: string;
    payment_intent: string;
    amount: number;
    status: string;
  }> {
    const mockRefundId = `re_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const amountInCents = params.amount ? Math.round(params.amount * 100) : 0;

    return {
      id: mockRefundId,
      payment_intent: params.paymentIntentId,
      amount: amountInCents,
      status: 'succeeded',
    };
  }
}
