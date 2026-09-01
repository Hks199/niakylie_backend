import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Req,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RequestReturnDto } from './dto/request-return.dto.js';
import { CancelOrderDto } from './dto/cancel-order.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('Orders')
@UseGuards(OptionalJwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Get('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] List all orders with pagination, status filter, and search' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  async findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get('admin/:orderId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get any order by ID or order number' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order details returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByIdAdmin(@Param('orderId') orderId: string) {
    return this.ordersService.findById(orderId);
  }

  @Patch('admin/:orderId/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update order status (enforces valid transition rules)' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto);
  }

  @Patch('admin/:orderId/tracking')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update shipment tracking number and courier partner' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Tracking information updated' })
  async updateTracking(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateTrackingDto,
  ) {
    return this.ordersService.updateTracking(orderId, dto);
  }

  @Patch('admin/:orderId/approve-return')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Approve a return request for an order' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Return approved' })
  async approveReturn(@Param('orderId') orderId: string) {
    return this.ordersService.approveReturn(orderId);
  }

  @Patch('admin/:orderId/refund')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Mark order as REFUNDED' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order marked as refunded' })
  async markRefunded(
    @Param('orderId') orderId: string,
    @Body() body: { notes?: string },
  ) {
    return this.ordersService.markRefunded(orderId, body?.notes);
  }

  // ─── CUSTOMER ─────────────────────────────────────────────────────────────

  @Get('my')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated order lookup' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders for the authenticated customer or guest session' })
  @ApiResponse({ status: 200, description: 'Customer order list returned' })
  async getMyOrders(
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const userId = req.user?.id || req.user?._id?.toString() || req.user?.sub;
    const guestId = guestIdHeader || req.query?.guestId;
    return this.ordersService.getMyOrders(userId, guestId);
  }

  @Get()
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated order lookup' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders for the authenticated customer or guest session' })
  @ApiResponse({ status: 200, description: 'Customer order list returned' })
  async getOrders(
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const userId = req.user?.id || req.user?._id?.toString() || req.user?.sub;
    const guestId = guestIdHeader || req.query?.guestId;
    return this.ordersService.getMyOrders(userId, guestId);
  }

  @Get('my/:orderId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a specific order for the authenticated customer' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order details returned' })
  @ApiResponse({ status: 403, description: 'Access denied to this order' })
  async getMyOrder(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.getMyOrder(orderId, userId);
  }

  @Get('my/:orderId/timeline')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get chronological status timeline for an order' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order timeline returned' })
  async getOrderTimeline(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.getOrderTimeline(orderId, userId);
  }

  @Get('my/:orderId/tracking')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get shipment tracking details for an order' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Tracking information returned' })
  async getOrderTracking(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.getOrderTracking(orderId, userId);
  }

  @Get('my/:orderId/invoice')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Download invoice for an order' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Invoice data and HTML template returned' })
  async getInvoice(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.getInvoice(orderId, userId);
  }

  @Post('my/:orderId/cancel')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order (only PENDING or CONFIRMED orders can be cancelled)' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled in its current status' })
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.cancelOrder(orderId, dto, userId);
  }

  @Post('my/return')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a return for a delivered order' })
  @ApiResponse({ status: 200, description: 'Return request submitted' })
  @ApiResponse({ status: 400, description: 'Order is not in DELIVERED status' })
  async requestReturn(@Body() dto: RequestReturnDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.ordersService.requestReturn(dto, userId);
  }
}
