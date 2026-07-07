import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '09359345434',
    description:
      'The phone number of the user (should start with 09 and be 11 digits long). The phone number must be unique.',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must start with 09 and be 11 digits long',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'younes',
    description: 'The display name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;
  @ApiPropertyOptional({
    example: UserRole.USER,
    description: 'The role of the user (should be a valid role).',
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'The active status of the user (should be a valid boolean).',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    example: 'Asia/Tehran',
    default: 'Asia/Tehran',
    description:
      'The timezone of the user (should be a valid timezone). The timezone must be a valid timezone. The timezone is optional and defaults to "Asia/Tehran".',
  })
  @IsString()
  @IsOptional()
  timezone?: string = 'Asia/Tehran';
}
