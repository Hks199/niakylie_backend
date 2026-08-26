import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyEmail: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
      logoutAllDevices: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      googleLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to authService.register', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      const expectedResult = { message: 'Verification email sent', user: {} as any, verificationToken: 'tok' };
      service.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'Password' };
      const expectedResult = { accessToken: 'access', refreshToken: 'refresh', user: {} as any };
      service.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('verifyEmail', () => {
    it('should delegate to authService.verifyEmail', async () => {
      const dto: VerifyEmailDto = { token: 'sample-token' };
      const expectedResult = { message: 'Verified' };
      service.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(dto);
      expect(service.verifyEmail).toHaveBeenCalledWith(dto.token);
      expect(result).toBe(expectedResult);
    });
  });
});
