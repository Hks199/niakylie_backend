import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { QueryReviewDto } from './dto/query-review.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get approved reviews for a product (alias route)' })
  @ApiResponse({ status: 200, description: 'Reviews returned' })
  async getProductReviews(@Param('id') id: string, @Query() query: QueryReviewDto) {
    return this.reviewsService.getProductReviews(id, query);
  }
}
