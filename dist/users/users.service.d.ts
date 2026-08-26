import { UsersRepository } from './repositories/users.repository.js';
import { UserDocument } from './schemas/user.schema.js';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    create(userData: Partial<import('./schemas/user.schema.js').User>): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string, includePassword?: boolean): Promise<UserDocument | null>;
    findByGoogleId(googleId: string): Promise<UserDocument | null>;
    update(id: string, updateData: Partial<import('./schemas/user.schema.js').User>): Promise<UserDocument>;
    updateProfile(id: string, updateDto: import('./dto/update-profile.dto.js').UpdateProfileDto): Promise<UserDocument>;
    updateAvatar(id: string, filePath: string): Promise<UserDocument>;
    addAddress(userId: string, addressDto: import('./dto/address.dto.js').AddressDto): Promise<UserDocument>;
    updateAddress(userId: string, addressId: string, addressDto: import('./dto/address.dto.js').AddressDto): Promise<UserDocument>;
    deleteAddress(userId: string, addressId: string): Promise<UserDocument>;
    addToWishlist(userId: string, productId: string): Promise<UserDocument>;
    removeFromWishlist(userId: string, productId: string): Promise<UserDocument>;
    addRecentlyViewed(userId: string, productId: string): Promise<UserDocument>;
    updateNotificationPreferences(userId: string, preferenceDto: import('./dto/notification-preference.dto.js').UpdateNotificationPreferenceDto): Promise<UserDocument>;
    creditWallet(userId: string, amount: number, reason: string): Promise<UserDocument>;
    debitWallet(userId: string, amount: number, reason: string): Promise<UserDocument>;
}
