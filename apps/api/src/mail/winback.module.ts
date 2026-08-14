import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingModule } from '../billing/billing.module';
import { MailModule } from './mail.module';
import { WinBackService } from './winback.service';

@Module({
  imports: [BillingModule, MailModule],
  providers: [WinBackService, PrismaService],
})
export class WinBackModule {}
