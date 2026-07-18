import { PartialType } from '@nestjs/swagger';
import { CreateGoalCategoryDto } from './create-goal-category.dto';

export class UpdateGoalCategoryDto extends PartialType(CreateGoalCategoryDto) {}
