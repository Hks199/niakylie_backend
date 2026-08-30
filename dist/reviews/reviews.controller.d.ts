import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import { ModerateReviewDto } from './dto/moderate-review.dto.js';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(dto: CreateReviewDto, req: any): Promise<import("./schemas/review.schema.js").ReviewDocument>;
    getProductReviews(productId: string, query: QueryReviewDto): Promise<{
        summary: import("./repositories/reviews.repository.js").RatingStats;
        reviews: import("./schemas/review.schema.js").ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMyReviews(req: any): Promise<import("./schemas/review.schema.js").ReviewDocument[]>;
    updateReview(reviewId: string, dto: UpdateReviewDto, req: any): Promise<import("./schemas/review.schema.js").ReviewDocument>;
    deleteReview(reviewId: string, req: any): Promise<{
        message: string;
    }>;
    toggleHelpfulVote(reviewId: string, req: any): Promise<import("./schemas/review.schema.js").ReviewDocument>;
    getAllReviewsAdminAll(query: QueryReviewDto): Promise<{
        reviews: import("./schemas/review.schema.js").ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAllReviewsAdmin(query: QueryReviewDto): Promise<{
        reviews: import("./schemas/review.schema.js").ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    moderateReview(reviewId: string, dto: ModerateReviewDto): Promise<import("./schemas/review.schema.js").ReviewDocument>;
}
