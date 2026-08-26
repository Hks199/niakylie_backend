export declare class QueryCategoryDto {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    parentId?: string;
    status?: boolean;
}
