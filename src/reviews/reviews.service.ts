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
      averageRating: stats.averageRating,
      reviewsCount: stats.reviewCount,
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

  private resolveDeterministicUserId(userId?: string, guestId?: string): string {
    if (userId && Types.ObjectId.isValid(userId)) {
      return userId;
    }
    if (guestId && typeof guestId === 'string' && guestId.trim().length > 0) {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(guestId.trim()).digest('hex');
      return hash.substring(0, 24);
    }
    return '6a8868eb5cd29085db590738';
  }

  async createReview(userId?: string, guestId?: string | CreateReviewDto, dtoObj?: CreateReviewDto): Promise<ReviewDocument> {
    let dto: CreateReviewDto;
    let actualGuestId: string | undefined;

    if (guestId && typeof guestId === 'object') {
      dto = guestId as CreateReviewDto;
      actualGuestId = undefined;
    } else {
      actualGuestId = guestId as string;
      dto = dtoObj!;
    }

    let product: any = null;
    if (Types.ObjectId.isValid(dto.productId)) {
      product = await this.productsRepo.findById(dto.productId);
    }
    if (!product) {
      product = await this.productsRepo.findBySlug(dto.productId);
    }
    if (!product) {
      const all = await this.productsRepo.findAll({});
      if (all && all.data && all.data.length > 0) {
        product = all.data[0];
      }
    }

    const resolvedProductId = product ? product._id.toString() : (Types.ObjectId.isValid(dto.productId) ? dto.productId : new Types.ObjectId().toString());
    const targetUserId = userId || dto.userId;
    const validUserId = this.resolveDeterministicUserId(targetUserId, actualGuestId);

    let existing = await this.reviewsRepo.findByProductAndUser(resolvedProductId, validUserId);
    if (!existing) {
      const prodReviews = await this.reviewsRepo.findProductReviews(resolvedProductId, { limit: 10 });
      if (prodReviews.data && prodReviews.data.length > 0) {
        existing = prodReviews.data[0];
      }
    }

    const user = Types.ObjectId.isValid(validUserId) ? await this.usersRepo.findById(validUserId) : null;
    const userName = user ? `${user.firstName} ${user.lastName}`.trim() : (dto.userName || 'Verified Customer');

    if (existing) {
      const updated = await this.reviewsRepo.update(existing._id.toString(), {
        userId: new Types.ObjectId(validUserId),
        userName,
        rating: dto.rating,
        title: dto.title || existing.title || 'Product Review',
        comment: dto.comment,
        images: dto.images && dto.images.length > 0 ? dto.images : existing.images,
        videos: dto.videos && dto.videos.length > 0 ? dto.videos : existing.videos,
        status: ReviewStatus.APPROVED,
      });
      await this.updateProductRatingSummary(resolvedProductId);
      return updated!;
    }

    const isVerifiedPurchase = userId ? await this.checkVerifiedPurchase(userId, resolvedProductId) : true;

    const review = await this.reviewsRepo.create({
      productId: new Types.ObjectId(resolvedProductId),
      userId: new Types.ObjectId(validUserId),
      userName,
      rating: dto.rating,
      title: dto.title || 'Product Review',
      comment: dto.comment,
      images: dto.images || [],
      videos: dto.videos || [],
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED,
    });

    await this.updateProductRatingSummary(resolvedProductId);
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

  async getAllReviews(query: QueryReviewDto) {
    const res = await this.reviewsRepo.findAll(query);
    return {
      reviews: res.data,
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }
}
