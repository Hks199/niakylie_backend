import { ReviewStatus } from '../schemas/review.schema.js';
export declare enum ReviewSortBy {
    RECENT = "recent",
    HELPFUL = "helpful",
    RATING_HIGH = "rating_high",
    RATING_LOW = "rating_low"
}
export declare class QueryReviewDto {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: ReviewSortBy;
    status?: ReviewStatus;
    _t?: string;
}
