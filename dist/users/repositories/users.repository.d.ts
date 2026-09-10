import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema.js';
export declare class UsersRepository {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    create(user: Partial<User>): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument | null>;
    findAll(options?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{
        data: UserDocument[];
        total: number;
    }>;
    findByEmail(email: string, includePassword?: boolean): Promise<UserDocument | null>;
    findByGoogleId(googleId: string): Promise<UserDocument | null>;
    findByVerificationToken(token: string): Promise<UserDocument | null>;
    findByResetToken(token: string): Promise<UserDocument | null>;
    update(id: string, updateData: UpdateQuery<UserDocument>): Promise<UserDocument | null>;
    addRefreshToken(id: string, token: string): Promise<void>;
    removeRefreshToken(id: string, token: string): Promise<void>;
    clearRefreshTokens(id: string): Promise<void>;
    addAddress(userId: string, address: import('../schemas/address.schema.js').Address): Promise<UserDocument | null>;
    resetDefaultAddresses(userId: string): Promise<void>;
    updateAddress(userId: string, addressId: string, addressData: Partial<import('../schemas/address.schema.js').Address>): Promise<UserDocument | null>;
    deleteAddress(userId: string, addressId: string): Promise<UserDocument | null>;
    getWishlist(userId: string): Promise<any[]>;
    addToWishlist(userId: string, productId: string): Promise<UserDocument | null>;
    removeFromWishlist(userId: string, productId: string): Promise<UserDocument | null>;
    addRecentlyViewed(userId: string, productId: string): Promise<UserDocument | null>;
    updateWalletBalance(userId: string, amount: number, transaction: {
        amount: number;
        type: 'credit' | 'debit';
        reason: string;
    }): Promise<UserDocument | null>;
    incrementRewardPoints(userId: string, points: number): Promise<UserDocument | null>;
}
