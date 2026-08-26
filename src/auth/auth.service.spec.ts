import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as sharedUtils from '../shared/utils/hash.util.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByGoogleId: jest.fn(),
    };

    const mockUsersRepository = {
      findByVerificationToken: jest.fn(),
      findByResetToken: jest.fn(),
      update: jest.fn(),
      addRefreshToken: jest.fn(),
      removeRefreshToken: jest.fn(),
      clearRefreshTokens: jest.fn(),
      findByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.secret') return 'test-secret';
        if (key === 'jwt.expiration') return '15m';
        if (key === 'jwt.refreshSecret') return 'test-refresh-secret';
        if (key === 'jwt.refreshExpiration') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user email already exists', async () => {
      const dto: RegisterDto = {
        email: 'exists@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      usersService.findByEmail.mockResolvedValue({ id: '1' } as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user with hashed password and verification token', async () => {
      const dto: RegisterDto = {
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: '1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      } as any);

      jest.spyOn(sharedUtils, 'hashPassword').mockResolvedValue('hashed-pass');

      const result = await service.register(dto);
      expect(result).toHaveProperty('verificationToken');
      expect(result.user.email).toBe(dto.email);
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials invalid', async () => {
      const dto: LoginDto = { email: 'wrong@example.com', password: 'Password' };
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return token pairs on valid credentials', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'Password123' };
      const mockUser = {
        id: '1',
        email: dto.email,
        password: 'hashedPassword',
        roles: ['customer'],
        isActive: true,
      } as any;

      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(sharedUtils, 'comparePassword').mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token-value');

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(usersRepository.addRefreshToken).toHaveBeenCalledWith('1', 'token-value');
    });
  });

  describe('verifyEmail', () => {
    it('should throw BadRequestException if token is invalid', async () => {
      usersRepository.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should update email verification status to true if token is valid', async () => {
      const mockUser = { id: '1', email: 'u@example.com' } as any;
      usersRepository.findByVerificationToken.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue(mockUser);

      const result = await service.verifyEmail('valid-token');
      expect(result.message).toContain('verified successfully');
      expect(usersRepository.update).toHaveBeenCalledWith('1', {
        $set: { isEmailVerified: true },
        $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
      });
    });
  });
});
