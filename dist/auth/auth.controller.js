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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_js_1 = require("./auth.service.js");
const register_dto_js_1 = require("./dto/register.dto.js");
const register_admin_dto_js_1 = require("./dto/register-admin.dto.js");
const login_dto_js_1 = require("./dto/login.dto.js");
const verify_email_dto_js_1 = require("./dto/verify-email.dto.js");
const forgot_password_dto_js_1 = require("./dto/forgot-password.dto.js");
const reset_password_dto_js_1 = require("./dto/reset-password.dto.js");
const jwt_auth_guard_js_1 = require("./guards/jwt-auth.guard.js");
const jwt_refresh_guard_js_1 = require("./guards/jwt-refresh.guard.js");
const google_oauth_guard_js_1 = require("./guards/google-oauth.guard.js");
const index_js_1 = require("../shared/index.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async verifyEmail(verifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto.token);
    }
    async sendOtp(email) {
        return this.authService.sendOtp(email);
    }
    async verifyOtp(body) {
        return this.authService.verifyOtp(body.email, body.otp);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async registerAdmin(registerAdminDto) {
        return this.authService.registerAdmin(registerAdminDto);
    }
    async loginAdmin(loginDto) {
        return this.authService.loginAdmin(loginDto);
    }
    async logoutAdmin(req, user) {
        const authHeader = req.get('Authorization');
        const refreshToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
        return this.authService.logout(user.id, refreshToken);
    }
    async refresh(req) {
        const user = req.user;
        return this.authService.refreshTokens(user.userId, user.refreshToken);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async logout(req, user) {
        const authHeader = req.get('Authorization');
        const refreshToken = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
        return this.authService.logout(user.id, refreshToken);
    }
    async logoutAll(user) {
        return this.authService.logoutAllDevices(user.id);
    }
    async googleAuth() {
    }
    async googleAuthRedirect(req) {
        const googleUser = req.user;
        return this.authService.googleLogin(googleUser);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new customer account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input payload' }),
    (0, swagger_1.ApiResponse)({ status: 499, description: 'Email address already in use' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_js_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify account using email verification token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email successfully verified' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token is invalid or expired' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_js_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send or resend a 5-minute 6-digit OTP code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent to email address' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify 6-digit OTP code, activate account, and issue tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired OTP code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successful login returning tokens' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or inactive account' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_js_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('admin/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new administrator account (Role.ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input payload' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid admin registration secret key' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email address already in use' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_admin_dto_js_1.RegisterAdminDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerAdmin", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Admin portal authentication (Enforces Role.ADMIN privileges)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successful admin login returning JWT tokens and admin user profile' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or account non-admin privileges' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_js_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginAdmin", null);
__decorate([
    (0, common_1.Post)('admin/logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout current admin session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin session terminated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized request' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAdmin", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_refresh_guard_js_1.JwtRefreshGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh user access token (token rotation)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access token successfully rotated' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or revoked refresh token' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password recovery email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'If account exists, email trigger response returned' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_js_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset user password using token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password successfully reset' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_js_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout current session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized request' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout all device sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All session tokens cleared' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized request' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_oauth_guard_js_1.GoogleOauthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Redirect to Google Identity login flow' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_oauth_guard_js_1.GoogleOauthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Google Identity redirect landing callback' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Google login successful, returning token payload' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_js_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map