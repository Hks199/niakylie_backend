export declare class CartItemInputDto {
    productId: string;
    categoryId?: string;
    quantity: number;
    unitPrice: number;
}
export declare class ValidateCouponDto {
    code: string;
    subtotal: number;
    items?: CartItemInputDto[];
    userId?: string;
}
