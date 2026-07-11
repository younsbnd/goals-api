import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpType, UserRole } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
jest.mock('bcrypt');

describe('Otp.service', () => {
  let service: OtpService;
  const mockPrismaService = {
    otp: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const fakeOtp = {
    id: '1',
    phoneNumber: '09359641234',
    code: '123456',
    type: OtpType.LOGIN,
    expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const fakeUser = {
    id: '1',
    displayName: 'John Doe',
    phoneNumber: 'john.doe@example.com',
    role: UserRole.USER,
    isActive: true,
    timezone: 'Asia/Tehran',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();
    service = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('/upsert', () => {
    it('should upsert an OTP', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);
      mockPrismaService.otp.upsert.mockResolvedValue(fakeOtp);

      const result = await service.generate(fakeOtp.phoneNumber);

      expect(result).toEqual(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.otp.upsert).toHaveBeenCalledTimes(1);
    });

    it('should throw a BadRequestException if the phoneNumber is not valid', async () => {
      const prismaError = new Error('Phone number is not valid');
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);
      mockPrismaService.otp.upsert.mockRejectedValue(prismaError);
      await expect(service.generate('0943533')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('/verify', () => {
    it('should verify an OTP', async () => {
      mockPrismaService.otp.findUnique.mockResolvedValue(fakeOtp);
      mockPrismaService.otp.delete.mockResolvedValue(fakeOtp);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.verify(fakeOtp.phoneNumber, fakeOtp.code);

      expect(result).toEqual(true);
    });
    it('should throw a BadRequestException if the OTP is not valid', async () => {
      mockPrismaService.otp.findUnique.mockResolvedValue(null);
      mockPrismaService.otp.delete.mockResolvedValue(fakeOtp);

      await expect(
        service.verify(fakeOtp.phoneNumber, fakeOtp.code),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
