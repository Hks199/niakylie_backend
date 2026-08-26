import { CreateVariantDto } from './create-variant.dto.js';
export declare class CreateProductDto {
    name: string;
    description?: string;
    shortDescription?: string;
    categoryId: string;
    brandId?: string;
    variants?: CreateVariantDto[];
    material?: string;
    pattern?: string;
    season?: string;
    productCollection?: string;
    tags?: string[];
    tax?: number;
    isFeatured?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
