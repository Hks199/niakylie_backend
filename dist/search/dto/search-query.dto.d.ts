export declare class SearchQueryDto {
    q?: string;
    categoryId?: string;
    brandId?: string;
    colors?: string;
    sizes?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    minRating?: number;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
    page?: number;
    limit?: number;
    nocache?: boolean;
}
