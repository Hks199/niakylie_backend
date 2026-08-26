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

import { PaymentService } from './payment.service.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto.js';
import { VerifyStripeDto } from './dto/verify-stripe.dto.js';
import { ProcessRefundDto } from './dto/process-refund.dto.js';
import { RetryPaymentDto } from './dto/retry-payment.dto.js';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated checkout' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize payment intent for order (Razorpay, Stripe, COD, Partial Payment)' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Order already paid or invalid request' })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const userId = req.user?.id || req.user?._id;
    dto.guestId = dto.guestId || guestIdHeader;
    return this.paymentService.createPaymentIntent(userId, dto);
  }

  @Post('verify/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay HMAC payment signature' })
  @ApiResponse({ status: 200, description: 'Razorpay signature verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid Razorpay signature' })
  async verifyRazorpayPayment(@Body() dto: VerifyRazorpayDto) {
    return this.paymentService.verifyRazorpayPayment(dto);
  }

  @Post('verify/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Stripe PaymentIntent status' })
  @ApiResponse({ status: 200, description: 'Stripe payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Stripe payment failed or pending' })
  async verifyStripePayment(@Body() dto: VerifyStripeDto) {
    return this.paymentService.verifyStripePayment(dto);
  }

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook listener' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleRazorpayWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature?: string) {
    return this.paymentService.handleRazorpayWebhook(payload, signature);
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook listener' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleStripeWebhook(@Body() payload: any, @Headers('stripe-signature') signature?: string) {
    return this.paymentService.handleStripeWebhook(payload, signature);
  }

  @Post('refund')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process full or partial refund for transaction or order' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund amount or transaction status' })
  async processRefund(@Body() dto: ProcessRefundDto) {
    return this.paymentService.processRefund(dto);
  }

  @Post('retry')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry payment for failed or pending order' })
  @ApiResponse({ status: 200, description: 'New payment intent created for retry attempt' })
  async retryPayment(@Body() dto: RetryPaymentDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.paymentService.retryPayment(userId, dto);
  }

  @Get('transaction/:transactionId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment transaction details' })
  @ApiParam({ name: 'transactionId', example: 'TXN-20260807-1234' })
  @ApiResponse({ status: 200, description: 'Transaction details returned' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('transactionId') transactionId: string) {
    return this.paymentService.getTransaction(transactionId);
  }

  @Get('order/:orderId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payment transactions for an order' })
  @ApiParam({ name: 'orderId', example: 'NK-ORD-20260807-1234' })
  @ApiResponse({ status: 200, description: 'List of order transactions returned' })
  async getOrderTransactions(@Param('orderId') orderId: string) {
    return this.paymentService.getOrderTransactions(orderId);
  }
}
