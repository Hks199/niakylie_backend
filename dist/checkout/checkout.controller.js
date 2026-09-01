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
exports.CheckoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const checkout_service_js_1 = require("./checkout.service.js");
const checkout_summary_dto_js_1 = require("./dto/checkout-summary.dto.js");
const place_order_dto_js_1 = require("./dto/place-order.dto.js");
const optional_jwt_auth_guard_js_1 = require("../auth/guards/optional-jwt-auth.guard.js");
let CheckoutController = class CheckoutController {
    checkoutService;
    constructor(checkoutService) {
        this.checkoutService = checkoutService;
    }
    extractUserIdAndGuestId(req, guestIdHeader) {
        const userId = req.user?.id || req.user?._id?.toString() || req.user?.sub || req.user?.userId;
        const guestId = guestIdHeader || req.body?.guestId || req.query?.guestId;
        return { userId, guestId };
    }
    async getCheckoutSummary(dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.checkoutService.getCheckoutSummary(userId, dto);
    }
    async validateCheckout(dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.checkoutService.validateCheckout(userId, dto);
    }
    async placeOrder(dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.checkoutService.placeOrder(userId, dto);
    }
    async getOrder(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.checkoutService.getOrderById(orderId, userId);
    }
    async getInvoice(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.checkoutService.getInvoice(orderId, userId);
    }
};
exports.CheckoutController = CheckoutController;
__decorate([
    (0, common_1.Post)('summary'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate live checkout order summary, stock verification, and price calculation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Live checkout summary breakdown returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cart is empty or invalid checkout options' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkout_summary_dto_js_1.CheckoutSummaryDto, Object, String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getCheckoutSummary", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pre-flight checkout validation (inventory stock, coupon, address)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout validation passed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Insufficient stock or invalid checkout payload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_order_dto_js_1.PlaceOrderDto, Object, String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "validateCheckout", null);
__decorate([
    (0, common_1.Post)('place-order'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Place order from cart, reserve stock, clear cart, and generate invoice' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order placed successfully and invoice created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cart is empty, stock unavailable, or invalid payload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_order_dto_js_1.PlaceOrderDto, Object, String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "placeOrder", null);
__decorate([
    (0, common_1.Get)('orders/:orderId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details by orderId or orderNumber' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)('orders/:orderId/invoice'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice details and HTML template for printing/PDF generation' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Printable invoice data returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getInvoice", null);
exports.CheckoutController = CheckoutController = __decorate([
    (0, swagger_1.ApiTags)('Checkout'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_js_1.OptionalJwtAuthGuard),
    (0, common_1.Controller)('checkout'),
    __metadata("design:paramtypes", [checkout_service_js_1.CheckoutService])
], CheckoutController);
//# sourceMappingURL=checkout.controller.js.map