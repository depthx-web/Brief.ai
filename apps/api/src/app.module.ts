import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConversionModule,
    PasswordModule,
    AiModule,
    AuthModule,
    LibraryModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
