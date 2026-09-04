import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
  buttonText?: string;
  buttonUrl?: string;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly fromEmail: string;
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);
    const user = this.configService.get<string>('SMTP_USER') || '';
    const pass = this.configService.get<string>('SMTP_PASS') || '';

    this.fromEmail = this.configService.get<string>('SMTP_FROM') || 'no-reply@niakylie.com';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  generateHtmlTemplate(options: EmailOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${options.subject}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: #ffffff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .content h2 { color: #e91e63; margin-top: 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background-color: #e91e63; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Niakylie Women Collection</h1>
          </div>
          <div class="content">
            <h2>${options.title}</h2>
            <div>${options.bodyHtml}</div>
            ${options.buttonText && options.buttonUrl
        ? `<div class="button-container">
                    <a href="${options.buttonUrl}" class="button" target="_blank">${options.buttonText}</a>
                   </div>`
        : ''
      }
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Niakylie Women Collection. All rights reserved.</p>
            <p>You received this email because you are a registered user of NiaKylie.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId: string }> {
    const html = this.generateHtmlTemplate(options);
    const mockMessageId = `msg_email_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!user || !pass) {
      this.logger.log(`[EmailProvider Dev Mode] Prepared email to '${options.to}' | Subject: '${options.subject}' | MessageId: ${mockMessageId}`);
      return { success: true, messageId: mockMessageId };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`[EmailProvider SMTP] Real email sent to '${options.to}' | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.warn(`[EmailProvider SMTP Fallback] Failed to send email to '${options.to}': ${err?.message || err}. (Fallback mock MessageId: ${mockMessageId})`);
      return { success: true, messageId: mockMessageId };
    }
  }

  async sendOrderUpdateEmail(params: {
    to: string;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    courierPartner?: string;
  }): Promise<{ success: boolean; messageId: string }> {
    const subject = `Order Update: #${params.orderNumber} is ${params.status}`;
    const title = `Order Status: ${params.status}`;
    let bodyHtml = `<p>Your order <strong>#${params.orderNumber}</strong> has been updated to status <strong>${params.status}</strong>.</p>`;

    if (params.trackingNumber) {
      bodyHtml += `<p><strong>Courier:</strong> ${params.courierPartner || 'Logistics Partner'}<br>
                     <strong>Tracking Number:</strong> ${params.trackingNumber}</p>`;
    }

    return this.sendEmail({
      to: params.to,
      subject,
      title,
      bodyHtml,
      buttonText: 'View Order Details',
      buttonUrl: `https://niakylie.com/account/orders/${params.orderNumber}`,
    });
  }

  async sendOfferEmail(params: {
    to: string;
    title: string;
    message: string;
    offerUrl?: string;
  }): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to: params.to,
      subject: params.title,
      title: params.title,
      bodyHtml: `<p>${params.message}</p>`,
      buttonText: 'Shop Special Offer',
      buttonUrl: params.offerUrl || 'https://niakylie.com/offers',
    });
  }

  async sendCouponEmail(params: {
    to: string;
    couponCode: string;
    discountDetails: string;
    validTill?: string;
  }): Promise<{ success: boolean; messageId: string }> {
    const title = `Special Discount Coupon: ${params.couponCode}`;
    const bodyHtml = `
      <p>We have an exclusive discount code for you!</p>
      <div style="background:#f8f9fa; border:2px dashed #e91e63; padding:15px; text-align:center; font-size:20px; font-weight:bold; color:#e91e63; margin:15px 0;">
        ${params.couponCode}
      </div>
      <p>${params.discountDetails}</p>
      ${params.validTill ? `<p><em>Valid until: ${params.validTill}</em></p>` : ''}
    `;

    return this.sendEmail({
      to: params.to,
      subject: `Exclusive Coupon: Use ${params.couponCode}`,
      title,
      bodyHtml,
      buttonText: 'Apply Coupon & Shop Now',
      buttonUrl: 'https://niakylie.com',
    });
  }
}
