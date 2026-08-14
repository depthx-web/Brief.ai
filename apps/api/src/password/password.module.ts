import { Module } from '@nestjs/common';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PasswordController],
  providers: [PasswordService, PrismaService],
})
export class PasswordModule {}
