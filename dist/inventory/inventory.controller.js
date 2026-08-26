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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_js_1 = require("./inventory.service.js");
const adjust_stock_dto_js_1 = require("./dto/adjust-stock.dto.js");
const reserve_stock_dto_js_1 = require("./dto/reserve-stock.dto.js");
const query_inventory_dto_js_1 = require("./dto/query-inventory.dto.js");
const query_inventory_history_dto_js_1 = require("./dto/query-inventory-history.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async findAll(queryDto) {
        return this.inventoryService.findAll(queryDto);
    }
    async getLowStockAlerts(queryDto) {
        return this.inventoryService.getLowStockAlerts(queryDto);
    }
    async getHistory(queryDto) {
        return this.inventoryService.getHistory(queryDto);
    }
    async findBySku(sku) {
        return this.inventoryService.findBySku(sku);
    }
    async adjustStock(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.inventoryService.adjustStock(dto, userId);
    }
    async reserveStock(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.inventoryService.reserveStock(dto, userId);
    }
    async releaseReservation(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.inventoryService.releaseReservation(dto, userId);
    }
    async deductReservedStock(dto, req) {
        const userId = req.user?.id || req.user?._id;
        return this.inventoryService.deductReservedStock(dto, userId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List all inventory items with search & status filters (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of inventory items' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_inventory_dto_js_1.QueryInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get low stock / out of stock alert items (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of low/out of stock items' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_inventory_dto_js_1.QueryInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getLowStockAlerts", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory audit log history (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated audit trail history' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_inventory_history_dto_js_1.QueryInventoryHistoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':sku'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory details for a specific SKU' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SKU not found' }),
    __param(0, (0, common_1.Param)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findBySku", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust total stock manually / restock (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock adjusted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjust_stock_dto_js_1.AdjustStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('reserve'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reserve stock for cart / checkout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock reserved successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reserve_stock_dto_js_1.ReserveStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "reserveStock", null);
__decorate([
    (0, common_1.Post)('release'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Release reserved stock' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock released successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reserve_stock_dto_js_1.ReserveStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "releaseReservation", null);
__decorate([
    (0, common_1.Post)('deduct'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deduct stock for confirmed sale' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stock deducted for confirmed sale' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reserve_stock_dto_js_1.ReserveStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deductReservedStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_js_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map