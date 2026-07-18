import { Test, TestingModule } from '@nestjs/testing';
import { GoalCategoryController } from './goal-category.controller';
import { GoalCategoryService } from './goal-category.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateGoalCategoryDto } from './dto/create-goal-category.dto';
import { UpdateGoalCategoryDto } from './dto/update-goal-category.dto';

describe('GoalCategoryController', () => {
  let goalCategoryController: GoalCategoryController;

  const mockGoalCategoryService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockGoalCategory = {
    id: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    userId: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    title: 'body',
    color: 'RED',
    icon: 'home',
    createdAt: '2026-07-11T20:16:15.341Z',
    updatedAt: '2026-07-11T20:16:15.341Z',
  };

  const mockGoalCategoryId = '01JBXK7XZ9Q8N3M8T5V2W1Y4R6';

  const mockCreateGoalCategoryDto: CreateGoalCategoryDto = {
    title: 'body',
  };

  const mockUpdateGoalCategoryDto: UpdateGoalCategoryDto = {
    title: 'body',
    color: 'BLUE',
  };

  const mockUser: JwtPayload = {
    sub: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6',
    phoneNumber: '09359641234',
    role: 'USER',
    jti: '12345',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalCategoryController],
      providers: [
        { provide: GoalCategoryService, useValue: mockGoalCategoryService },
      ],
    }).compile();

    goalCategoryController = module.get<GoalCategoryController>(
      GoalCategoryController,
    );
  });
  it('should be defined', () => {
    expect(goalCategoryController).toBeDefined();
  });

  it('should call service.create with createGoalCategoryDto and user', async () => {
    mockGoalCategoryService.create.mockResolvedValue(mockGoalCategory);

    await goalCategoryController.create(mockCreateGoalCategoryDto, mockUser);
    expect(mockGoalCategoryService.create).toHaveBeenCalledWith(
      mockCreateGoalCategoryDto,
      mockUser,
    );
  });

  it('should call service.findAll with mockUser', async () => {
    mockGoalCategoryService.findAll.mockResolvedValue([mockGoalCategory]);

    const result = await goalCategoryController.findAll(mockUser);
    expect(mockGoalCategoryService.findAll).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual([mockGoalCategory]);
  });

  it('should call service.update with categoryId, user & updateGoalCategoryDto', async () => {
    mockGoalCategoryService.update.mockResolvedValue(mockGoalCategory);
    const result = await goalCategoryController.update(
      mockGoalCategoryId,
      mockUser,
      mockUpdateGoalCategoryDto,
    );
    expect(mockGoalCategoryService.update).toHaveBeenCalledWith(
      mockGoalCategoryId,
      mockUser,
      mockUpdateGoalCategoryDto,
    );
    expect(result).toEqual(mockGoalCategory);
  });

  it('should call service.remove with categoryId & user', async () => {
    mockGoalCategoryService.remove.mockResolvedValue(mockGoalCategory);
    const result = await goalCategoryController.delete(
      mockGoalCategoryId,
      mockUser,
    );

    expect(mockGoalCategoryService.remove).toHaveBeenCalledWith(
      mockGoalCategoryId,
      mockUser,
    );
    expect(result).toEqual(mockGoalCategory);
  });
});
