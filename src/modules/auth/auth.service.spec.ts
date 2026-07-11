import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { OtpService } from '../otp/otp.service';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

describe('Auth.service', () => {
  let authService: AuthService;
  const mockOtpService = {
    generate: jest.fn(),
    verify: jest.fn(),
  };
  const mockTokenService = {
    issueTokens: jest.fn(),
    refreshTokens: jest.fn(),
  };
  const mockUsersService = {
    findOrCreateUser: jest.fn(),
  };
  const otpDto = {
    phoneNumber: '09359853256',
  };
  const verifyOtpDto = {
    phoneNumber: '09359853256',
    code: '123456',
  };
  const mockUser = {
    id: '1',
    displayName: 'John Doe',
    phoneNumber: 'john.doe@example.com',
    role: UserRole.USER,
    isActive: true,
    timezone: 'Asia/Tehran',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockCreateTokenResponse = {
    accessToken: 'dfjkalkjhieohtioweh342094230fnsdkfskdl',
    refreshToken: 'dsakfh324h320fdsfksldfkjklj2304932jf',
    accessTokenTtl: 1000,
    refreshTokenTtl: 1000,
  };
  const mockRefreshTokenDto: JwtRefreshPayload = {
    sub: '1',
    phoneNumber: otpDto.phoneNumber,
    role: UserRole.ADMIN,
    refreshToken: 'fdklshfksdhf3847327',
    jti: '',
  };
  beforeEach(async () => {
    const modoule: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();
    authService = modoule.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be define authService ', () => {
    expect(authService).toBeDefined();
  });
  describe('requestOtp', () => {
    it('should create otp', async () => {
      mockOtpService.generate.mockResolvedValue(true);
      const result = await authService.requestOtp(otpDto);
      expect(result).toBe(true);
      expect(mockOtpService.generate).toHaveBeenCalledWith(otpDto.phoneNumber);
    });
    it('should BadRequestException if otp generation fails', async () => {
      const mockError = new BadRequestException(
        'Please try again in 30 seconds',
      );
      mockOtpService.generate.mockRejectedValue(mockError);
      await expect(authService.requestOtp(otpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify otp', async () => {
      mockOtpService.verify.mockResolvedValue(true);
      mockUsersService.findOrCreateUser.mockResolvedValue(mockUser);
      mockTokenService.issueTokens.mockResolvedValue(mockCreateTokenResponse);

      const result = await authService.verifyOtp(verifyOtpDto);

      expect(result).toEqual(mockCreateTokenResponse);
    });

    it('should verify failed', async () => {
      const mockErro = new BadRequestException('Invalid OTP code');
      mockOtpService.verify.mockRejectedValue(mockErro);
      mockUsersService.findOrCreateUser.mockResolvedValue(mockUser);
      mockTokenService.issueTokens.mockResolvedValue(mockCreateTokenResponse);

      await expect(authService.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.findOrCreateUser).not.toHaveBeenCalled();
      expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refreshToken successfull', async () => {
      mockTokenService.refreshTokens.mockResolvedValue(mockCreateTokenResponse);

      const result = await authService.refreshTokens(mockRefreshTokenDto);

      expect(result).toEqual(mockCreateTokenResponse);
    });
    it('should UnauthorizedException if not found refreshToken', async () => {
      const mockError = new UnauthorizedException(
        'Invalid refresh token or expired',
      );
      mockTokenService.refreshTokens.mockRejectedValue(mockError);

      await expect(
        authService.refreshTokens(mockRefreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
