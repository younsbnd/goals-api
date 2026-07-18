import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { GoalCategoryService } from './goal-category.service';
import { CreateGoalCategoryDto } from './dto/create-goal-category.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GoalCategory } from '@prisma/client';
import { GoalCategoryEntity } from './entities/goal-category.entity';
import { ApiCreateResponseSwagger } from 'src/common/decorators/api-create-response.decorator';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ApiGetAllResponseSwagger } from 'src/common/decorators/api-get-all-response.decorator';
import { UpdateGoalCategoryDto } from './dto/update-goal-category.dto';
import { ApiUpdateResponseSwagger } from 'src/common/decorators/api-update-response.decorator';
import { ApiDeleteResponseSwagger } from 'src/common/decorators/api-delete-response.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiCookieAuth('accessToken')
@Controller('goal-categories')
export class GoalCategoryController {
  constructor(private readonly goalCategoryService: GoalCategoryService) {}
  @Post()
  @ApiCreateResponseSwagger(GoalCategoryEntity, {
    summary: 'Create goal category',
    badRequestMessage: 'validation failed',
    successMessage: 'Create goal category successfully',
    isUnauthorized: true,
  })
  create(
    @Body() createGoalCategoryDto: CreateGoalCategoryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<GoalCategory> {
    return this.goalCategoryService.create(createGoalCategoryDto, user);
  }

  @Get()
  @ApiGetAllResponseSwagger(GoalCategoryEntity, {
    summary: 'Get all goal categories by user with token (no pagination)',
    successMessage: 'Get all goal categories by user with token successfully ',
    isUnauthorized: true,
  })
  findAll(@CurrentUser() user: JwtPayload): Promise<GoalCategory[]> {
    return this.goalCategoryService.findAll(user);
  }

  @Patch(':categoryId')
  @ApiUpdateResponseSwagger(GoalCategoryEntity, {
    summary: 'Update goal category by categoryId',
    successMessage: 'Update goal category by categoryId successfully',
    notFoundMessage: 'Goal category not found',
    badRequestMessage: 'validation failed',
    isUnauthorized: true,
  })
  update(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateGoalCategoryDto: UpdateGoalCategoryDto,
  ): Promise<GoalCategory> {
    return this.goalCategoryService.update(
      categoryId,
      user,
      updateGoalCategoryDto,
    );
  }

  @Delete(':categoryId')
  @ApiDeleteResponseSwagger(GoalCategoryEntity, {
    summary: 'Delete goal category by categoryId',
    successMessage: 'Delete goal category by categoryId successfully',
    notFoundMessage: 'Goal category not found',
    badRequestMessage: 'validation failed or categoryId is not valid',
    isUnauthorized: true,
  })
  delete(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<GoalCategory> {
    return this.goalCategoryService.remove(categoryId, user);
  }
}
