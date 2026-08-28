export declare class CreateCategoryDto {
    name: string;
    slug?: string;
    parentId?: string | null;
    description?: string;
    displayOrder?: number;
    status?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
