import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { Role } from '../shared/index.js';
export declare class AuthService {
    private readonly usersService;
    private readonly usersRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly mailService;
    constructor(usersService: UsersService, usersRepository: UsersRepository, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    private generateNumericOtp;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        email: string;
        isEmailVerified: boolean;
        otp: string;
    }>;
    sendOtp(email: string): Promise<{
        message: string;
        email: string;
        otp: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: Role[];
            isEmailVerified: boolean;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: Role[];
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
            roles: Role[];
            isEmailVerified: boolean;
        };
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: Role[];
            isEmailVerified: boolean;
        };
    }>;
    logout(userId: string, refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAllDevices(userId: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        email: string;
        otp: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    googleLogin(googleUser: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            firstName: string;
            lastName: string;
            roles: Role[];
            isEmailVerified: boolean;
        };
    }>;
    private generateTokens;
}
