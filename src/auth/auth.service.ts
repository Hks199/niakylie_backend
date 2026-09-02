import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { hashPassword, comparePassword, Role } from '../shared/index.js';
import { UserDocument } from '../users/schemas/user.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Generates a 6-digit numeric OTP.
   */
  private generateNumericOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Registers a new customer and generates a 5-minute 6-digit OTP email.
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException('A user with this email address already exists');
      }

      // Re-send OTP if user exists but remains unverified
      const hashedPassword = await hashPassword(password);
      const otpCode = this.generateNumericOtp();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

      await this.usersRepository.update((existingUser as any).id, {
        $set: {
          password: hashedPassword,
          firstName,
          lastName,
          emailVerificationToken: otpCode,
          emailVerificationExpires: otpExpires,
        },
      });

      await this.mailService.sendOtpEmail(email, otpCode, firstName);

      return {
        message: 'OTP sent to your email address. Valid for 5 minutes.',
        email,
        isEmailVerified: false,
        otp: otpCode, // Provided for dev mode fallback
      };
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = this.generateNumericOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken: otpCode,
      emailVerificationExpires: otpExpires,
      isEmailVerified: false,
    });

    await this.mailService.sendOtpEmail(email, otpCode, firstName);

    return {
      message: 'Registration successful. An OTP has been sent to your email address.',
      email: user.email,
      isEmailVerified: false,
    };
  }

  /**
   * Generates and sends a fresh 5-minute OTP to the user.
   */
  async sendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    const otpCode = this.generateNumericOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.usersRepository.update((user as any).id, {
      $set: {
        emailVerificationToken: otpCode,
        emailVerificationExpires: otpExpires,
      },
    });

    await this.mailService.sendOtpEmail(email, otpCode, user.firstName);

    return {
      message: 'OTP sent to your email address. Valid for 5 minutes.',
      email,
    };
  }

  /**
   * Verifies the 6-digit OTP code against the database.
   */
  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    const trimmedOtp = (otp || '').trim();
    if (!trimmedOtp) {
      throw new BadRequestException('Please enter the 6-digit OTP code');
    }

    // Fetch user with emailVerificationToken & emailVerificationExpires
    const userWithToken = await this.usersRepository.findByVerificationToken(trimmedOtp);
    if (!userWithToken || (userWithToken as any).email.toLowerCase() !== email.toLowerCase().trim()) {
      throw new BadRequestException('Invalid OTP code. Please check your code and try again.');
    }

    const expires = (userWithToken as any).emailVerificationExpires;
    if (!expires || new Date(expires) < new Date()) {
      throw new BadRequestException('OTP has expired (5-minute limit). Please click Resend OTP.');
    }

    // Mark user verified and clear token
    const verifiedUser = await this.usersRepository.update((userWithToken as any).id, {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
    });

    return this.generateTokens(verifiedUser || userWithToken);
  }

  /**
   * Legacy link verification fallback.
   */
  async verifyEmail(token: string) {
    const user = await this.usersRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Verification token is invalid or has expired');
    }

    await this.usersRepository.update((user as any).id, {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Logs in a user, ensuring they are verified before generating tokens.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Enforce OTP verification requirement
    if (!user.isEmailVerified) {
      const otpCode = this.generateNumericOtp();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await this.usersRepository.update((user as any).id, {
        $set: {
          emailVerificationToken: otpCode,
          emailVerificationExpires: otpExpires,
        },
      });

      await this.mailService.sendOtpEmail(user.email, otpCode, user.firstName);

      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Account is not verified. An OTP has been sent to your email address.',
        isEmailVerified: false,
        email: user.email,
      });
    }

    return this.generateTokens(user);
  }

  /**
   * Registers a new administrator account with Role.ADMIN privileges and sends OTP.
   */
  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const { email, password, firstName, lastName, adminSecretKey } = registerAdminDto;

    const configuredSecret = this.configService.get<string>('ADMIN_SECRET_KEY');
    if (configuredSecret && adminSecretKey !== configuredSecret) {
      throw new UnauthorizedException('Invalid admin registration secret key');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser && existingUser.isEmailVerified) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = this.generateNumericOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user: UserDocument;
    if (existingUser) {
      const updated = await this.usersRepository.update((existingUser as any).id, {
        $set: {
          password: hashedPassword,
          firstName,
          lastName,
          roles: [Role.ADMIN],
          emailVerificationToken: otpCode,
          emailVerificationExpires: otpExpires,
        },
      });
      user = updated || existingUser;
    } else {
      user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: [Role.ADMIN],
        emailVerificationToken: otpCode,
        emailVerificationExpires: otpExpires,
        isEmailVerified: false,
      });
    }

    await this.mailService.sendOtpEmail(email, otpCode, firstName);

    return {
      message: 'Admin registered successfully. An OTP has been sent to your email address.',
      email: user.email,
      isEmailVerified: false,
    };
  }

  /**
   * Authenticates an admin account, verifying admin role and email verification.
   */
  async loginAdmin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Admin account has been deactivated');
    }

    const hasAdminRole =
      user.roles &&
      user.roles.some(
        (r) =>
          r === Role.ADMIN ||
          r === Role.SUPER_ADMIN ||
          (r as string).toUpperCase() === 'ADMIN',
      );

    if (!hasAdminRole) {
      throw new UnauthorizedException('Access Denied: This account does not have Admin privileges');
    }

    // Enforce OTP verification requirement for Admin
    if (!user.isEmailVerified) {
      const otpCode = this.generateNumericOtp();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await this.usersRepository.update((user as any).id, {
        $set: {
          emailVerificationToken: otpCode,
          emailVerificationExpires: otpExpires,
        },
      });

      await this.mailService.sendOtpEmail(user.email, otpCode, user.firstName);

      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Admin account is not verified. An OTP has been sent to your email address.',
        isEmailVerified: false,
        email: user.email,
      });
    }

    return this.generateTokens(user);
  }

  /**
   * Refreshes access token and rotates the refresh token.
   */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Access Denied');
    }

    const userWithTokens = await this.usersRepository.findByEmail(user.email, true);
    if (!userWithTokens || !userWithTokens.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked');
    }

    await this.usersRepository.removeRefreshToken((user as any).id, refreshToken);
    return this.generateTokens(user);
  }

  /**
   * Removes current refresh token to log out.
   */
  async logout(userId: string, refreshToken: string) {
    await this.usersRepository.removeRefreshToken(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * Clears all sessions/refresh tokens to log out all devices.
   */
  async logoutAllDevices(userId: string) {
    await this.usersRepository.clearRefreshTokens(userId);
    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * Initiates password recovery — checks registered user email and sends 5-minute OTP.
   */
  async forgotPassword(email: string) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    const user = await this.usersService.findByEmail(trimmedEmail);
    if (!user) {
      throw new BadRequestException('No registered account found with this email address.');
    }

    const resetToken = this.generateNumericOtp();
    const resetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.usersRepository.update((user as any).id, {
      $set: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    await this.mailService.sendOtpEmail(trimmedEmail, resetToken, user.firstName);

    return {
      message: 'A 6-digit password reset OTP has been sent to your email address.',
      email: trimmedEmail,
    };
  }

  /**
   * Verifies reset token (OTP) and updates user password.
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, email } = resetPasswordDto;

    const trimmedOtp = (token || '').trim();
    if (!trimmedOtp) {
      throw new BadRequestException('Please enter the 6-digit OTP code.');
    }

    const user = await this.usersRepository.findByResetToken(trimmedOtp);
    if (!user) {
      throw new BadRequestException('Invalid OTP code or password reset token has expired.');
    }

    if (email && user.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw new BadRequestException('Invalid OTP code for this email address.');
    }

    const hashedPassword = await hashPassword(password);

    await this.usersRepository.update((user as any).id, {
      $set: { password: hashedPassword, refreshTokens: [] },
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  /**
   * Google OAuth Callback processor.
   */
  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleUser.email);

      if (user) {
        user = await this.usersRepository.update((user as any).id, {
          $set: { googleId: googleUser.googleId, isEmailVerified: true },
        });
      } else {
        user = await this.usersService.create({
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          isEmailVerified: true,
        });
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    return this.generateTokens(user);
  }

  /**
   * Helper to sign access + refresh token pairs and save refresh token in db.
   */
  private async generateTokens(user: UserDocument) {
    const payload = { sub: (user as any).id, email: user.email, roles: user.roles };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiration') || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.refreshExpiration') || '7d') as any,
    });

    await this.usersRepository.addRefreshToken((user as any).id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user as any).id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
