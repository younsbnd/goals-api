import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    refreshTokens: jest.fn(),
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };
  const mockRes = {
    cookie: jest.fn(),
  } as unknown as Response;

  const mockRefreshTokenDto: JwtRefreshPayload = {
    sub: '1',
    phoneNumber: '0934564343',
    role: UserRole.ADMIN,
    refreshToken: 'fdklshfksdhf3847327',
    jti: '',
  };

  const mockOtpDto = {
    phoneNumber: '0934534245',
  };

  const mockResponseRefreshToken = {
    accessToken: 'sdfsdffdsfs3523gdggsd345435gfd4543g',
    refreshToken: 'dfsfoihedgsdgsg435345345gfdfgdrger',
    accessTokenTtl: 4000,
    refreshTokenTtl: 10000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be define', () => {
    expect(authController).toBeDefined();
  });

  it('should call refreshTokens with user payload', async () => {
    mockAuthService.refreshTokens.mockResolvedValue(mockRefreshTokenDto);
    const res = await authController.refreshTokens(
      mockRefreshTokenDto,
      mockRes,
    );

    expect(res).toBe(true);
    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
      mockRefreshTokenDto,
    );
  });

  it('should throw when authService.refreshTokens throws', async () => {
    mockAuthService.refreshTokens.mockRejectedValue(new BadRequestException());
    await expect(
      authController.refreshTokens(mockRefreshTokenDto, mockRes),
    ).rejects.toThrow(BadRequestException);
  });

  it('should send and create otp', async () => {
    mockAuthService.requestOtp.mockResolvedValue(true);
    const res = await authController.requestOtp(mockOtpDto);
    expect(res).toBe(true);
    expect(mockAuthService.requestOtp).toHaveBeenCalledWith(mockOtpDto);
  });

  it('should failed to send and create otp', async () => {
    mockAuthService.requestOtp.mockRejectedValue(new BadRequestException());
    await expect(authController.requestOtp(mockOtpDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should set cookies after success verify', async () => {
    mockAuthService.verifyOtp.mockResolvedValue(mockResponseRefreshToken);

    const cookieMock = jest.fn();
    const mockRes = {
      cookie: cookieMock,
    } as unknown as Response;

    const verifyOtpDto = { phoneNumber: '0932543453', code: '123456' };

    const result = await authController.verifyOtp(verifyOtpDto, mockRes);
    expect(result).toBe(true);
    expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(verifyOtpDto);

    expect(cookieMock).toHaveBeenCalledTimes(2);

    expect(cookieMock).toHaveBeenCalledWith(
      'accessToken',
      mockResponseRefreshToken.accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: mockResponseRefreshToken.accessTokenTtl,
      },
    );
    expect(cookieMock).toHaveBeenCalledWith(
      'refreshToken',
      mockResponseRefreshToken.refreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: mockResponseRefreshToken.refreshTokenTtl,
      },
    );
  });
  it('should dont set cookies after failed verify', async () => {
    mockAuthService.verifyOtp.mockRejectedValue(new UnauthorizedException());

    const cookieMock = jest.fn();
    const mockRes = {
      cookie: cookieMock,
    } as unknown as Response;

    const verifyOtpDto = { phoneNumber: '0932543453', code: '123456' };

    await expect(
      authController.verifyOtp(verifyOtpDto, mockRes),
    ).rejects.toThrow(UnauthorizedException);

    expect(cookieMock).not.toHaveBeenCalled();
  });
});
