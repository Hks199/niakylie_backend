import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { MergeCartDto } from './dto/merge-cart.dto.js';
import { ApplyCouponDto } from './dto/apply-coupon.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractUserIdAndGuestId(req: any, guestIdHeader?: string): { userId?: string; guestId?: string } {
    const userId = req.user?.id || req.user?._id;
    const guestId = guestIdHeader || req.body?.guestId || req.query?.guestId;
    return { userId, guestId };
  }

  @Get()
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get active shopping cart for customer or guest' })
  @ApiResponse({ status: 200, description: 'Active shopping cart returned' })
  async getCart(@Req() req: any, @Headers('x-guest-id') guestIdHeader?: string) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    return this.cartService.getCart(userId, guestId);
  }

  @Post('items')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add item to shopping cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  async addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.cartService.addToCart(dto, userId);
  }

  @Put('items/:sku')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update cart item quantity (set 0 to remove item)' })
  @ApiResponse({ status: 200, description: 'Cart item quantity updated' })
  async updateItemQuantity(
    @Param('sku') sku: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.cartService.updateItemQuantity(sku, dto, userId);
  }

  @Delete('items/:sku')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from shopping cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeItem(
    @Param('sku') sku: string,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    return this.cartService.removeItem(sku, userId, guestId);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge guest cart into logged-in user cart after login' })
  @ApiResponse({ status: 200, description: 'Guest cart merged into user account' })
  async mergeGuestCart(@Body() dto: MergeCartDto, @Req() req: any) {
    const userId = req.user.id || req.user._id;
    return this.cartService.mergeGuestCart(dto, userId);
  }

  @Patch('items/:sku/save-for-later')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle Save For Later status on a cart item' })
  @ApiResponse({ status: 200, description: 'Item Save For Later status toggled' })
  async toggleSaveForLater(
    @Param('sku') sku: string,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    return this.cartService.toggleSaveForLater(sku, userId, guestId);
  }

  @Post('items/:sku/move-to-wishlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move cart item to customer wishlist' })
  @ApiResponse({ status: 200, description: 'Item moved from cart to user wishlist' })
  async moveToWishlist(@Param('sku') sku: string, @Req() req: any) {
    const userId = req.user.id || req.user._id;
    return this.cartService.moveToWishlist(sku, userId);
  }

  @Post('apply-coupon')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply promotional coupon code to shopping cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied to cart' })
  async applyCoupon(
    @Body() dto: ApplyCouponDto,
    @Req() req: any,
    @Headers('x-guest-id') guestIdHeader?: string,
  ) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    dto.guestId = dto.guestId || guestId;
    return this.cartService.applyCoupon(dto, userId);
  }

  @Delete('remove-coupon')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove applied coupon code from shopping cart' })
  @ApiResponse({ status: 200, description: 'Coupon removed from cart' })
  async removeCoupon(@Req() req: any, @Headers('x-guest-id') guestIdHeader?: string) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    return this.cartService.removeCoupon(userId, guestId);
  }

  @Delete('clear')
  @ApiHeader({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from shopping cart' })
  @ApiResponse({ status: 200, description: 'Shopping cart cleared' })
  async clearCart(@Req() req: any, @Headers('x-guest-id') guestIdHeader?: string) {
    const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
    return this.cartService.clearCart(userId, guestId);
  }
}
