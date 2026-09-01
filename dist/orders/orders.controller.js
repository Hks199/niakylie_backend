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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_js_1 = require("./orders.service.js");
const query_order_dto_js_1 = require("./dto/query-order.dto.js");
const update_order_status_dto_js_1 = require("./dto/update-order-status.dto.js");
const update_tracking_dto_js_1 = require("./dto/update-tracking.dto.js");
const request_return_dto_js_1 = require("./dto/request-return.dto.js");
const cancel_order_dto_js_1 = require("./dto/cancel-order.dto.js");
const optional_jwt_auth_guard_js_1 = require("../auth/guards/optional-jwt-auth.guard.js");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAll(query) {
        return this.ordersService.findAll(query);
    }
    async findByIdAdmin(orderId) {
        return this.ordersService.findById(orderId);
    }
    async updateStatus(orderId, dto) {
        return this.ordersService.updateStatus(orderId, dto);
    }
    async updateTracking(orderId, dto) {
        return this.ordersService.updateTracking(orderId, dto);
    }
    async approveReturn(orderId) {
        return this.ordersService.approveReturn(orderId);
    }
    async markRefunded(orderId, body) {
        return this.ordersService.markRefunded(orderId, body?.notes);
    }
    async getMyOrders(req, guestIdHeader) {
        const userId = req.user?.id || req.user?._id?.toString() || req.user?.sub;
        const guestId = guestIdHeader || req.query?.guestId;
        return this.ordersService.getMyOrders(userId, guestId);
    }
    async getOrders(req, guestIdHeader) {
        const userId = req.user?.id || req.user?._id?.toString() || req.user?.sub;
        const guestId = guestIdHeader || req.query?.guestId;
        return this.ordersService.getMyOrders(userId, guestId);
    }
    async getMyOrder(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.getMyOrder(orderId, userId);
    }
    async getOrderTimeline(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.getOrderTimeline(orderId, userId);
    }
    async getOrderTracking(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.getOrderTracking(orderId, userId);
    }
    async getInvoice(orderId, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.getInvoice(orderId, userId);
    }
    async cancelOrder(orderId, dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.cancelOrder(orderId, dto, userId);
    }
    async requestReturn(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.ordersService.requestReturn(dto, userId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] List all orders with pagination, status filter, and search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_order_dto_js_1.QueryOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/:orderId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get any order by ID or order number' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findByIdAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/:orderId/status'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update order status (enforces valid transition rules)' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_js_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('admin/:orderId/tracking'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update shipment tracking number and courier partner' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tracking information updated' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tracking_dto_js_1.UpdateTrackingDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateTracking", null);
__decorate([
    (0, common_1.Patch)('admin/:orderId/approve-return'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Approve a return request for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return approved' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "approveReturn", null);
__decorate([
    (0, common_1.Patch)('admin/:orderId/refund'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Mark order as REFUNDED' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order marked as refunded' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "markRefunded", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated order lookup' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for the authenticated customer or guest session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer order list returned' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated order lookup' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for the authenticated customer or guest session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer order list returned' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('my/:orderId'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific order for the authenticated customer' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details returned' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied to this order' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrder", null);
__decorate([
    (0, common_1.Get)('my/:orderId/timeline'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chronological status timeline for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order timeline returned' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderTimeline", null);
__decorate([
    (0, common_1.Get)('my/:orderId/tracking'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment tracking details for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tracking information returned' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderTracking", null);
__decorate([
    (0, common_1.Get)('my/:orderId/invoice'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Download invoice for an order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice data and HTML template returned' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('my/:orderId/cancel'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an order (only PENDING or CONFIRMED orders can be cancelled)' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', example: 'NK-ORD-20260807-1234' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order cannot be cancelled in its current status' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_order_dto_js_1.CancelOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)('my/return'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request a return for a delivered order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return request submitted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order is not in DELIVERED status' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_return_dto_js_1.RequestReturnDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "requestReturn", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_js_1.OptionalJwtAuthGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_js_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map