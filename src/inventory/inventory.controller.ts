import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { ReserveStockDto } from './dto/reserve-stock.dto.js';
import { QueryInventoryDto } from './dto/query-inventory.dto.js';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all inventory items with search & status filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of inventory items' })
  async findAll(@Query() queryDto: QueryInventoryDto) {
    return this.inventoryService.findAll(queryDto);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get low stock / out of stock alert items (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of low/out of stock items' })
  async getLowStockAlerts(@Query() queryDto: QueryInventoryDto) {
    return this.inventoryService.getLowStockAlerts(queryDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get inventory audit log history (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated audit trail history' })
  async getHistory(@Query() queryDto: QueryInventoryHistoryDto) {
    return this.inventoryService.getHistory(queryDto);
  }

  @Get(':sku')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get inventory details for a specific SKU' })
  @ApiResponse({ status: 200, description: 'Inventory item details' })
  @ApiResponse({ status: 404, description: 'SKU not found' })
  async findBySku(@Param('sku') sku: string) {
    return this.inventoryService.findBySku(sku);
  }

  @Post('adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust total stock manually / restock (Admin only)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  async adjustStock(@Body() dto: AdjustStockDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.inventoryService.adjustStock(dto, userId);
  }

  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reserve stock for cart / checkout' })
  @ApiResponse({ status: 200, description: 'Stock reserved successfully' })
  async reserveStock(@Body() dto: ReserveStockDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.inventoryService.reserveStock(dto, userId);
  }

  @Post('release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release reserved stock' })
  @ApiResponse({ status: 200, description: 'Stock released successfully' })
  async releaseReservation(@Body() dto: ReserveStockDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.inventoryService.releaseReservation(dto, userId);
  }

  @Post('deduct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deduct stock for confirmed sale' })
  @ApiResponse({ status: 200, description: 'Stock deducted for confirmed sale' })
  async deductReservedStock(@Body() dto: ReserveStockDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.inventoryService.deductReservedStock(dto, userId);
  }
}
