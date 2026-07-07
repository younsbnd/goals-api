import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FindAllUsersQueryDto } from './dto/find-all-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prismaService.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Phone number already exists');
        }
      }
      throw error;
    }
  }

  async findAll(findAllUsersQueryDto: FindAllUsersQueryDto) {
    const { page = 1, limit = 10 } = findAllUsersQueryDto;
    const skip = (page - 1) * limit;
    const take = limit;
    return await this.prismaService.user.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    try {
      return await this.prismaService.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Phone number already exists');
        }
        throw error;
      }
      throw error;
    }
  }

  async isUserExists(phoneNumber: string) {
    const user = await this.prismaService.user.findUnique({
      where: { phoneNumber },
    });
    return !!user;
  }

  async remove(id: string) {
    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
