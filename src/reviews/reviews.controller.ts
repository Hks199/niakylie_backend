import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import { ModerateReviewDto } from './dto/moderate-review.dto.js';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a product review with rating, text, images, and videos' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  @ApiResponse({ status: 400, description: 'User already submitted a review or invalid payload' })
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews and rating breakdown for a product' })
  @ApiParam({ name: 'productId', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Reviews and rating summary returned' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all reviews submitted by the current authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user reviews returned' })
  async getMyReviews(@Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.reviewsService.getMyReviews(userId);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update your own review' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a002' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot update another user review' })
  async updateReview(
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?._id;
    return this.reviewsService.updateReview(reviewId, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete your own review or admin deletion' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a002' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(@Param('id') reviewId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    const isAdmin = req.user?.role === 'ADMIN';
    return this.reviewsService.deleteReview(reviewId, userId, isAdmin);
  }

  @Post(':id/vote-helpful')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle helpful upvote on a review' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a002' })
  @ApiResponse({ status: 200, description: 'Helpful vote toggled' })
  async toggleHelpfulVote(@Param('id') reviewId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?._id;
    return this.reviewsService.toggleHelpfulVote(reviewId, userId);
  }

  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get all reviews with status filtering and pagination' })
  @ApiResponse({ status: 200, description: 'All reviews returned' })
  async getAllReviewsAdminAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.getAllReviews(query);
  }

  @Get('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get all reviews with status filtering and pagination' })
  @ApiResponse({ status: 200, description: 'All reviews returned' })
  async getAllReviewsAdmin(@Query() query: QueryReviewDto) {
    return this.reviewsService.getAllReviews(query);
  }

  @Patch('admin/:id/moderate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Approve or reject review and add official response' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a002' })
  @ApiResponse({ status: 200, description: 'Review moderation completed' })
  async moderateReview(
    @Param('id') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewsService.moderateReview(reviewId, dto);
  }
}
