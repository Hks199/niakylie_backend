import { ConfigService } from '@nestjs/config';
export declare class RazorpayService {
    private readonly configService;
    private readonly keyId;
    private readonly keySecret;
    constructor(configService: ConfigService);
    createOrder(params: {
        amount: number;
        currency?: string;
        receipt: string;
    }): Promise<{
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
    }>;
    verifySignature(params: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }): boolean;
    processRefund(params: {
        paymentId: string;
        amount?: number;
    }): Promise<{
        id: string;
        entity: string;
        amount: number;
        payment_id: string;
        status: string;
    }>;
}
