"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_js_1 = require("../users/users.service.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const mail_service_js_1 = require("../mail/mail.service.js");
const index_js_1 = require("../shared/index.js");
let AuthService = class AuthService {
    usersService;
    usersRepository;
    jwtService;
    configService;
    mailService;
    constructor(usersService, usersRepository, jwtService, configService, mailService) {
        this.usersService = usersService;
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    generateNumericOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async register(registerDto) {
        const { email, password, firstName, lastName } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            if (existingUser.isEmailVerified) {
                throw new common_1.ConflictException('A user with this email address already exists');
            }
            const hashedPassword = await (0, index_js_1.hashPassword)(password);
            const otpCode = this.generateNumericOtp();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            await this.usersRepository.update(existingUser.id, {
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
                otp: otpCode,
            };
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        const otpCode = this.generateNumericOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
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
    async sendOtp(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('No account found with this email address');
        }
        const otpCode = this.generateNumericOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.usersRepository.update(user.id, {
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
    async verifyOtp(email, otp) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('No account found with this email address');
        }
        const trimmedOtp = (otp || '').trim();
        if (!trimmedOtp) {
            throw new common_1.BadRequestException('Please enter the 6-digit OTP code');
        }
        const userWithToken = await this.usersRepository.findByVerificationToken(trimmedOtp);
        if (!userWithToken || userWithToken.email.toLowerCase() !== email.toLowerCase().trim()) {
            throw new common_1.BadRequestException('Invalid OTP code. Please check your code and try again.');
        }
        const expires = userWithToken.emailVerificationExpires;
        if (!expires || new Date(expires) < new Date()) {
            throw new common_1.BadRequestException('OTP has expired (5-minute limit). Please click Resend OTP.');
        }
        const verifiedUser = await this.usersRepository.update(userWithToken.id, {
            $set: { isEmailVerified: true },
            $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
        });
        return this.generateTokens(verifiedUser || userWithToken);
    }
    async verifyEmail(token) {
        const user = await this.usersRepository.findByVerificationToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Verification token is invalid or has expired');
        }
        await this.usersRepository.update(user.id, {
            $set: { isEmailVerified: true },
            $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
        });
        return { message: 'Email verified successfully. You can now log in.' };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email, true);
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await (0, index_js_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Your account has been deactivated');
        }
        if (!user.isEmailVerified) {
            const otpCode = this.generateNumericOtp();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            await this.usersRepository.update(user.id, {
                $set: {
                    emailVerificationToken: otpCode,
                    emailVerificationExpires: otpExpires,
                },
            });
            await this.mailService.sendOtpEmail(user.email, otpCode, user.firstName);
            throw new common_1.UnauthorizedException({
                statusCode: 401,
                message: 'Account is not verified. An OTP has been sent to your email address.',
                isEmailVerified: false,
                email: user.email,
            });
        }
        return this.generateTokens(user);
    }
    async registerAdmin(registerAdminDto) {
        const { email, password, firstName, lastName, adminSecretKey } = registerAdminDto;
        const configuredSecret = this.configService.get('ADMIN_SECRET_KEY') ||
            this.configService.get('admin.secretKey');
        if (configuredSecret && adminSecretKey !== configuredSecret) {
            throw new common_1.UnauthorizedException('Invalid admin registration secret key');
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser && existingUser.isEmailVerified) {
            throw new common_1.ConflictException('An account with this email address already exists');
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        const otpCode = this.generateNumericOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        let user;
        if (existingUser) {
            const updated = await this.usersRepository.update(existingUser.id, {
                $set: {
                    password: hashedPassword,
                    firstName,
                    lastName,
                    roles: [index_js_1.Role.ADMIN],
                    emailVerificationToken: otpCode,
                    emailVerificationExpires: otpExpires,
                },
            });
            user = updated || existingUser;
        }
        else {
            user = await this.usersService.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roles: [index_js_1.Role.ADMIN],
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
    async loginAdmin(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email, true);
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid admin email or password');
        }
        const isPasswordValid = await (0, index_js_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid admin email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Admin account has been deactivated');
        }
        const hasAdminRole = user.roles &&
            user.roles.some((r) => r === index_js_1.Role.ADMIN ||
                r === index_js_1.Role.SUPER_ADMIN ||
                r.toUpperCase() === 'ADMIN');
        if (!hasAdminRole) {
            throw new common_1.UnauthorizedException('Access Denied: This account does not have Admin privileges');
        }
        if (!user.isEmailVerified) {
            const otpCode = this.generateNumericOtp();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            await this.usersRepository.update(user.id, {
                $set: {
                    emailVerificationToken: otpCode,
                    emailVerificationExpires: otpExpires,
                },
            });
            await this.mailService.sendOtpEmail(user.email, otpCode, user.firstName);
            throw new common_1.UnauthorizedException({
                statusCode: 401,
                message: 'Admin account is not verified. An OTP has been sent to your email address.',
                isEmailVerified: false,
                email: user.email,
            });
        }
        return this.generateTokens(user);
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const userWithTokens = await this.usersRepository.findByEmail(user.email, true);
        if (!userWithTokens || !userWithTokens.refreshTokens.includes(refreshToken)) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or has been revoked');
        }
        await this.usersRepository.removeRefreshToken(user.id, refreshToken);
        return this.generateTokens(user);
    }
    async logout(userId, refreshToken) {
        await this.usersRepository.removeRefreshToken(userId, refreshToken);
        return { message: 'Logged out successfully' };
    }
    async logoutAllDevices(userId) {
        await this.usersRepository.clearRefreshTokens(userId);
        return { message: 'Logged out from all devices successfully' };
    }
    async forgotPassword(email) {
        const trimmedEmail = (email || '').trim().toLowerCase();
        if (!trimmedEmail) {
            throw new common_1.BadRequestException('Please enter a valid email address.');
        }
        const user = await this.usersService.findByEmail(trimmedEmail);
        if (!user) {
            throw new common_1.BadRequestException('No registered account found with this email address.');
        }
        const resetToken = this.generateNumericOtp();
        const resetExpires = new Date(Date.now() + 5 * 60 * 1000);
        await this.usersRepository.update(user.id, {
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
    async resetPassword(resetPasswordDto) {
        const { token, password, email } = resetPasswordDto;
        const trimmedOtp = (token || '').trim();
        if (!trimmedOtp) {
            throw new common_1.BadRequestException('Please enter the 6-digit OTP code.');
        }
        const user = await this.usersRepository.findByResetToken(trimmedOtp);
        if (!user) {
            throw new common_1.BadRequestException('Invalid OTP code or password reset token has expired.');
        }
        if (email && user.email.toLowerCase() !== email.trim().toLowerCase()) {
            throw new common_1.BadRequestException('Invalid OTP code for this email address.');
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        await this.usersRepository.update(user.id, {
            $set: { password: hashedPassword, refreshTokens: [] },
            $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
        });
        return { message: 'Password has been reset successfully. You can now log in.' };
    }
    async googleLogin(googleUser) {
        let user = await this.usersService.findByGoogleId(googleUser.googleId);
        if (!user) {
            user = await this.usersService.findByEmail(googleUser.email);
            if (user) {
                user = await this.usersRepository.update(user.id, {
                    $set: { googleId: googleUser.googleId, isEmailVerified: true },
                });
            }
            else {
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
            throw new common_1.UnauthorizedException('Your account has been deactivated');
        }
        return this.generateTokens(user);
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, roles: user.roles };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: (this.configService.get('jwt.expiration') || '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: (this.configService.get('jwt.refreshExpiration') || '7d'),
        });
        await this.usersRepository.addRefreshToken(user.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                isEmailVerified: user.isEmailVerified,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_js_1.UsersService,
        users_repository_js_1.UsersRepository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_js_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map