export declare class CreateBlogDto {
    title: string;
    slug: string;
    content: string;
    summary?: string;
    coverImage?: string;
    author?: string;
    category?: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    isPublished?: boolean;
}
