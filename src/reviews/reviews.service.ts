import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ReviewsRepository } from './repositories/reviews.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import { ModerateReviewDto } from './dto/moderate-review.dto.js';
import { ReviewDocument, ReviewStatus } from './schemas/review.schema.js';
import { OrderStatus } from '../checkout/schemas/order.schema.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly ordersRepo: OrdersRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  private async updateProductRatingSummary(productId: string): Promise<void> {
    const stats = await this.reviewsRepo.getRatingStatsForProduct(productId);
    await this.productsRepo.update(productId, {
      ratings: {
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
        ratingBreakdown: stats.ratingBreakdown,
      },
    } as any);
  }

  async checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const userOrders = await this.ordersRepo.findByUserId(userId);
    const deliveredOrders = userOrders.filter((order) => order.orderStatus === OrderStatus.DELIVERED);

    for (const order of deliveredOrders) {
      const hasProduct = order.items.some((item) => item.productId.toString() === productId);
      if (hasProduct) return true;
    }
    return false;
  }

  async createReview(userId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
    const product = await this.productsRepo.findById(dto.productId);
    if (!product) {
      throw new NotFoundException(`Product '${dto.productId}' not found`);
    }

    const existing = await this.reviewsRepo.findByProductAndUser(dto.productId, userId);
    if (existing) {
      throw new BadRequestException('You have already submitted a review for this product');
    }

    const user = await this.usersRepo.findById(userId);
    const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Verified Customer';

    const isVerifiedPurchase = await this.checkVerifiedPurchase(userId, dto.productId);

    const review = await this.reviewsRepo.create({
      productId: new Types.ObjectId(dto.productId),
      userId: new Types.ObjectId(userId),
      userName,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      images: dto.images || [],
      videos: dto.videos || [],
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED,
    });

    await this.updateProductRatingSummary(dto.productId);
    return review;
  }

  async getProductReviews(productId: string, query: QueryReviewDto) {
    let product: any = null;
    if (Types.ObjectId.isValid(productId)) {
      product = await this.productsRepo.findById(productId);
    }
    if (!product) {
      product = await this.productsRepo.findBySlug(productId);
    }

    if (!product && !Types.ObjectId.isValid(productId)) {
      return {
        summary: {
          averageRating: 0,
          reviewCount: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        reviews: [],
        total: 0,
        page: query?.page || 1,
        limit: query?.limit || 10,
      };
    }

    const targetId = product ? product._id.toString() : productId;

    const [reviewsResult, stats] = await Promise.all([
      this.reviewsRepo.findProductReviews(targetId, query),
      this.reviewsRepo.getRatingStatsForProduct(targetId),
    ]);

    return {
      summary: stats,
      reviews: reviewsResult.data,
      total: reviewsResult.total,
      page: reviewsResult.page,
      limit: reviewsResult.limit,
    };
  }

  async getMyReviews(userId: string): Promise<ReviewDocument[]> {
    return this.reviewsRepo.findByUserId(userId);
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<ReviewDocument> {
    const review = await this.reviewsRepo.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review '${reviewId}' not found`);
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this review');
    }

    const updated = await this.reviewsRepo.update(reviewId, {
      ...(dto.rating ? { rating: dto.rating } : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.comment ? { comment: dto.comment } : {}),
      ...(dto.images ? { images: dto.images } : {}),
      ...(dto.videos ? { videos: dto.videos } : {}),
    });

    if (dto.rating) {
      await this.updateProductRatingSummary(review.productId.toString());
    }

    return updated!;
  }

  async deleteReview(reviewId: string, userId: string, isAdmin = false): Promise<{ message: string }> {
    const review = await this.reviewsRepo.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review '${reviewId}' not found`);
    }

    if (!isAdmin && review.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    await this.reviewsRepo.softDelete(reviewId);
    await this.updateProductRatingSummary(review.productId.toString());

    return { message: 'Review deleted successfully' };
  }

  async toggleHelpfulVote(reviewId: string, userId: string): Promise<ReviewDocument> {
    const updated = await this.reviewsRepo.toggleHelpfulVote(reviewId, userId);
    if (!updated) {
      throw new NotFoundException(`Review '${reviewId}' not found`);
    }
    return updated;
  }

  async moderateReview(reviewId: string, dto: ModerateReviewDto): Promise<ReviewDocument> {
    const review = await this.reviewsRepo.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review '${reviewId}' not found`);
    }

    const updated = await this.reviewsRepo.update(reviewId, {
      status: dto.status,
      ...(dto.adminResponse !== undefined ? { adminResponse: dto.adminResponse } : {}),
    });

    await this.updateProductRatingSummary(review.productId.toString());
    return updated!;
  }
}
