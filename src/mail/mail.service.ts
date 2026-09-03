import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);
    const user = this.configService.get<string>('SMTP_USER') || '';
    const pass = this.configService.get<string>('SMTP_PASS') || '';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
      connectionTimeout: 10000, // 10s TCP connection timeout
      greetingTimeout: 10000,   // 10s SMTP greeting timeout
      socketTimeout: 15000,     // 15s socket inactivity timeout
    });
  }

  async sendOtpEmail(to: string, otp: string, firstName?: string): Promise<boolean> {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!user || !pass) {
      this.logger.warn(
        `SMTP_USER or SMTP_PASS is missing in .env. Real email delivery to ${to} is skipped. (Dev OTP: ${otp})`,
      );
      return true;
    }

    const from = this.configService.get<string>('SMTP_FROM') || '"NiaKylie Fashion" <no-reply@niakylie.com>';
    const name = firstName || 'Valued Customer';

    // Locate NiaKylie brand logo image from backend uploads directory
    const explicitLogoPath = 'D:\\niakylie_backend\\public\\uploads\\niakylie_logo.png';
    const fallbackLogoPath = path.resolve(process.cwd(), 'public', 'uploads', 'niakylie_logo.png');
    
    let logoPath = '';
    if (fs.existsSync(explicitLogoPath)) {
      logoPath = explicitLogoPath;
    } else if (fs.existsSync(fallbackLogoPath)) {
      logoPath = fallbackLogoPath;
    }

    const hasLogo = logoPath !== '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NiaKylie OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Playfair Display', Georgia, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #881337 100%); padding: 36px 24px 28px 24px; text-align: center;">
              ${
                hasLogo
                  ? `
                <div style="background-color: rgba(255, 255, 255, 0.96); display: inline-block; padding: 14px 28px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(212, 175, 55, 0.5); margin-bottom: 12px;">
                  <img src="cid:niakylie-logo" alt="NiaKylie Couture" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto;" />
                </div>
              `
                  : `
                <h1 style="color: #d4af37; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: 2px;">NIAKYLIE</h1>
                <p style="color: #e2e8f0; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Women Collection</p>
              `
              }
              <div style="height: 2px; width: 60px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 12px auto 0 auto;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 12px 0; text-align: center; letter-spacing: -0.3px;">
                Account Verification Code
              </h2>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; text-align: center;">
                Hello <strong style="color: #881337;">${name}</strong>,
              </p>
              
              <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                Thank you for choosing <strong>NiaKylie Fashion</strong>. Please use the 6-digit One-Time Passcode (OTP) below to verify your email address and secure your account:
              </p>

              <!-- 6-Digit OTP Display Box -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 20px; padding: 24px 16px; text-align: center; margin: 0 0 28px 0; border: 1px solid #be123c; box-shadow: 0 8px 20px rgba(136, 19, 55, 0.2);">
                <span style="font-family: 'Courier New', Courier, monospace; color: #fbbf24; font-size: 38px; font-weight: 800; letter-spacing: 12px; display: inline-block; text-shadow: 0 2px 8px rgba(251, 191, 36, 0.4); padding-left: 12px;">
                  ${otp}
                </span>
                <p style="color: #94a3b8; font-size: 11px; margin: 10px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                  🔒 6-Digit Verification Code
                </p>
              </div>

              <!-- 5-Minute Expiration Callout -->
              <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #be123c; padding: 14px 16px; border-radius: 12px; margin-bottom: 24px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="28" valign="top" style="font-size: 16px;">⏱️</td>
                    <td style="color: #9f1239; font-size: 12px; line-height: 1.5; font-weight: 600;">
                      <strong>Strict Security Expiration:</strong> This code is valid for <strong style="color: #be123c; text-decoration: underline;">5 minutes only</strong>. Never share your OTP with anyone.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you did not initiate this request, please ignore this message or contact customer support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0; font-weight: 700;">
                NiaKylie — Women Collection & Executive Fashion
              </p>
              <p style="color: #94a3b8; font-size: 10px; margin: 0;">
                © ${new Date().getFullYear()} NiaKylie Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const attachments = hasLogo
      ? [
          {
            filename: 'niakylie_logo.png',
            path: logoPath,
            cid: 'niakylie-logo',
          },
        ]
      : [];

    try {
      const sendPromise = this.transporter.sendMail({
        from,
        to,
        subject: `${otp} is your NiaKylie Verification Code`,
        html: htmlContent,
        attachments,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SMTP Email Sending Timed Out (15s limit)')), 15000)
      );

      await Promise.race([sendPromise, timeoutPromise]);
      this.logger.log(`OTP email sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.warn(`Could not send SMTP email to ${to} (Dev Mode Fallback): ${error?.message || error}`);
      return false;
    }
  }
}
