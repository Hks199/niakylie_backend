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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let StripeService = class StripeService {
    configService;
    secretKey;
    webhookSecret;
    constructor(configService) {
        this.configService = configService;
        this.secretKey = this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_mockstripekey123';
        this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || 'whsec_mocksecret123';
    }
    async createPaymentIntent(params) {
        const amountInCents = Math.round(params.amount * 100);
        const mockIntentId = `pi_str_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            id: mockIntentId,
            client_secret: `${mockIntentId}_secret_${Math.random().toString(36).substring(7)}`,
            amount: amountInCents,
            currency: params.currency || 'inr',
            status: 'requires_payment_method',
        };
    }
    async verifyPaymentIntent(paymentIntentId) {
        return {
            id: paymentIntentId,
            amount: 1000,
            status: 'succeeded',
        };
    }
    async processRefund(params) {
        const mockRefundId = `re_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const amountInCents = params.amount ? Math.round(params.amount * 100) : 0;
        return {
            id: mockRefundId,
            payment_intent: params.paymentIntentId,
            amount: amountInCents,
            status: 'succeeded',
        };
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map