import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ReviewsService } from './reviews.service.js';
import { ReviewsRepository } from './repositories/reviews.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ReviewStatus } from './schemas/review.schema.js';
import { OrderStatus } from '../checkout/schemas/order.schema.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepo: jest.Mocked<ReviewsRepository>;
  let productsRepo: jest.Mocked<ProductsRepository>;
  let ordersRepo: jest.Mocked<OrdersRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;

  const productId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const userId = new Types.ObjectId('60d5ecb8b392d40015f8a002');
  const reviewId = new Types.ObjectId('60d5ecb8b392d40015f8a003');

  const mockProduct = {
    _id: productId,
    name: 'Designer Saree',
    ratings: { averageRating: 0, reviewCount: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  };

  const mockUser = {
    _id: userId,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@test.com',
  };

  const mockReview = {
    _id: reviewId,
    productId,
    userId,
    userName: 'Jane Doe',
    rating: 5,
    title: 'Great Product',
    comment: 'Exceeded expectations!',
    images: ['https://cdn.niakylie.com/img1.jpg'],
    videos: [],
    isVerifiedPurchase: true,
    helpfulVotes: 2,
    votedUserIds: [],
    status: ReviewStatus.APPROVED,
    isDeleted: false,
  };

  beforeEach(async () => {
    const mockReviewsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByProductAndUser: jest.fn(),
      findProductReviews: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      toggleHelpfulVote: jest.fn(),
      getRatingStatsForProduct: jest.fn().mockResolvedValue({
        averageRating: 5.0,
        reviewCount: 1,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
      }),
    };

    const mockProductsRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const mockOrdersRepo = {
      findByUserId: jest.fn(),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
    };

    const mockNotificationsService = {
      sendNotification: jest.fn().mockResolvedValue(undefined),
      sendAdminEventNotification: jest.fn().mockResolvedValue(undefined),
      broadcastNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: mockReviewsRepo },
        { provide: ProductsRepository, useValue: mockProductsRepo },
        { provide: OrdersRepository, useValue: mockOrdersRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepo = module.get(ReviewsRepository);
    productsRepo = module.get(ProductsRepository);
    ordersRepo = module.get(OrdersRepository);
    usersRepo = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    it('should still create review when product lookup fails', async () => {
      productsRepo.findById.mockResolvedValue(null);
      productsRepo.findBySlug.mockResolvedValue(null);
      productsRepo.findAll.mockResolvedValue({ data: [], total: 0 } as any);
      reviewsRepo.findByProductAndUser.mockResolvedValue(null);
      reviewsRepo.findProductReviews.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 } as any);
      reviewsRepo.create.mockResolvedValue(mockReview as any);
      ordersRepo.findByUserId.mockResolvedValue([]);

      // Service no longer hard-fails on missing product; it falls back and still creates
      const result = await service.createReview(userId.toString(), undefined, {
        productId: productId.toString(),
        rating: 5,
        comment: 'Love it!',
      });
      expect(reviewsRepo.create).toHaveBeenCalled();
      expect(result).toBe(mockReview);
    });

    it('should update existing review instead of rejecting duplicate', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct as any);
      reviewsRepo.findByProductAndUser.mockResolvedValue(mockReview as any);
      reviewsRepo.update.mockResolvedValue(mockReview as any);

      // Existing reviews are updated rather than rejected
      const result = await service.createReview(userId.toString(), undefined, {
        productId: productId.toString(),
        rating: 5,
        comment: 'Duplicate review',
      });
      expect(reviewsRepo.update).toHaveBeenCalled();
      expect(result).toBe(mockReview);
    });

    it('should create review and update product rating summary', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct as any);
      reviewsRepo.findByProductAndUser.mockResolvedValue(null);
      reviewsRepo.findProductReviews.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 } as any);
      usersRepo.findById.mockResolvedValue(mockUser as any);
      ordersRepo.findByUserId.mockResolvedValue([
        {
          orderStatus: OrderStatus.DELIVERED,
          items: [{ productId }],
        },
      ] as any);
      reviewsRepo.create.mockResolvedValue(mockReview as any);

      const result = await service.createReview(userId.toString(), undefined, {
        productId: productId.toString(),
        rating: 5,
        title: 'Great Product',
        comment: 'Exceeded expectations!',
        images: ['https://cdn.niakylie.com/img1.jpg'],
      });

      expect(reviewsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerifiedPurchase: true,
          rating: 5,
        }),
      );
      expect(productsRepo.update).toHaveBeenCalledWith(productId.toString(), expect.any(Object));
      expect(result).toBe(mockReview);
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews and rating summary', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct as any);
      reviewsRepo.findProductReviews.mockResolvedValue({
        data: [mockReview as any],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.getProductReviews(productId.toString(), { page: 1, limit: 10 });

      expect(result.summary.averageRating).toBe(5.0);
      expect(result.reviews).toHaveLength(1);
    });
  });

  describe('updateReview', () => {
    it('should update review if caller is author', async () => {
      reviewsRepo.findById.mockResolvedValue(mockReview as any);
      reviewsRepo.update.mockResolvedValue({ ...mockReview, rating: 4 } as any);

      const result = await service.updateReview(reviewId.toString(), userId.toString(), { rating: 4 });
      expect(result.rating).toBe(4);
    });

    it('should throw ForbiddenException if user is not author', async () => {
      reviewsRepo.findById.mockResolvedValue(mockReview as any);
      const wrongUser = new Types.ObjectId().toString();

      await expect(
        service.updateReview(reviewId.toString(), wrongUser, { rating: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toggleHelpfulVote', () => {
    it('should delegate helpful vote toggle to repository', async () => {
      reviewsRepo.toggleHelpfulVote.mockResolvedValue({ ...mockReview, helpfulVotes: 3 } as any);

      const result = await service.toggleHelpfulVote(reviewId.toString(), userId.toString());
      expect(reviewsRepo.toggleHelpfulVote).toHaveBeenCalledWith(reviewId.toString(), userId.toString());
      expect(result.helpfulVotes).toBe(3);
    });
  });

  describe('moderateReview', () => {
    it('should allow admin to moderate review status', async () => {
      reviewsRepo.findById.mockResolvedValue(mockReview as any);
      reviewsRepo.update.mockResolvedValue({ ...mockReview, status: ReviewStatus.REJECTED } as any);

      const result = await service.moderateReview(reviewId.toString(), {
        status: ReviewStatus.REJECTED,
        adminResponse: 'Violates guidelines',
      });

      expect(reviewsRepo.update).toHaveBeenCalledWith(reviewId.toString(), {
        status: ReviewStatus.REJECTED,
        adminResponse: 'Violates guidelines',
      });
      expect(result.status).toBe(ReviewStatus.REJECTED);
    });
  });
});
