import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      updateAvatar: jest.fn(),
      addAddress: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
      addToWishlist: jest.fn(),
      removeFromWishlist: jest.fn(),
      addRecentlyViewed: jest.fn(),
      updateNotificationPreferences: jest.fn(),
      creditWallet: jest.fn(),
      debitWallet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the current user object directly', async () => {
      const mockUser = { email: 'jane@example.com' } as any;
      const result = await controller.getProfile(mockUser);
      expect(result).toBe(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should delegate update to usersService', async () => {
      const mockUser = { id: '1' } as any;
      const dto = { firstName: 'Jane' };
      service.updateProfile.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await controller.updateProfile(mockUser, dto);
      expect(service.updateProfile).toHaveBeenCalledWith('1', dto);
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('wishlist', () => {
    it('should call addToWishlist on usersService', async () => {
      const mockUser = { id: '1' } as any;
      const productId = 'prod123';
      service.addToWishlist.mockResolvedValue({ id: '1', wishlist: [productId] } as any);

      const result = await controller.addToWishlist(mockUser, productId);
      expect(service.addToWishlist).toHaveBeenCalledWith('1', productId);
      expect(result.wishlist).toContain(productId);
    });
  });
});
