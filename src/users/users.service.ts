import { ConflictException, ConsoleLogger, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from 'generated/prisma';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    try{
      return this.prisma.user.findUnique({
        where: { id },
      });
      // console.log('user: ', user);
      // return user;
    } catch(error){
      console.error('[FindOneUser Error]', error);
      throw new InternalServerErrorException('Something went wrong while fetching user');
    }
  }

  async create(data: CreateUserDto){
    try {
    
      return await this.prisma.user.create({ data });
    
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
