import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ConversionModule } from './conversion/conversion.module';
import { PasswordModule } from './password/password.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { LibraryModule } from './library/library.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global default: 60 requests/minute per IP. AI endpoints override this
    // with a tighter limit (see AiController) since each call costs money.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ConversionModule,
    PasswordModule,
    AiModule,
    AuthModule,
    LibraryModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
