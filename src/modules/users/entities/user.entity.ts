import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User, UserRole } from '@prisma/client';

export class UserEntity implements User {
  @ApiProperty({ example: '01JBXK7XZ9Q8N3M8T5V2W1Y4R6' })
  id: string;

  @ApiProperty({ example: '09353435344' })
  phoneNumber: string;

  @ApiProperty({ example: 'younes' })
  displayName: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', example: UserRole.USER })
  role: $Enums.UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Asia/Tehran' })
  timezone: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
