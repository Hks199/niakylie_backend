export declare class ReturnItemDto {
    productId: string;
    variantId?: string;
    sku?: string;
    quantity: number;
}
export declare class CodRefundDetailsDto {
    upiId?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankAccountName?: string;
}
export declare class RequestReturnDto {
    orderId: string;
    reason: string;
    notes?: string;
    items: ReturnItemDto[];
    refundMethod?: 'UPI' | 'BANK';
    refundDetails?: CodRefundDetailsDto;
    images?: string[];
}
