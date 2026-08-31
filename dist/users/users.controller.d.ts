import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { AddressDto } from './dto/address.dto.js';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto.js';
import { User } from './schemas/user.schema.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<User>;
    updateProfile(user: User, updateDto: UpdateProfileDto): Promise<import("./schemas/user.schema.js").UserDocument>;
    uploadAvatar(user: User, file: Express.Multer.File): Promise<import("./schemas/user.schema.js").UserDocument>;
    getAddresses(user: User): Promise<import("./schemas/address.schema.js").Address[]>;
    addAddress(user: User, addressDto: AddressDto): Promise<import("./schemas/user.schema.js").UserDocument>;
    updateAddress(user: User, addressId: string, addressDto: AddressDto): Promise<import("./schemas/user.schema.js").UserDocument>;
    deleteAddress(user: User, addressId: string): Promise<import("./schemas/user.schema.js").UserDocument>;
    getWishlist(user: User): Promise<import("mongoose").Types.ObjectId[]>;
    toggleWishlist(user: User, dto: {
        productId: string;
        variantId?: string;
    }): Promise<{
        isWishlisted: boolean;
        message: string;
    }>;
    addToWishlist(user: User, productId: string): Promise<import("./schemas/user.schema.js").UserDocument>;
    removeFromWishlist(user: User, productId: string): Promise<import("./schemas/user.schema.js").UserDocument>;
    getRecentlyViewed(user: User): Promise<{
        productId: import("mongoose").Types.ObjectId;
        viewedAt: Date;
    }[]>;
    addRecentlyViewed(user: User, productId: string): Promise<import("./schemas/user.schema.js").UserDocument>;
    updateNotificationPreferences(user: User, preferenceDto: UpdateNotificationPreferenceDto): Promise<import("./schemas/user.schema.js").UserDocument>;
    getWallet(user: User): Promise<{
        balance: number;
        history: Array<{
            amount: number;
            type: "credit" | "debit";
            reason: string;
            createdAt: Date;
        }>;
    }>;
}
