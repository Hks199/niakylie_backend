export declare class PaginationMetaDto {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class ApiResponseDto<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    meta?: PaginationMetaDto;
    timestamp: string;
    path: string;
}
export declare class ApiErrorResponseDto {
    success: boolean;
    statusCode: number;
    message: string;
    error?: string;
    errors?: Record<string, string[]>;
    timestamp: string;
    path: string;
}
