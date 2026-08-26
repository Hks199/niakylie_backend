import { ReviewsService } from './reviews.service.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
export declare class ProductReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getProductReviews(id: string, query: QueryReviewDto): Promise<{
        summary: import("./repositories/reviews.repository.js").RatingStats;
        reviews: import("./schemas/review.schema.js").ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
}
