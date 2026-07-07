import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('findOne', () => {
    it('should get a user', async () => {
      mockUsersService.findOne.mockResolvedValue(fakeUser);

      const result = await controller.findOne(fakeUser.id);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(fakeUser.id);
      expect(result).toEqual(fakeUser);
    });
  });

  describe('findAll', () => {
    it('should get all users', async () => {
      mockUsersService.findAll.mockResolvedValue([fakeUser]);
      const result = await controller.findAll();
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([fakeUser]);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockUsersService.create.mockResolvedValue(fakeUser);
      const result = await controller.create(fakeUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(fakeUser);
      expect(result).toEqual(fakeUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockUsersService.update.mockResolvedValue(fakeUser);
      const result = await controller.update(fakeUser.id, fakeUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        fakeUser.id,
        fakeUser,
      );
      expect(result).toEqual(fakeUser);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(fakeUser);
      const result = await controller.remove(fakeUser.id);
      expect(mockUsersService.remove).toHaveBeenCalledWith(fakeUser.id);
      expect(result).toEqual(fakeUser);
    });
  });
});
