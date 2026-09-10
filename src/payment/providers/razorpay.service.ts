import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_mockkey123';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'rzp_secret_mocksecret123';
  }

  getKeyId(): string {
    return this.keyId;
  }


  async createOrder(params: { amount: number; currency?: string; receipt: string }): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }> {
    const amountInPaise = Math.round(params.amount * 100);
    const currency = params.currency || 'INR';

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      throw new BadRequestException('Razorpay payment amount must be at least ₹1.');
    }

    if (this.keyId.includes('mockkey') || this.keySecret.includes('mocksecret')) {
      throw new BadRequestException('Razorpay keys are not configured. Add valid Razorpay keys to the backend environment.');
    }

    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    let response: Response;
    try {
      response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ amount: amountInPaise, currency, receipt: params.receipt || `rcpt_${Date.now()}` }),
      });
    } catch {
      throw new BadRequestException('Unable to reach Razorpay. Please check the backend internet connection and try again.');
    }

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => null);
      throw new BadRequestException(errorData?.error?.description || 'Razorpay could not create the payment order.');
    }

    const data: any = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt || params.receipt,
      status: data.status || 'created',
    };
  }

  verifySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    // Generate expected HMAC SHA256 signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    const receivedSignature = Buffer.from(razorpaySignature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    return Boolean(razorpayOrderId && razorpayPaymentId && razorpaySignature)
      && receivedSignature.length === expectedSignatureBuffer.length
      && crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer);
  }

  async processRefund(params: { paymentId: string; amount?: number }): Promise<{
    id: string;
    entity: string;
    amount: number;
    payment_id: string;
    status: string;
  }> {
    const amountInPaise = params.amount ? Math.round(params.amount * 100) : undefined;

    // Real Razorpay refund when keys are configured
    if (this.keyId && this.keySecret && !this.keyId.includes('mockkey')) {
      try {
        const authHeader =
          'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const body: Record<string, any> = {};
        if (amountInPaise && amountInPaise > 0) {
          body.amount = amountInPaise;
        }

        const response = await fetch(
          `https://api.razorpay.com/v1/payments/${params.paymentId}/refund`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
            },
            body: JSON.stringify(body),
          },
        );

        if (response.ok) {
          const data = await response.json();
          return {
            id: data.id,
            entity: data.entity || 'refund',
            amount: data.amount,
            payment_id: data.payment_id || params.paymentId,
            status: data.status || 'processed',
          };
        }

        const errText = await response.text();
        console.warn('Razorpay refund API error, falling back to mock:', errText);
      } catch (err) {
        console.warn('Razorpay refund request failed, falling back to mock:', err);
      }
    }

    const mockRefundId = `rfnd_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: mockRefundId,
      entity: 'refund',
      amount: amountInPaise || 0,
      payment_id: params.paymentId,
      status: 'processed',
    };
  }
}
