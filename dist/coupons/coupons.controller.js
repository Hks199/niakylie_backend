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
exports.CouponsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coupons_service_js_1 = require("./coupons.service.js");
const create_coupon_dto_js_1 = require("./dto/create-coupon.dto.js");
const update_coupon_dto_js_1 = require("./dto/update-coupon.dto.js");
const validate_coupon_dto_js_1 = require("./dto/validate-coupon.dto.js");
const query_coupon_dto_js_1 = require("./dto/query-coupon.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
let CouponsController = class CouponsController {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async create(createDto) {
        return this.couponsService.createCoupon(createDto);
    }
    async findAll(queryDto) {
        return this.couponsService.findAll(queryDto);
    }
    async findActive() {
        return this.couponsService.findActiveCoupons();
    }
    async validate(validateDto) {
        return this.couponsService.validateCoupon(validateDto);
    }
    async findByCode(code) {
        return this.couponsService.findByCode(code);
    }
    async findOne(id) {
        return this.couponsService.findById(id);
    }
    async update(id, updateDto) {
        return this.couponsService.updateCoupon(id, updateDto);
    }
    async toggleStatus(id) {
        return this.couponsService.toggleStatus(id);
    }
    async remove(id) {
        await this.couponsService.deleteCoupon(id);
    }
};
exports.CouponsController = CouponsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coupon promo code (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Coupon created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input parameters or date range' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Coupon code already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_js_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all coupons with pagination, search, and status filter (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of coupons returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_coupon_dto_js_1.QueryCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get currently active and unexpired coupons for customers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of active coupons returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate coupon code and calculate discount' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon validation and calculated discount details' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Coupon expired, usage limit reached, or requirements not met' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon code not found or inactive' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_coupon_dto_js_1.ValidateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coupon details by coupon code' }),
    (0, swagger_1.ApiParam)({ name: 'code', example: 'WELCOME10' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon code not found' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coupon details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update coupon details (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_coupon_dto_js_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle coupon active/inactive status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon status toggled' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete coupon (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Coupon deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coupon not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "remove", null);
exports.CouponsController = CouponsController = __decorate([
    (0, swagger_1.ApiTags)('Coupons'),
    (0, common_1.Controller)('coupons'),
    __metadata("design:paramtypes", [coupons_service_js_1.CouponsService])
], CouponsController);
//# sourceMappingURL=coupons.controller.js.map