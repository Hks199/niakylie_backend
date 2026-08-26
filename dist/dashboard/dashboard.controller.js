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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_js_1 = require("./dashboard.service.js");
const dashboard_query_dto_js_1 = require("./dto/dashboard-query.dto.js");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary(query) {
        return this.dashboardService.getSummary(query);
    }
    async getRevenueAnalytics(query) {
        return this.dashboardService.getRevenueAnalytics(query);
    }
    async getOrderStatusBreakdown(query) {
        return this.dashboardService.getOrderStatusBreakdown(query);
    }
    async getTopProducts(query) {
        return this.dashboardService.getTopProducts(query);
    }
    async getTopCategories(query) {
        return this.dashboardService.getTopCategories(query);
    }
    async getTopCustomers(query) {
        return this.dashboardService.getTopCustomers(query);
    }
    async getInventoryAlerts() {
        return this.dashboardService.getInventoryAlerts();
    }
    async clearCache() {
        return this.dashboardService.clearCache();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get key performance metrics (Total Revenue, Orders, AOV, Customers, Products, Stock Alerts)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard KPI summary returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get revenue & sales analytics grouped by daily, weekly, monthly, or yearly period' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue analytics timeline returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)('orders-breakdown'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get distribution of orders by status (Pending, Confirmed, Shipped, Delivered, Cancelled, etc.)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status breakdown returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOrderStatusBreakdown", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get top selling products ranked by revenue and quantity sold' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top products returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('top-categories'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get top revenue generating product categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top categories returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopCategories", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get top customers ranked by total spending and order count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top customers returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_js_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('inventory-alerts'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get inventory health report (Out-of-stock and low-stock items)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory health report returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getInventoryAlerts", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Clear Redis cache for dashboard metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard metrics cache cleared' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "clearCache", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Admin Dashboard'),
    (0, common_1.Controller)('admin/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_js_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map