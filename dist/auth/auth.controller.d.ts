import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { User } from '../users/schemas/user.schema.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        email: string;
        isEmailVerified: boolean;
        otp: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    sendOtp(email: string): Promise<{
        message: string;
        email: string;
        otp: string;
    }>;
    verifyOtp(body: {
        email: string;
        otp: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: import("../shared/index.js").Role[];
            isEmailVerified: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: import("../shared/index.js").Role[];
            isEmailVerified: boolean;
        };
    }>;
    registerAdmin(registerAdminDto: RegisterAdminDto): Promise<{
        message: string;
        email: string;
        isEmailVerified: boolean;
        otp: string;
    }>;
    loginAdmin(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: import("../shared/index.js").Role[];
            isEmailVerified: boolean;
        };
    }>;
    logoutAdmin(req: Request, user: User): Promise<{
        message: string;
    }>;
    refresh(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: import("../shared/index.js").Role[];
            isEmailVerified: boolean;
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        email: string;
        otp: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    logout(req: Request, user: User): Promise<{
        message: string;
    }>;
    logoutAll(user: User): Promise<{
        message: string;
    }>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: import("../shared/index.js").Role[];
            isEmailVerified: boolean;
        };
    }>;
}
