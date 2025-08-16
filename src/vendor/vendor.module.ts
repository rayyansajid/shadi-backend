import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGuard } from 'src/auth/guards/roles.guard'; 

@Module({
  controllers: [VendorController],
  providers: [VendorService, PrismaService, RolesGuard],
})
export class VendorModule {}
