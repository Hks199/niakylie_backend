import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string;
    subject: string;
    title: string;
    bodyHtml: string;
    buttonText?: string;
    buttonUrl?: string;
}
export declare class EmailProvider {
    private readonly configService;
    private readonly logger;
    private readonly fromEmail;
    private readonly transporter;
    constructor(configService: ConfigService);
    generateHtmlTemplate(options: EmailOptions): string;
    sendEmail(options: EmailOptions): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendOrderUpdateEmail(params: {
        to: string;
        orderNumber: string;
        status: string;
        trackingNumber?: string;
        courierPartner?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendOfferEmail(params: {
        to: string;
        title: string;
        message: string;
        offerUrl?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendCouponEmail(params: {
        to: string;
        couponCode: string;
        discountDetails: string;
        validTill?: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
