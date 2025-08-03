import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import {PrismaModule} from './prisma/prisma.module'

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
@Module({
  imports: [PrismaModule],
})
export class AppModule {}
