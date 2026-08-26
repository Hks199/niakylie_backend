import { Model, UpdateQuery } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema.js';
export declare class CartRepository {
    private readonly cartModel;
    constructor(cartModel: Model<CartDocument>);
    create(data: Partial<Cart>): Promise<CartDocument>;
    findByUserId(userId: string): Promise<CartDocument | null>;
    findByGuestId(guestId: string): Promise<CartDocument | null>;
    findCart(userId?: string, guestId?: string): Promise<CartDocument | null>;
    findOrCreateCart(userId?: string, guestId?: string): Promise<CartDocument>;
    update(id: string, updateData: UpdateQuery<CartDocument>): Promise<CartDocument | null>;
    delete(id: string): Promise<void>;
    clearCart(userId?: string, guestId?: string): Promise<CartDocument | null>;
}
