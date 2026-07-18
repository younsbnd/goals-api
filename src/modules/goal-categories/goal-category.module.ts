import { Module } from '@nestjs/common';
import { GoalCategoryService } from './goal-category.service';
import { GoalCategoryController } from './goal-category.controller';

@Module({
  controllers: [GoalCategoryController],
  providers: [GoalCategoryService],
})
export class GoalCategoryModule {}
