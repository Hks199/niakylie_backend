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
exports.ShippingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
const update_shipping_config_dto_js_1 = require("./dto/update-shipping-config.dto.js");
const shipping_service_js_1 = require("./shipping.service.js");
let ShippingController = class ShippingController {
    shippingService;
    constructor(shippingService) {
        this.shippingService = shippingService;
    }
    getConfig() {
        return this.shippingService.getConfig();
    }
    getAdminConfig() {
        return this.shippingService.getConfig();
    }
    updateConfig(dto) {
        return this.shippingService.updateConfig(dto);
    }
};
exports.ShippingController = ShippingController;
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer delivery-fee configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('config/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery-fee configuration for admin' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "getAdminConfig", null);
__decorate([
    (0, common_1.Put)('config/admin'),
    (0, common_1.Post)('config/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery-fee configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_shipping_config_dto_js_1.UpdateShippingConfigDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "updateConfig", null);
exports.ShippingController = ShippingController = __decorate([
    (0, swagger_1.ApiTags)('Shipping'),
    (0, common_1.Controller)('shipping'),
    __metadata("design:paramtypes", [shipping_service_js_1.ShippingService])
], ShippingController);
//# sourceMappingURL=shipping.controller.js.map