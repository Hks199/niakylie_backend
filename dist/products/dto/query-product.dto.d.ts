export declare class QueryProductDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    category?: string;
    brandId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    colors?: string;
    discount?: number;
    rating?: number;
    sizes?: string;
    material?: string;
    pattern?: string;
    season?: string;
    productCollection?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
    status?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sort?: string;
}
