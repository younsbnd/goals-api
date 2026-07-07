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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateResponseSwagger(UserEntity, {
    summary: 'Register new user',
    successMessage: 'User created successfully',
    badRequestMessage: 'Validation failed',
    conflictMessage: 'User already exists',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiGetAllResponseSwagger(UserEntity, {
    summary: 'Get all users',
    successMessage: 'Get all users successfully',
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
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
