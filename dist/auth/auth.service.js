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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const users_service_js_1 = require("../users/users.service.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const index_js_1 = require("../shared/index.js");
let AuthService = class AuthService {
    usersService;
    usersRepository;
    jwtService;
    configService;
    constructor(usersService, usersRepository, jwtService, configService) {
        this.usersService = usersService;
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email address already exists');
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
            verificationToken: emailVerificationToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
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
        return this.generateTokens(user);
    }
    async registerAdmin(registerAdminDto) {
        const { email, password, firstName, lastName, adminSecretKey } = registerAdminDto;
        const configuredSecret = this.configService.get('ADMIN_SECRET_KEY');
        if (configuredSecret && adminSecretKey !== configuredSecret) {
            throw new common_1.UnauthorizedException('Invalid admin registration secret key');
        }
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email address already exists');
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        const user = await this.usersService.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            roles: [index_js_1.Role.ADMIN],
            isEmailVerified: true,
        });
        return {
            message: 'Admin account registered successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
            },
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
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'If the email exists, a password reset link has been generated' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.usersRepository.update(user.id, {
            $set: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });
        return {
            message: 'If the email exists, a password reset link has been generated',
            resetToken,
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const user = await this.usersRepository.findByResetToken(token);
        if (!user) {
            throw new common_1.BadRequestException('Password reset token is invalid or has expired');
        }
        const hashedPassword = await (0, index_js_1.hashPassword)(password);
        await this.usersRepository.update(user.id, {
            $set: { password: hashedPassword, refreshTokens: [] },
            $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
        });
        return { message: 'Password has been reset successfully. You can now login.' };
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
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map