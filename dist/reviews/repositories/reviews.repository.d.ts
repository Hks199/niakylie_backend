import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema.js';
import { QueryReviewDto } from '../dto/query-review.dto.js';
export interface RatingStats {
    averageRating: number;
    reviewCount: number;
    ratingBreakdown: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
export declare class ReviewsRepository {
    private readonly reviewModel;
    constructor(reviewModel: Model<ReviewDocument>);
    create(data: Partial<Review>): Promise<ReviewDocument>;
    findById(id: string): Promise<ReviewDocument | null>;
    findByProductAndUser(productId: string, userId: string): Promise<ReviewDocument | null>;
    findProductReviews(productId: string, query: QueryReviewDto): Promise<{
        data: ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAll(query: QueryReviewDto): Promise<{
        data: ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByUserId(userId: string): Promise<ReviewDocument[]>;
    update(id: string, updateData: Partial<Review>): Promise<ReviewDocument | null>;
    softDelete(id: string): Promise<ReviewDocument | null>;
    toggleHelpfulVote(reviewId: string, userId: string): Promise<ReviewDocument | null>;
    getRatingStatsForProduct(productId: string): Promise<RatingStats>;
}
