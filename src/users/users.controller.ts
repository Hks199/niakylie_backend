import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { AddressDto } from './dto/address.dto.js';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../shared/index.js';
import { User } from './schemas/user.schema.js';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile details returned successfully' })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: User, @Body() updateDto: UpdateProfileDto) {
    return this.usersService.updateProfile((user as any).id, updateDto);
  }

  @Patch('profile/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded and updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or file size exceeded' })
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: 'File is too large (max 5MB)' }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Generate public accessible relative file path
    const filePath = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar((user as any).id, filePath);
  }

  @Get('profile/addresses')
  @ApiOperation({ summary: 'Get address book' })
  @ApiResponse({ status: 200, description: 'Address book list returned' })
  async getAddresses(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById((user as any).id);
    return fullUser.addresses;
  }

  @Post('profile/addresses')
  @ApiOperation({ summary: 'Add address to address book' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  async addAddress(@CurrentUser() user: User, @Body() addressDto: AddressDto) {
    return this.usersService.addAddress((user as any).id, addressDto);
  }

  @Put('profile/addresses/:addressId')
  @ApiOperation({ summary: 'Update address details' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddress(
    @CurrentUser() user: User,
    @Param('addressId') addressId: string,
    @Body() addressDto: AddressDto,
  ) {
    return this.usersService.updateAddress((user as any).id, addressId, addressDto);
  }

  @Delete('profile/addresses/:addressId')
  @ApiOperation({ summary: 'Delete address from address book' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(@CurrentUser() user: User, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress((user as any).id, addressId);
  }

  @Get('profile/wishlist')
  @Get('wishlist')
  @ApiOperation({ summary: 'Get current user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist items returned successfully' })
  async getWishlist(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById((user as any).id);
    return fullUser.wishlist || [];
  }

  @Post('wishlist/toggle')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  async toggleWishlist(
    @CurrentUser() user: User,
    @Body() dto: { productId: string; variantId?: string },
  ) {
    const userId = (user as any).id;
    const fullUser = await this.usersService.findById(userId);
    const wishlistStr = (fullUser.wishlist || []).map((id) => id.toString());
    const isWishlisted = wishlistStr.includes(dto.productId);

    if (isWishlisted) {
      await this.usersService.removeFromWishlist(userId, dto.productId);
      return { isWishlisted: false, message: 'Removed from wishlist' };
    } else {
      await this.usersService.addToWishlist(userId, dto.productId);
      return { isWishlisted: true, message: 'Added to wishlist' };
    }
  }

  @Post('profile/wishlist/:productId')
  @Post('wishlist/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  async addToWishlist(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.usersService.addToWishlist((user as any).id, productId);
  }

  @Delete('profile/wishlist/:productId')
  @Delete('wishlist/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  async removeFromWishlist(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.usersService.removeFromWishlist((user as any).id, productId);
  }

  @Get('profile/recently-viewed')
  @ApiOperation({ summary: 'Get recently viewed products list' })
  @ApiResponse({ status: 200, description: 'Recently viewed items list returned' })
  async getRecentlyViewed(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById((user as any).id);
    return fullUser.recentlyViewed;
  }

  @Post('profile/recently-viewed/:productId')
  @ApiOperation({ summary: 'Log product viewed interaction' })
  @ApiResponse({ status: 201, description: 'Viewed history item saved' })
  async addRecentlyViewed(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.usersService.addRecentlyViewed((user as any).id, productId);
  }

  @Patch('profile/notifications')
  @ApiOperation({ summary: 'Update notification preference triggers' })
  @ApiResponse({ status: 200, description: 'Notification preference flags updated' })
  async updateNotificationPreferences(
    @CurrentUser() user: User,
    @Body() preferenceDto: UpdateNotificationPreferenceDto,
  ) {
    return this.usersService.updateNotificationPreferences((user as any).id, preferenceDto);
  }

  @Get('profile/wallet')
  @ApiOperation({ summary: 'Get current wallet balance and history' })
  @ApiResponse({ status: 200, description: 'Wallet ledger details returned' })
  async getWallet(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById((user as any).id);
    return fullUser.wallet;
  }
}
