import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { ApiCreateResponseSwagger } from 'src/common/decorators/api-create-response.decorator';
import { ApiGetAllResponseSwagger } from 'src/common/decorators/api-get-all-response.decorator';
import { ApiDeleteResponseSwagger } from 'src/common/decorators/api-delete-response.decorator';
import { ApiGetOneResponseSwagger } from 'src/common/decorators/api-get-one-response.decorator';
import { ApiUpdateResponseSwagger } from 'src/common/decorators/api-update-response.decorator';
import { FindAllUsersQueryDto } from './dto/find-all-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiCookieAuth } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@ApiCookieAuth('accessToken')
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateResponseSwagger(UserEntity, {
    summary: 'Register new user',
    successMessage: 'User created successfully',
    badRequestMessage: 'Validation failed',
    conflictMessage: 'User already exists',
    isUnauthorized: true,
    isForbidden: true,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiGetAllResponseSwagger(UserEntity, {
    summary: 'Get all users',
    successMessage: 'Get all users successfully',
    isUnauthorized: true,
    isForbidden: true,
  })
  findAll(@Query() findAllUsersQueryDto: FindAllUsersQueryDto = {}) {
    return this.usersService.findAll(findAllUsersQueryDto || {});
  }

  @Get(':id')
  @ApiGetOneResponseSwagger(UserEntity, {
    summary: 'Get user by id',
    successMessage: 'Get user by id successfully',
    notFoundMessage: 'User not found',
    badRequestMessage: 'Validation failed',
    isUnauthorized: true,
    isForbidden: true,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateResponseSwagger(UserEntity, {
    summary: 'Update user by id',
    successMessage: 'Update user by id successfully',
    notFoundMessage: 'User not found',
    badRequestMessage: 'Validation failed',
    conflictMessage: 'User already exists',
    isUnauthorized: true,
    isForbidden: true,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get(':phoneNumber/exists')
  @ApiGetOneResponseSwagger(Boolean, {
    summary: 'Check if user exists by phone number',
    successMessage: 'User exists successfully',
    badRequestMessage: 'Validation failed',
    notFoundMessage: 'User not found',
    isUnauthorized: true,
    isForbidden: true,
  })
  isUserExists(@Param('phoneNumber') phoneNumber: string) {
    return this.usersService.isUserExists(phoneNumber);
  }

  @Delete(':id')
  @ApiDeleteResponseSwagger(UserEntity, {
    summary: 'Delete a user by id',
    notFoundMessage: 'User not found',
    badRequestMessage: 'Validation failed',
    conflictMessage: 'User already exists',
    isUnauthorized: true,
    isForbidden: true,
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
