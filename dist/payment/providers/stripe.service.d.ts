import { ConfigService } from '@nestjs/config';
export declare class StripeService {
    private readonly configService;
    private readonly secretKey;
    private readonly webhookSecret;
    constructor(configService: ConfigService);
    createPaymentIntent(params: {
        amount: number;
        currency?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        client_secret: string;
        amount: number;
        currency: string;
        status: string;
    }>;
    verifyPaymentIntent(paymentIntentId: string): Promise<{
        id: string;
        amount: number;
        status: string;
    }>;
    processRefund(params: {
        paymentIntentId: string;
        amount?: number;
    }): Promise<{
        id: string;
        payment_intent: string;
        amount: number;
        status: string;
    }>;
}
