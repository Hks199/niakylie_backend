import {
  Controller,
  Get,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get key performance metrics (Total Revenue, Orders, AOV, Customers, Products, Stock Alerts)' })
  @ApiResponse({ status: 200, description: 'Dashboard KPI summary returned' })
  async getSummary(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getSummary(query);
  }

  @Get('revenue')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get revenue & sales analytics grouped by daily, weekly, monthly, or yearly period' })
  @ApiResponse({ status: 200, description: 'Revenue analytics timeline returned' })
  async getRevenueAnalytics(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRevenueAnalytics(query);
  }

  @Get('orders-breakdown')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get distribution of orders by status (Pending, Confirmed, Shipped, Delivered, Cancelled, etc.)' })
  @ApiResponse({ status: 200, description: 'Order status breakdown returned' })
  async getOrderStatusBreakdown(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOrderStatusBreakdown(query);
  }

  @Get('top-products')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get top selling products ranked by revenue and quantity sold' })
  @ApiResponse({ status: 200, description: 'Top products returned' })
  async getTopProducts(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTopProducts(query);
  }

  @Get('top-categories')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get top revenue generating product categories' })
  @ApiResponse({ status: 200, description: 'Top categories returned' })
  async getTopCategories(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTopCategories(query);
  }

  @Get('top-customers')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get top customers ranked by total spending and order count' })
  @ApiResponse({ status: 200, description: 'Top customers returned' })
  async getTopCustomers(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTopCustomers(query);
  }

  @Get('inventory-alerts')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get inventory health report (Out-of-stock and low-stock items)' })
  @ApiResponse({ status: 200, description: 'Inventory health report returned' })
  async getInventoryAlerts() {
    return this.dashboardService.getInventoryAlerts();
  }

  @Delete('cache')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Clear Redis cache for dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics cache cleared' })
  async clearCache() {
    return this.dashboardService.clearCache();
  }
}
