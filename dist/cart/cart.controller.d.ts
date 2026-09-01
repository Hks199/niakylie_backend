import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { MergeCartDto } from './dto/merge-cart.dto.js';
import { ApplyCouponDto } from './dto/apply-coupon.dto.js';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    private extractUserIdAndGuestId;
    getCart(req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    addToCart(dto: AddToCartDto, req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    updateItemQuantity(sku: string, dto: UpdateCartItemDto, req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    removeItem(sku: string, req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    mergeGuestCart(dto: MergeCartDto, req: any): Promise<import("./schemas/cart.schema.js").CartDocument>;
    toggleSaveForLater(sku: string, req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    moveToWishlist(sku: string, req: any): Promise<import("./schemas/cart.schema.js").CartDocument>;
    applyCoupon(dto: ApplyCouponDto, req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    removeCoupon(req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument>;
    clearCart(req: any, guestIdHeader?: string): Promise<import("./schemas/cart.schema.js").CartDocument | null>;
}
