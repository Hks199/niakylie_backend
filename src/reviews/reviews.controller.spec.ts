import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { ReviewStatus } from './schemas/review.schema.js';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;

  const mockReview = {
    _id: '60d5ecb8b392d40015f8a003',
    rating: 5,
    comment: 'Exceeded expectations!',
  };

  beforeEach(async () => {
    const mockService = {
      createReview: jest.fn(),
      getProductReviews: jest.fn(),
      getMyReviews: jest.fn(),
      updateReview: jest.fn(),
      deleteReview: jest.fn(),
      toggleHelpfulVote: jest.fn(),
      moderateReview: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReview', () => {
    it('should delegate review creation to service', async () => {
      service.createReview.mockResolvedValue(mockReview as any);
      const req = { user: { id: 'user123' } };
      const dto = { productId: 'prod123', rating: 5, comment: 'Great product' };

      const result = await controller.createReview(dto, req);
      expect(service.createReview).toHaveBeenCalledWith('user123', undefined, {
        comment: 'Great product',
        productId: 'prod123',
        rating: 5,
      });
      expect(result).toBe(mockReview);
    });
  });

  describe('getProductReviews', () => {
    it('should delegate fetching product reviews to service', async () => {
      const mockResult = { summary: {}, reviews: [mockReview] };
      service.getProductReviews.mockResolvedValue(mockResult as any);

      const result = await controller.getProductReviews('prod123', { page: 1, limit: 10 });
      expect(service.getProductReviews).toHaveBeenCalledWith('prod123', { page: 1, limit: 10 });
      expect(result).toBe(mockResult);
    });
  });

  describe('toggleHelpfulVote', () => {
    it('should delegate helpful vote toggle to service', async () => {
      service.toggleHelpfulVote.mockResolvedValue(mockReview as any);
      const req = { user: { id: 'user123' } };

      const result = await controller.toggleHelpfulVote('review123', req);
      expect(service.toggleHelpfulVote).toHaveBeenCalledWith('review123', 'user123');
      expect(result).toBe(mockReview);
    });
  });

  describe('moderateReview', () => {
    it('should delegate review moderation to service', async () => {
      service.moderateReview.mockResolvedValue({ ...mockReview, status: ReviewStatus.APPROVED } as any);
      const dto = { status: ReviewStatus.APPROVED, adminResponse: 'Thank you!' };

      const result = await controller.moderateReview('review123', dto);
      expect(service.moderateReview).toHaveBeenCalledWith('review123', dto);
    });
  });
});
