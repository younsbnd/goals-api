import { Test, TestingModule } from '@nestjs/testing';
import { GoalCategoryService } from './goal-category.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

describe('GoalCategoryService', () => {
  let service: GoalCategoryService;
  const mockPrismaService = {
    goalCategory: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockPrismaNotFoundError = new PrismaClientKnownRequestError(
    'Foreign key constraint failed',
    { code: 'P2025', clientVersion: '7.0.0' },
  );

  const mockGoalCategory = {
    id: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    userId: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    title: 'body',
    color: 'RED',
    icon: 'home',
    createdAt: '2026-07-11T20:16:15.341Z',
    updatedAt: '2026-07-11T20:16:15.341Z',
  };

  const mockCreateGoalCategoryDto = {
    title: 'body',
  };

  const mockUser: JwtPayload = {
    sub: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    phoneNumber: '09359641234',
    role: 'USER',
    jti: '12345',
  };

  const mockUpdateDto = {
    title: 'learn',
    color: 'BLUE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalCategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GoalCategoryService>(GoalCategoryService);
  });

  it('should be define', () => {
    expect(service).toBeDefined();
  });

  it('should be create goal category', async () => {
    mockPrismaService.goalCategory.create.mockResolvedValue(mockGoalCategory);

    const res = await service.create(mockCreateGoalCategoryDto, mockUser);
    expect(res).toMatchObject({
      ...mockCreateGoalCategoryDto,
    });
    expect(mockPrismaService.goalCategory.create).toHaveBeenLastCalledWith({
      data: {
        userId: mockUser.sub,
        title: mockCreateGoalCategoryDto.title,
      },
    });
  });

  it('should be NotFoundException error if user is not found', async () => {
    const mockPrismaError = new PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      { code: 'P2003', clientVersion: '7.0.0' },
    );
    mockPrismaService.goalCategory.create.mockRejectedValue(mockPrismaError);

    await expect(
      service.create(mockCreateGoalCategoryDto, mockUser),
    ).rejects.toThrow(NotFoundException);
  });

  it('should be update goal category', async () => {
    mockPrismaService.goalCategory.update.mockResolvedValue(mockGoalCategory);

    const res = await service.update(
      mockGoalCategory.id,
      mockUser,
      mockUpdateDto,
    );

    expect(res).toMatchObject(mockGoalCategory);
    expect(mockPrismaService.goalCategory.update).toHaveBeenCalledWith({
      data: mockUpdateDto,
      where: {
        userId: mockUser.sub,
        id: mockGoalCategory.id,
      },
    });
  });

  it('should be NotFoundException if categoryId not found', async () => {
    mockPrismaService.goalCategory.update.mockRejectedValue(
      mockPrismaNotFoundError,
    );

    await expect(
      service.update(mockGoalCategory.id, mockUser, mockUpdateDto),
    ).rejects.toThrow(NotFoundException);
    expect(mockPrismaService.goalCategory.update).toHaveBeenCalledWith({
      data: mockUpdateDto,
      where: {
        userId: mockUser.sub,
        id: mockGoalCategory.id,
      },
    });
  });

  it('should be delete goal category', async () => {
    mockPrismaService.goalCategory.delete.mockResolvedValue(mockGoalCategory);
    const res = await service.remove(mockGoalCategory.id, mockUser);
    expect(res).toBe(mockGoalCategory);
    expect(mockPrismaService.goalCategory.delete).toHaveBeenCalledWith({
      where: { id: mockGoalCategory.id, userId: mockUser.sub },
    });
  });

  it('should be NotFoundException error if goal category is not found', async () => {
    mockPrismaService.goalCategory.delete.mockRejectedValue(
      mockPrismaNotFoundError,
    );

    await expect(service.remove(mockGoalCategory.id, mockUser)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrismaService.goalCategory.delete).toHaveBeenCalledWith({
      where: { id: mockGoalCategory.id, userId: mockUser.sub },
    });
  });
});
