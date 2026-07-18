import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  MinLength,
} from 'class-validator';

export class CreateGoalCategoryDto {
  @ApiProperty({
    example: 'body',
    description: 'title must be at least 3 characters long',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'RED',
    description: 'color must be a valid color name (must be in uppercase)',
  })
  @IsString()
  @IsUppercase()
  @IsOptional()
  @MinLength(3)
  color?: string;

  @ApiProperty({
    example: 'home',
    description: 'icon must be a valid icon name',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
