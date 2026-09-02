import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { GoogleOauthGuard } from './guards/google-oauth.guard.js';
import { CurrentUser } from '../shared/index.js';
import { User } from '../users/schemas/user.schema.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input payload' })
  @ApiResponse({ status: 499, description: 'Email address already in use' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account using email verification token' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Token is invalid or expired' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send or resend a 5-minute 6-digit OTP code' })
  @ApiResponse({ status: 200, description: 'OTP sent to email address' })
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit OTP code, activate account, and issue tokens' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code' })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successful login returning tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ─── ADMIN AUTHENTICATION ENDPOINTS ──────────────────────────────────────

  @Post('admin/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new administrator account (Role.ADMIN)' })
  @ApiResponse({ status: 201, description: 'Admin account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input payload' })
  @ApiResponse({ status: 401, description: 'Invalid admin registration secret key' })
  @ApiResponse({ status: 409, description: 'Email address already in use' })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin portal authentication (Enforces Role.ADMIN privileges)' })
  @ApiResponse({ status: 200, description: 'Successful admin login returning JWT tokens and admin user profile' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account non-admin privileges' })
  async loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('admin/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current admin session' })
  @ApiResponse({ status: 200, description: 'Admin session terminated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  async logoutAdmin(@Req() req: Request, @CurrentUser() user: User) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
    return this.authService.logout((user as any).id, refreshToken);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh user access token (token rotation)' })
  @ApiResponse({ status: 200, description: 'Access token successfully rotated' })
  @ApiResponse({ status: 401, description: 'Invalid or revoked refresh token' })
  async refresh(@Req() req: Request) {
    const user = req.user as { userId: string; refreshToken: string };
    return this.authService.refreshTokens(user.userId, user.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password recovery email' })
  @ApiResponse({ status: 200, description: 'If account exists, email trigger response returned' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password using token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  async logout(@Req() req: Request, @CurrentUser() user: User) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
    return this.authService.logout((user as any).id, refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout all device sessions' })
  @ApiResponse({ status: 200, description: 'All session tokens cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  async logoutAll(@CurrentUser() user: User) {
    return this.authService.logoutAllDevices((user as any).id);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Redirect to Google Identity login flow' })
  async googleAuth() {
    // Initiates redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google Identity redirect landing callback' })
  @ApiResponse({ status: 200, description: 'Google login successful, returning token payload' })
  async googleAuthRedirect(@Req() req: Request) {
    const googleUser = req.user as {
      googleId: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    return this.authService.googleLogin(googleUser);
  }
}
