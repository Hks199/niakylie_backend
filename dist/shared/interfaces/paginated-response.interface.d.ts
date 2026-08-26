export interface IPaginatedResult<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export declare function createPaginatedResult<T>(items: T[], totalItems: number, page: number, limit: number): IPaginatedResult<T>;
