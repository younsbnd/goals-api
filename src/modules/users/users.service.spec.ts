import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UserRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
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
  const prismaConflictError = new PrismaClientKnownRequestError(
    'Phone number already exists',
    {
      code: 'P2002',
      clientVersion: '7.0.0',
    },
  );
  const prismaNotFoundError = new PrismaClientKnownRequestError(
    'User not found',
    {
      code: 'P2025',
      clientVersion: '7.0.0',
    },
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if id is valid', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(fakeUser);
      mockPrismaService.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.findOne(fakeUser.id);

      expect(result).toEqual(fakeUser);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
      });
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });

    it('shoud return a NotFoundException an is user not found', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(service.findOne('not-exist-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockPrismaService.user.create.mockResolvedValue(fakeUser);

      const result = await service.create({
        displayName: 'younes',
        phoneNumber: '09432453432',
      });

      expect(result).toEqual(fakeUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          displayName: 'younes',
          phoneNumber: '09432453432',
        },
      });
    });

    it('should throw a ConflictException if the phone number already exists', async () => {
      mockPrismaService.user.create.mockRejectedValue(prismaConflictError);

      await expect(
        service.create({ displayName: 'younes', phoneNumber: '09432453432' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.delete.mockResolvedValue(fakeUser);

      const result = await service.remove(fakeUser.id);

      expect(result).toEqual(fakeUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(1);
    });
    it('should throw a NotFoundException if the user is not found', async () => {
      mockPrismaService.user.delete.mockRejectedValue(prismaNotFoundError);

      await expect(service.remove(fakeUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockPrismaService.user.update.mockResolvedValue(fakeUser);

      const result = await service.update(fakeUser.id, fakeUser);
      expect(result).toEqual(fakeUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('shuld thrwo a ConflictException if phoneNumber is alredy exists', async () => {
      mockPrismaService.user.update.mockRejectedValue(prismaConflictError);

      await expect(service.update(fakeUser.id, fakeUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should findAll users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([fakeUser]);

      const result = await service.findAll({});

      expect(result).toEqual([fakeUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
