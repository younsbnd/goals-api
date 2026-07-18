import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGoalCategoryDto } from './dto/create-goal-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoalCategory } from '@prisma/client';
import { UpdateGoalCategoryDto } from './dto/update-goal-category.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class GoalCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createGoalCategoryDto: CreateGoalCategoryDto,
    user: JwtPayload,
  ): Promise<GoalCategory> {
    try {
      return await this.prisma.goalCategory.create({
        data: {
          ...createGoalCategoryDto,
          userId: user.sub,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async findAll(user: JwtPayload): Promise<GoalCategory[]> {
    return await this.prisma.goalCategory.findMany({
      where: { userId: user.sub },
    });
  }

  async update(
    categoryId: string,
    user: JwtPayload,
    updateGoalCategoryDto: UpdateGoalCategoryDto,
  ): Promise<GoalCategory> {
    try {
      return await this.prisma.goalCategory.update({
        where: { userId: user.sub, id: categoryId },
        data: updateGoalCategoryDto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Goal category not found');
      }
      throw error;
    }
  }

  async remove(categoryId: string, user: JwtPayload): Promise<GoalCategory> {
    try {
      return await this.prisma.goalCategory.delete({
        where: { userId: user.sub, id: categoryId },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Goal category not found');
      }
      throw error;
    }
  }
}
