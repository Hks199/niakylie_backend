"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailProvider = EmailProvider_1 = class EmailProvider {
    configService;
    logger = new common_1.Logger(EmailProvider_1.name);
    fromEmail;
    transporter;
    constructor(configService) {
        this.configService = configService;
        const host = this.configService.get('SMTP_HOST') || 'smtp.gmail.com';
        const port = parseInt(this.configService.get('SMTP_PORT') || '587', 10);
        const user = this.configService.get('SMTP_USER') || '';
        const pass = this.configService.get('SMTP_PASS') || '';
        this.fromEmail = this.configService.get('SMTP_FROM') || 'no-reply@niakylie.com';
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
    generateHtmlTemplate(options) {
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
            : ''}
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
    async sendEmail(options) {
        const html = this.generateHtmlTemplate(options);
        const mockMessageId = `msg_email_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
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
        }
        catch (err) {
            this.logger.warn(`[EmailProvider SMTP Fallback] Failed to send email to '${options.to}': ${err?.message || err}. (Fallback mock MessageId: ${mockMessageId})`);
            return { success: true, messageId: mockMessageId };
        }
    }
    async sendOrderUpdateEmail(params) {
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
    async sendOfferEmail(params) {
        return this.sendEmail({
            to: params.to,
            subject: params.title,
            title: params.title,
            bodyHtml: `<p>${params.message}</p>`,
            buttonText: 'Shop Special Offer',
            buttonUrl: params.offerUrl || 'https://niakylie.com/offers',
        });
    }
    async sendCouponEmail(params) {
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
};
exports.EmailProvider = EmailProvider;
exports.EmailProvider = EmailProvider = EmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProvider);
//# sourceMappingURL=email.provider.js.map