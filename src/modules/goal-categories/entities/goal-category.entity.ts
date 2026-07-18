import { ApiProperty } from '@nestjs/swagger';
import { GoalCategory } from '@prisma/client';

export class GoalCategoryEntity implements GoalCategory {
  @ApiProperty({ example: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6' })
  id: string;

  @ApiProperty({ example: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6' })
  userId: string;

  @ApiProperty({ example: 'body' })
  title: string;

  @ApiProperty({
    example: 'RED',
    description: 'must be uperCase (RED, YELLOW)',
  })
  color: string | null;

  @ApiProperty({ example: 'home' })
  icon: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
