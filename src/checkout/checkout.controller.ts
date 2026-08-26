import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';

import { CheckoutService } from './checkout.service.js';
import { CheckoutSummaryDto } from './dto/checkout-summary.dto.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  private extractUserIdAndGuestId(req: any, guestIdHeader?: string): { userId?: string; guestId?: string } {
    const userId = req.user?.id || req.user?._id;
    const guestId = guestIdHeader || req.body?.guestId || req.query?.guestId;
    return { userId, guestId };
  }

  @Post('summary')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate live checkout order summary, stock verification, and price calculation' })
  @ApiResponse({ status: 200, description: 'Live checkout summary breakdown returned' })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid checkout options' })
  async getCheckoutSummary(
    @Body() dto: CheckoutSummaryDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.checkoutService.getCheckoutSummary(userId, dto);
  }

  @Post('validate')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pre-flight checkout validation (inventory stock, coupon, address)' })
  @ApiResponse({ status: 200, description: 'Checkout validation passed' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid checkout payload' })
  async validateCheckout(
    @Body() dto: PlaceOrderDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.checkoutService.validateCheckout(userId, dto);
  }

  @Post('place-order')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Place order from cart, reserve stock, clear cart, and generate invoice' })
  @ApiResponse({ status: 201, description: 'Order placed successfully and invoice created' })
  @ApiResponse({ status: 400, description: 'Cart is empty, stock unavailable, or invalid payload' })
  async placeOrder(
    @Body() dto: PlaceOrderDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.checkoutService.placeOrder(userId, dto);
  }

  @Get('orders/:orderId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order details by orderId or orderNumber' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Order details returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.checkoutService.getOrderById(orderId, userId);
  }

  @Get('orders/:orderId/invoice')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get invoice details and HTML template for printing/PDF generation' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Printable invoice data returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getInvoice(@Param('orderId') orderId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.checkoutService.getInvoice(orderId, userId);
  }
}
