import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsOptions {
  to: string;
  message: string;
  senderId?: string;
}

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('SMS_ENABLED') || false;
  }

  async sendSms(options: SmsOptions): Promise<{ success: boolean; messageId: string }> {
    const mockMessageId = `sms_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Extensible hook for Twilio / AWS SNS / MSG91 client SDKs
    this.logger.log(
      `[SmsProvider] Dispatching SMS to '${options.to}' | Message: '${options.message}' | MessageId: ${mockMessageId}`,
    );

    return { success: true, messageId: mockMessageId };
  }

  async sendOrderUpdateSms(params: {
    to: string;
    orderNumber: string;
    status: string;
  }): Promise<{ success: boolean; messageId: string }> {
    const message = `NiaKylie Update: Your order #${params.orderNumber} is now ${params.status}. Track: https://niakylie.com/track`;
    return this.sendSms({ to: params.to, message });
  }

  async sendCouponSms(params: {
    to: string;
    couponCode: string;
    discountText: string;
  }): Promise<{ success: boolean; messageId: string }> {
    const message = `NiaKylie: Use code ${params.couponCode} to get ${params.discountText}. Shop now at https://niakylie.com`;
    return this.sendSms({ to: params.to, message });
  }
}
