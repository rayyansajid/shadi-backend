import { ConflictException, ConsoleLogger, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    try{
      return this.prisma.user.findUnique({
        where: { id },
      });
    } catch(error){
      console.error('[FindOneUser Error]', error);
      throw new InternalServerErrorException('Something went wrong while fetching user');
    }
  }

  async create(data: CreateUserDto){
    try {
      // Hash the password first
      const passwordHash = await bcrypt.hash(data.passwordHash, 10);

      // Build the object for Prisma manually
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role || 'CUSTOMER',
          passwordHash,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      console.error('[CreateUser Error]', error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
