import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

import { UsersService } from './users.service.js';
import { UsersRepository } from './repositories/users.repository.js';
import { Order } from '../checkout/schemas/order.schema.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      addAddress: jest.fn(),
      resetDefaultAddresses: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
      addToWishlist: jest.fn(),
      removeFromWishlist: jest.fn(),
      addRecentlyViewed: jest.fn(),
      updateWalletBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: getModelToken(Order.name), useValue: { aggregate: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should call update and return updated user', async () => {
      const mockUser = { id: '1', firstName: 'Jane' } as any;
      repository.update.mockResolvedValue(mockUser);

      const result = await service.updateProfile('1', { firstName: 'Jane' });
      expect(result).toBe(mockUser);
      expect(repository.update).toHaveBeenCalledWith('1', { firstName: 'Jane' });
    });
  });

  describe('addAddress', () => {
    it('should set first address as default if user has no addresses', async () => {
      const mockUser = { id: '1', addresses: [] } as any;
      repository.findById.mockResolvedValue(mockUser);
      repository.addAddress.mockResolvedValue({
        ...mockUser,
        addresses: [{ street: 'Main St', isDefault: true }],
      } as any);

      const dto = { street: 'Main St', city: 'NYC', state: 'NY', postalCode: '1', country: 'US', phone: '1' };
      const result = await service.addAddress('1', dto);

      expect(result.addresses[0].isDefault).toBe(true);
      expect(repository.resetDefaultAddresses).toHaveBeenCalledWith('1');
    });
  });

  describe('wallet', () => {
    it('should throw BadRequestException if debit amount exceeds balance', async () => {
      const mockUser = { id: '1', wallet: { balance: 10, history: [] } } as any;
      repository.findById.mockResolvedValue(mockUser);

      await expect(service.debitWallet('1', 20, 'buying')).rejects.toThrow(BadRequestException);
    });

    it('should debit wallet if balance is sufficient', async () => {
      const mockUser = { id: '1', wallet: { balance: 100, history: [] } } as any;
      repository.findById.mockResolvedValue(mockUser);
      repository.updateWalletBalance.mockResolvedValue({
        id: '1',
        wallet: { balance: 80, history: [] },
      } as any);

      const result = await service.debitWallet('1', 20, 'buying');
      expect(result.wallet.balance).toBe(80);
      expect(repository.updateWalletBalance).toHaveBeenCalledWith('1', -20, {
        amount: 20,
        type: 'debit',
        reason: 'buying',
      });
    });
  });
});
