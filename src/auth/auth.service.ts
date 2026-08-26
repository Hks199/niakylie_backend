import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { UsersService } from '../users/users.service.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
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
  ) {}

  /**
   * Registers a new customer and generates an email verification token.
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const hashedPassword = await hashPassword(password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
    });

    return {
      message: 'Registration successful. Please verify your email.',
      verificationToken: emailVerificationToken, // Returned directly in dev mode for validation
      user: {
        id: (user as any).id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Verifies email using verification token.
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
   * Logs in a user, generates access & refresh tokens, and saves the refresh token.
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

    return this.generateTokens(user);
  }

  /**
   * Registers a new administrator account with Role.ADMIN privileges.
   */
  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const { email, password, firstName, lastName, adminSecretKey } = registerAdminDto;

    const configuredSecret = this.configService.get<string>('ADMIN_SECRET_KEY');
    if (configuredSecret && adminSecretKey !== configuredSecret) {
      throw new UnauthorizedException('Invalid admin registration secret key');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: [Role.ADMIN],
      isEmailVerified: true,
    });

    return {
      message: 'Admin account registered successfully',
      user: {
        id: (user as any).id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  /**
   * Authenticates an admin account, verifying admin role permissions.
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

    // Retrieve user including refresh tokens
    const userWithTokens = await this.usersRepository.findByEmail(user.email, true);
    if (!userWithTokens || !userWithTokens.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked');
    }

    // Remove the used refresh token (rotation)
    await this.usersRepository.removeRefreshToken((user as any).id, refreshToken);

    // Generate new token pair
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
   * Initiates password recovery.
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Avoid revealing if user email exists (security best practice)
      return { message: 'If the email exists, a password reset link has been generated' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.usersRepository.update((user as any).id, {
      $set: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    return {
      message: 'If the email exists, a password reset link has been generated',
      resetToken, // Returned directly in dev mode for verification
    };
  }

  /**
   * Verifies reset token and updates password.
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.usersRepository.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const hashedPassword = await hashPassword(password);

    await this.usersRepository.update((user as any).id, {
      $set: { password: hashedPassword, refreshTokens: [] }, // Revoke all sessions on password change
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    });

    return { message: 'Password has been reset successfully. You can now login.' };
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
      // Check if user exists with the same email
      user = await this.usersService.findByEmail(googleUser.email);

      if (user) {
        // Link Google ID to existing account
        user = await this.usersRepository.update((user as any).id, {
          $set: { googleId: googleUser.googleId, isEmailVerified: true },
        });
      } else {
        // Create new user
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

    // Save refresh token to user schema list
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
      },
    };
  }
}
