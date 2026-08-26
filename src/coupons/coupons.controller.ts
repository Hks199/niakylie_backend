import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { ValidateCouponDto } from './dto/validate-coupon.dto.js';
import { QueryCouponDto } from './dto/query-coupon.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new coupon promo code (Admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input parameters or date range' })
  @ApiResponse({ status: 409, description: 'Coupon code already exists' })
  async create(@Body() createDto: CreateCouponDto) {
    return this.couponsService.createCoupon(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all coupons with pagination, search, and status filter (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of coupons returned' })
  async findAll(@Query() queryDto: QueryCouponDto) {
    return this.couponsService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active and unexpired coupons for customers' })
  @ApiResponse({ status: 200, description: 'List of active coupons returned' })
  async findActive() {
    return this.couponsService.findActiveCoupons();
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate coupon code and calculate discount' })
  @ApiResponse({ status: 200, description: 'Coupon validation and calculated discount details' })
  @ApiResponse({ status: 400, description: 'Coupon expired, usage limit reached, or requirements not met' })
  @ApiResponse({ status: 404, description: 'Coupon code not found or inactive' })
  async validate(@Body() validateDto: ValidateCouponDto) {
    return this.couponsService.validateCoupon(validateDto);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon details by coupon code' })
  @ApiParam({ name: 'code', example: 'WELCOME10' })
  @ApiResponse({ status: 200, description: 'Coupon details returned' })
  @ApiResponse({ status: 404, description: 'Coupon code not found' })
  async findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon details by ID' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Coupon details returned' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async findOne(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update coupon details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    return this.couponsService.updateCoupon(id, updateDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle coupon active/inactive status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon status toggled' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async toggleStatus(@Param('id') id: string) {
    return this.couponsService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete coupon (Admin only)' })
  @ApiResponse({ status: 204, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  async remove(@Param('id') id: string) {
    await this.couponsService.deleteCoupon(id);
  }
}
