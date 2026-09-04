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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_js_1 = require("./payment.service.js");
const online_payment_discount_service_js_1 = require("./online-payment-discount.service.js");
const create_payment_intent_dto_js_1 = require("./dto/create-payment-intent.dto.js");
const create_razorpay_order_dto_js_1 = require("./dto/create-razorpay-order.dto.js");
const create_stripe_intent_dto_js_1 = require("./dto/create-stripe-intent.dto.js");
const verify_razorpay_dto_js_1 = require("./dto/verify-razorpay.dto.js");
const verify_stripe_dto_js_1 = require("./dto/verify-stripe.dto.js");
const process_refund_dto_js_1 = require("./dto/process-refund.dto.js");
const retry_payment_dto_js_1 = require("./dto/retry-payment.dto.js");
const update_online_discount_dto_js_1 = require("./dto/update-online-discount.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
let PaymentController = class PaymentController {
    paymentService;
    onlineDiscountService;
    constructor(paymentService, onlineDiscountService) {
        this.paymentService = paymentService;
        this.onlineDiscountService = onlineDiscountService;
    }
    async getOnlineDiscountConfig() {
        return this.onlineDiscountService.getConfig();
    }
    async getAdminOnlineDiscountConfig() {
        return this.onlineDiscountService.getConfig();
    }
    async updateOnlineDiscountConfig(dto) {
        return this.onlineDiscountService.updateConfig(dto);
    }
    async createRazorpayOrder(dto) {
        return this.paymentService.createRazorpayOrder(dto);
    }
    async createStripeIntent(dto) {
        return this.paymentService.createStripeIntent(dto);
    }
    async createPaymentIntent(dto, req, guestIdHeader) {
        const userId = req.user?.id || req.user?._id;
        dto.guestId = dto.guestId || guestIdHeader;
        return this.paymentService.createPaymentIntent(userId, dto);
    }
    async verifyRazorpayPayment(dto) {
        return this.paymentService.verifyRazorpayPayment(dto);
    }
    async verifyStripePayment(dto) {
        return this.paymentService.verifyStripePayment(dto);
    }
    async handleRazorpayWebhook(payload, signature) {
        return this.paymentService.handleRazorpayWebhook(payload, signature);
    }
    async handleStripeWebhook(payload, signature) {
        return this.paymentService.handleStripeWebhook(payload, signature);
    }
    async processRefund(dto) {
        return this.paymentService.processRefund(dto);
    }
    async retryPayment(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.paymentService.retryPayment(userId, dto);
    }
    async getTransaction(transactionId) {
        return this.paymentService.getTransaction(transactionId);
    }
    async getOrderTransactions(orderId) {
        return this.paymentService.getOrderTransactions(orderId);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Get)('online-discount'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active online payment discount configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Online discount config retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOnlineDiscountConfig", null);
__decorate([
    (0, common_1.Get)('online-discount/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get online payment discount configuration for Admin' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAdminOnlineDiscountConfig", null);
__decorate([
    (0, common_1.Put)('online-discount/admin'),
    (0, common_1.Post)('online-discount/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update online payment discount configuration (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_online_discount_dto_js_1.UpdateOnlineDiscountDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updateOnlineDiscountConfig", null);
__decorate([
    (0, common_1.Post)(['razorpay/create-order', 'create-order']),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Razorpay order for checkout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Razorpay order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_razorpay_order_dto_js_1.CreateRazorpayOrderDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createRazorpayOrder", null);
__decorate([
    (0, common_1.Post)('stripe/create-intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe PaymentIntent for checkout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stripe PaymentIntent created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stripe_intent_dto_js_1.CreateStripeIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createStripeIntent", null);
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize payment intent for order (Razorpay, Stripe, COD, Partial Payment)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order already paid or invalid request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_js_1.CreatePaymentIntentDto, Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)(['verify/razorpay', 'razorpay/verify', 'verify']),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay HMAC payment signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Razorpay signature verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid Razorpay signature' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_razorpay_dto_js_1.VerifyRazorpayDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyRazorpayPayment", null);
__decorate([
    (0, common_1.Post)('verify/stripe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Stripe PaymentIntent status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stripe payment verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Stripe payment failed or pending' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_stripe_dto_js_1.VerifyStripeDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyStripePayment", null);
__decorate([
    (0, common_1.Post)('webhook/razorpay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Razorpay webhook listener' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleRazorpayWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/stripe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe webhook listener' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process full or partial refund for transaction or order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid refund amount or transaction status' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_refund_dto_js_1.ProcessRefundDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Post)('retry'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry payment for failed or pending order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'New payment intent created for retry attempt' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [retry_payment_dto_js_1.RetryPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "retryPayment", null);
__decorate([
    (0, common_1.Get)('transaction/:transactionId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment transaction details' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', example: 'TXN-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payment transactions for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of order transactions returned' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOrderTransactions", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_js_1.PaymentService,
        online_payment_discount_service_js_1.OnlinePaymentDiscountService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map