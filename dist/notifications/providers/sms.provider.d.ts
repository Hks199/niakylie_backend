import { ConfigService } from '@nestjs/config';
export interface SmsOptions {
    to: string;
    message: string;
    senderId?: string;
}
export declare class SmsProvider {
    private readonly configService;
    private readonly logger;
    private readonly isEnabled;
    constructor(configService: ConfigService);
    sendSms(options: SmsOptions): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendOrderUpdateSms(params: {
        to: string;
        orderNumber: string;
        status: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendCouponSms(params: {
        to: string;
        couponCode: string;
        discountText: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
