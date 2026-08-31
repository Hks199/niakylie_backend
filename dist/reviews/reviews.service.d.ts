import { ReviewsRepository } from './repositories/reviews.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { QueryReviewDto } from './dto/query-review.dto.js';
import { ModerateReviewDto } from './dto/moderate-review.dto.js';
import { ReviewDocument } from './schemas/review.schema.js';
export declare class ReviewsService {
    private readonly reviewsRepo;
    private readonly productsRepo;
    private readonly ordersRepo;
    private readonly usersRepo;
    constructor(reviewsRepo: ReviewsRepository, productsRepo: ProductsRepository, ordersRepo: OrdersRepository, usersRepo: UsersRepository);
    private updateProductRatingSummary;
    checkVerifiedPurchase(userId: string, productId: string): Promise<boolean>;
    createReview(userId: string, dto: CreateReviewDto): Promise<ReviewDocument>;
    getProductReviews(productId: string, query: QueryReviewDto): Promise<{
        summary: import("./repositories/reviews.repository.js").RatingStats;
        reviews: ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMyReviews(userId: string): Promise<ReviewDocument[]>;
    updateReview(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<ReviewDocument>;
    deleteReview(reviewId: string, userId: string, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    toggleHelpfulVote(reviewId: string, userId: string): Promise<ReviewDocument>;
    moderateReview(reviewId: string, dto: ModerateReviewDto): Promise<ReviewDocument>;
    getAllReviews(query: QueryReviewDto): Promise<{
        reviews: ReviewDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
}
